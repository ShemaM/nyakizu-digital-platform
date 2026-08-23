"use client";

/**
 * offline-db.ts
 *
 * IndexedDB wrapper for offline order drafts and sync queue.
 * When the user is offline, order drafts are saved here.
 * When back online, queued orders can be synced to the server.
 */

const DB_NAME = "nyakizu-offline";
const DB_VERSION = 1;
const STORE_DRAFTS = "drafts";
const STORE_QUEUE = "syncQueue";

interface DraftData {
  sellerId: number;
  items: { product_id?: number; custom_name?: string; quantity: number }[];
  buyer_notes?: string;
  updatedAt: number;
}

interface QueuedOrder {
  id: string;
  sellerId: number;
  items: { product_id?: number; custom_name?: string; quantity: number }[];
  buyer_notes?: string;
  createdAt: number;
  status: "pending" | "syncing" | "synced" | "failed";
  error?: string;
  // How many times this has failed in a row. Only read by automatic
  // (connection-restored) retries, to stop hammering an order that keeps
  // failing for a real reason — a manual "Send now" tap always tries
  // regardless, since that's the user explicitly asking again.
  retryCount?: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_DRAFTS)) {
        db.createObjectStore(STORE_DRAFTS, { keyPath: "sellerId" });
      }
      if (!db.objectStoreNames.contains(STORE_QUEUE)) {
        db.createObjectStore(STORE_QUEUE, { keyPath: "id" });
      }
    };
  });
}

export const offlineDB = {
  // ── Drafts ──────────────────────────────────────────────────────────────────

  async saveDraft(sellerId: number, data: DraftData): Promise<void> {
    const db = await openDB();
    const tx = db.transaction(STORE_DRAFTS, "readwrite");
    const store = tx.objectStore(STORE_DRAFTS);
    await new Promise<void>((resolve, reject) => {
      const req = store.put({ ...data, sellerId, updatedAt: Date.now() });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    db.close();
  },

  async getDraft(sellerId: number): Promise<DraftData | null> {
    const db = await openDB();
    const tx = db.transaction(STORE_DRAFTS, "readonly");
    const store = tx.objectStore(STORE_DRAFTS);
    const result = await new Promise<DraftData | undefined>((resolve, reject) => {
      const req = store.get(sellerId);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return result ?? null;
  },

  async deleteDraft(sellerId: number): Promise<void> {
    const db = await openDB();
    const tx = db.transaction(STORE_DRAFTS, "readwrite");
    const store = tx.objectStore(STORE_DRAFTS);
    await new Promise<void>((resolve, reject) => {
      const req = store.delete(sellerId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    db.close();
  },

  // ── Sync Queue ──────────────────────────────────────────────────────────────

  async queueOrder(data: Omit<QueuedOrder, "id" | "createdAt" | "status">): Promise<string> {
    const id = `order-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const order: QueuedOrder = {
      ...data,
      id,
      createdAt: Date.now(),
      status: "pending",
    };
    const db = await openDB();
    const tx = db.transaction(STORE_QUEUE, "readwrite");
    const store = tx.objectStore(STORE_QUEUE);
    await new Promise<void>((resolve, reject) => {
      const req = store.put(order);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    db.close();
    return id;
  },

  async getQueuedOrders(): Promise<QueuedOrder[]> {
    const db = await openDB();
    const tx = db.transaction(STORE_QUEUE, "readonly");
    const store = tx.objectStore(STORE_QUEUE);
    const result = await new Promise<QueuedOrder[]>((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result ?? []);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return result.sort((a, b) => b.createdAt - a.createdAt);
  },

  async updateQueuedStatus(id: string, status: QueuedOrder["status"], error?: string): Promise<void> {
    const db = await openDB();
    const tx = db.transaction(STORE_QUEUE, "readwrite");
    const store = tx.objectStore(STORE_QUEUE);
    const existing = await new Promise<QueuedOrder | undefined>((resolve, reject) => {
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    if (existing) {
      existing.status = status;
      existing.error = status === "failed" ? error : undefined;
      existing.retryCount = status === "failed" ? (existing.retryCount ?? 0) + 1 : 0;
      await new Promise<void>((resolve, reject) => {
        const req = store.put(existing);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    }
    db.close();
  },

  async removeQueued(id: string): Promise<void> {
    const db = await openDB();
    const tx = db.transaction(STORE_QUEUE, "readwrite");
    const store = tx.objectStore(STORE_QUEUE);
    await new Promise<void>((resolve, reject) => {
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    db.close();
  },

  // ── Logout ──────────────────────────────────────────────────────────────────

  /**
   * Wipes drafts and the sync queue. This app is used from shared/kiosk-style
   * devices (see sw-src/sw.ts), so a buyer's unsynced draft list can't be
   * allowed to sit in IndexedDB — readable by whoever logs in next on the
   * same device — after they've logged out. Called from auth-context's
   * logout(); any not-yet-synced order in the queue at that point is lost,
   * which is the correct trade-off for this threat model.
   */
  async clearAll(): Promise<void> {
    const db = await openDB();
    const tx = db.transaction([STORE_DRAFTS, STORE_QUEUE], "readwrite");
    tx.objectStore(STORE_DRAFTS).clear();
    tx.objectStore(STORE_QUEUE).clear();
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  },
};

export type { DraftData, QueuedOrder };
