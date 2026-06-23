export type Role = "buyer" | "seller" | "admin";

export type OrderStatus =
  | "draft" | "submitted" | "sourcing" | "locked"
  | "debt_active" | "cleared" | "cancelled";

export type RelationshipStatus = "pending" | "approved" | "denied";
export type ApprovalStatus    = "pending" | "approved" | "rejected";
export type Availability      = "available" | "can_be_sourced" | "not_available";

// ── Date helpers ───────────────────────────────────────────────────────────────

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-KE", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-KE", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-KE", {
    hour: "2-digit", minute: "2-digit",
  });
}

// ── Sellers ────────────────────────────────────────────────────────────────────

export const SELLERS = [
  {
    id: "s1",
    slug: "eastleigh-phone-hub",
    storeName: "Eastleigh Phone Hub",
    description: "Premium phone accessories. Direct imports from Shenzhen.",
    location: "Nairobi, Eastleigh",
    approvalStatus: "approved" as ApprovalStatus,
    whatsapp: "+254700000001",
    mpesa: "0700000001",
    categories: ["Screen Protectors", "Phone Covers", "Chargers", "Cables"],
    joinedDate: "2025-11-10T09:00:00Z",
  },
  {
    id: "s2",
    slug: "soma-tech-supplies",
    storeName: "Soma Tech Supplies",
    description: "Your trusted partner for phone accessories and spare parts.",
    location: "Nairobi, CBD",
    approvalStatus: "approved" as ApprovalStatus,
    whatsapp: "+254700000002",
    mpesa: "0700000002",
    categories: ["Earphones", "Cables"],
    joinedDate: "2025-12-01T11:00:00Z",
  },
  {
    id: "s3",
    slug: "gikomba-accessories",
    storeName: "Gikomba Accessories Co.",
    description: "Competitive prices. Bulk orders welcome.",
    location: "Nairobi, Gikomba",
    approvalStatus: "pending" as ApprovalStatus,
    whatsapp: "+254700000003",
    mpesa: "0700000003",
    categories: ["Phone Covers", "Chargers"],
    joinedDate: "2026-05-28T14:00:00Z",
  },
  {
    id: "s4",
    slug: "kariuki-electronics",
    storeName: "Kariuki Electronics",
    description: "Specialising in Samsung and iPhone accessories.",
    location: "Nairobi, Eastleigh",
    approvalStatus: "rejected" as ApprovalStatus,
    rejectionNote: "Business registration documents could not be verified.",
    whatsapp: "+254700000004",
    mpesa: "0700000004",
    categories: ["Screen Protectors"],
    joinedDate: "2026-06-01T10:00:00Z",
  },
];

// ── Relationships ──────────────────────────────────────────────────────────────

export const RELATIONSHIPS = [
  { id: "r1", buyerId: "b1", sellerId: "s1", status: "approved" as RelationshipStatus, requestedAt: "2026-01-15T08:30:00Z", resolvedAt: "2026-01-16T09:00:00Z" },
  { id: "r2", buyerId: "b1", sellerId: "s2", status: "pending"  as RelationshipStatus, requestedAt: "2026-06-03T15:00:00Z", resolvedAt: null },
  { id: "r3", buyerId: "b1", sellerId: "s3", status: "denied"   as RelationshipStatus, requestedAt: "2026-05-20T10:00:00Z", resolvedAt: "2026-05-21T11:00:00Z" },
];

// ── Categories & Subcategories ─────────────────────────────────────────────────

export interface Subcategory { id: string; name: string; slug: string; }
export interface Category    { id: string; name: string; slug: string; subcategories: Subcategory[]; }

export const CATEGORIES: Category[] = [
  {
    id: "cat1", name: "Screen Protectors", slug: "screen-protectors",
    subcategories: [
      { id: "sc1a", name: "3D Tempered Glass",   slug: "3d-tempered-glass" },
      { id: "sc1b", name: "Privacy Glass",        slug: "privacy-glass"    },
      { id: "sc1c", name: "Mirror Glass",         slug: "mirror-glass"     },
      { id: "sc1d", name: "Hydrogel / Nano Film", slug: "hydrogel-film"    },
      { id: "sc1e", name: "Matte Anti-glare",     slug: "matte-anti-glare" },
    ],
  },
  {
    id: "cat2", name: "Phone Covers", slug: "phone-covers",
    subcategories: [
      { id: "sc2a", name: "iPhone Cases",              slug: "iphone-cases"       },
      { id: "sc2b", name: "Samsung Galaxy A Series",   slug: "samsung-a-series"   },
      { id: "sc2c", name: "Samsung Galaxy S Series",   slug: "samsung-s-series"   },
      { id: "sc2d", name: "Tecno / Infinix / Itel",    slug: "tecno-infinix-itel" },
      { id: "sc2e", name: "Universal / Mixed Models",  slug: "universal-covers"   },
    ],
  },
  {
    id: "cat3", name: "Chargers", slug: "chargers",
    subcategories: [
      { id: "sc3a", name: "Type-C Fast Chargers",         slug: "type-c-chargers"    },
      { id: "sc3b", name: "iPhone / Lightning Chargers",  slug: "lightning-chargers" },
      { id: "sc3c", name: "Wireless Chargers",            slug: "wireless-chargers"  },
      { id: "sc3d", name: "Car Chargers",                 slug: "car-chargers"       },
    ],
  },
  {
    id: "cat4", name: "Cables", slug: "cables",
    subcategories: [
      { id: "sc4a", name: "USB-C to USB-C",   slug: "usbc-to-usbc"     },
      { id: "sc4b", name: "USB-A to USB-C",   slug: "usba-to-usbc"     },
      { id: "sc4c", name: "Lightning Cables", slug: "lightning-cables" },
      { id: "sc4d", name: "Micro-USB Cables", slug: "micro-usb-cables" },
    ],
  },
  {
    id: "cat5", name: "Earphones", slug: "earphones",
    subcategories: [
      { id: "sc5a", name: "Wired Earphones",    slug: "wired-earphones"    },
      { id: "sc5b", name: "Wireless Earbuds",   slug: "wireless-earbuds"   },
      { id: "sc5c", name: "Neckband Earphones", slug: "neckband-earphones" },
    ],
  },
];

// ── Products ───────────────────────────────────────────────────────────────────

export interface Product {
  id: string; sellerId: string; categoryId: string; subcategoryId: string;
  name: string; description: string;
  packPrice: number;   // price for the full pack
  unitCount: number;   // how many pieces in the pack
  packSize: string;    // display string e.g. "Pack of 10"
  stockQuantity: number; // NEVER shown to buyers
  availability: Availability;
  imageUrl: string | null;
  addedAt: string;
}

/** Price per single piece */
export function unitPrice(p: Product): number {
  return Math.round(p.packPrice / p.unitCount);
}

export const PRODUCTS: Product[] = [
  // ── Screen Protectors — 3D Tempered ────────────────────────────────────────
  { id:"p1",  sellerId:"s1", categoryId:"cat1", subcategoryId:"sc1a", name:"3D Curved Tempered Glass — Samsung A54",   description:"Full-cover 3D glass. High clarity.",             packPrice:1800, unitCount:10, packSize:"Pack of 10", stockQuantity:40, availability:"available",      imageUrl:null, addedAt:"2026-01-10T08:00:00Z" },
  { id:"p2",  sellerId:"s1", categoryId:"cat1", subcategoryId:"sc1a", name:"3D Curved Tempered Glass — iPhone 14 Pro", description:"Oleophobic coating, 9H hardness.",               packPrice:2200, unitCount:10, packSize:"Pack of 10", stockQuantity:25, availability:"available",      imageUrl:null, addedAt:"2026-01-10T08:05:00Z" },
  { id:"p3",  sellerId:"s1", categoryId:"cat1", subcategoryId:"sc1a", name:"3D Tempered Glass — Samsung S23",          description:"Edge-to-edge protection.",                      packPrice:2400, unitCount:10, packSize:"Pack of 10", stockQuantity: 0, availability:"can_be_sourced", imageUrl:null, addedAt:"2026-01-10T08:10:00Z" },
  // ── Screen Protectors — Privacy ────────────────────────────────────────────
  { id:"p4",  sellerId:"s1", categoryId:"cat1", subcategoryId:"sc1b", name:"Privacy Screen Protector — iPhone 14",    description:"Blocks side viewing. Clear front view.",        packPrice:2500, unitCount:10, packSize:"Pack of 10", stockQuantity:15, availability:"available",      imageUrl:null, addedAt:"2026-01-11T09:00:00Z" },
  { id:"p5",  sellerId:"s1", categoryId:"cat1", subcategoryId:"sc1b", name:"Privacy Glass — Samsung A34",             description:"Anti-spy privacy coating.",                     packPrice:2000, unitCount:10, packSize:"Pack of 10", stockQuantity: 0, availability:"can_be_sourced", imageUrl:null, addedAt:"2026-01-11T09:05:00Z" },
  // ── Screen Protectors — Mirror ─────────────────────────────────────────────
  { id:"p6",  sellerId:"s1", categoryId:"cat1", subcategoryId:"sc1c", name:"Mirror Screen Protector — Mixed Models",  description:"Reflective mirror finish. Assorted models.",   packPrice:1500, unitCount:20, packSize:"Pack of 20", stockQuantity:30, availability:"available",      imageUrl:null, addedAt:"2026-01-12T10:00:00Z" },
  // ── Screen Protectors — Hydrogel ───────────────────────────────────────────
  { id:"p7",  sellerId:"s1", categoryId:"cat1", subcategoryId:"sc1d", name:"Hydrogel Film — Universal Mixed",         description:"Self-healing nano film. Flexible.",             packPrice:1600, unitCount:20, packSize:"Pack of 20", stockQuantity:20, availability:"available",      imageUrl:null, addedAt:"2026-01-12T10:10:00Z" },
  // ── Phone Covers — iPhone ──────────────────────────────────────────────────
  { id:"p8",  sellerId:"s1", categoryId:"cat2", subcategoryId:"sc2a", name:"iPhone 14 / 14 Pro Silicone Case",        description:"Soft silicone. Mixed colours.",                 packPrice:2800, unitCount:12, packSize:"Pack of 12", stockQuantity:36, availability:"available",      imageUrl:null, addedAt:"2026-01-15T08:00:00Z" },
  { id:"p9",  sellerId:"s1", categoryId:"cat2", subcategoryId:"sc2a", name:"iPhone 15 / 15 Pro Back Cover",           description:"Matte finish. Shockproof corners.",             packPrice:3200, unitCount:12, packSize:"Pack of 12", stockQuantity:24, availability:"available",      imageUrl:null, addedAt:"2026-01-15T08:05:00Z" },
  { id:"p10", sellerId:"s1", categoryId:"cat2", subcategoryId:"sc2a", name:"iPhone 13 Clear Case",                   description:"Transparent hard back.",                        packPrice:1800, unitCount:10, packSize:"Pack of 10", stockQuantity: 0, availability:"can_be_sourced", imageUrl:null, addedAt:"2026-01-15T08:10:00Z" },
  // ── Phone Covers — Samsung A ───────────────────────────────────────────────
  { id:"p11", sellerId:"s1", categoryId:"cat2", subcategoryId:"sc2b", name:"Samsung Galaxy A54 Cover",               description:"TPU case. Mixed colours.",                      packPrice:2200, unitCount:12, packSize:"Pack of 12", stockQuantity:24, availability:"available",      imageUrl:null, addedAt:"2026-01-16T08:00:00Z" },
  { id:"p12", sellerId:"s1", categoryId:"cat2", subcategoryId:"sc2b", name:"Samsung Galaxy A34 Cover",               description:"Back cover. Assorted colours.",                 packPrice:2000, unitCount:12, packSize:"Pack of 12", stockQuantity:18, availability:"available",      imageUrl:null, addedAt:"2026-01-16T08:05:00Z" },
  { id:"p13", sellerId:"s1", categoryId:"cat2", subcategoryId:"sc2b", name:"Samsung Galaxy A14 Cover",               description:"Slim protective back cover.",                   packPrice:1600, unitCount:15, packSize:"Pack of 15", stockQuantity: 0, availability:"can_be_sourced", imageUrl:null, addedAt:"2026-01-16T08:10:00Z" },
  // ── Phone Covers — Samsung S ───────────────────────────────────────────────
  { id:"p14", sellerId:"s1", categoryId:"cat2", subcategoryId:"sc2c", name:"Samsung Galaxy S23 Case",                description:"Premium hard back, mixed colours.",             packPrice:3000, unitCount:10, packSize:"Pack of 10", stockQuantity: 0, availability:"can_be_sourced", imageUrl:null, addedAt:"2026-01-17T09:00:00Z" },
  // ── Phone Covers — Tecno/Infinix ───────────────────────────────────────────
  { id:"p15", sellerId:"s1", categoryId:"cat2", subcategoryId:"sc2d", name:"Tecno Spark 20 Cover",                   description:"TPU back cover. Mixed colours.",                packPrice:1400, unitCount:15, packSize:"Pack of 15", stockQuantity:30, availability:"available",      imageUrl:null, addedAt:"2026-01-18T09:00:00Z" },
  { id:"p16", sellerId:"s1", categoryId:"cat2", subcategoryId:"sc2d", name:"Infinix Hot 40 Cover",                   description:"Protective TPU case.",                          packPrice:1400, unitCount:15, packSize:"Pack of 15", stockQuantity: 0, availability:"can_be_sourced", imageUrl:null, addedAt:"2026-01-18T09:05:00Z" },
  // ── Chargers — Type-C ─────────────────────────────────────────────────────
  { id:"p17", sellerId:"s1", categoryId:"cat3", subcategoryId:"sc3a", name:"25W Type-C Fast Charger Brick",          description:"Compatible with Samsung, Tecno, Infinix.",      packPrice:3200, unitCount:5,  packSize:"Pack of 5",  stockQuantity:10, availability:"available",      imageUrl:null, addedAt:"2026-01-20T10:00:00Z" },
  { id:"p18", sellerId:"s1", categoryId:"cat3", subcategoryId:"sc3a", name:"65W Type-C GaN Charger",                description:"Multi-port fast charger.",                      packPrice:4500, unitCount:3,  packSize:"Pack of 3",  stockQuantity: 0, availability:"can_be_sourced", imageUrl:null, addedAt:"2026-01-20T10:05:00Z" },
  // ── Chargers — Lightning ──────────────────────────────────────────────────
  { id:"p19", sellerId:"s1", categoryId:"cat3", subcategoryId:"sc3b", name:"20W iPhone Lightning Charger",           description:"Fast charge for iPhone 11–15.",                 packPrice:3500, unitCount:5,  packSize:"Pack of 5",  stockQuantity:15, availability:"available",      imageUrl:null, addedAt:"2026-01-21T09:00:00Z" },
  // ── Chargers — Wireless ───────────────────────────────────────────────────
  { id:"p20", sellerId:"s1", categoryId:"cat3", subcategoryId:"sc3c", name:"15W Wireless Charging Pad",              description:"Qi-certified fast wireless charging.",          packPrice:5400, unitCount:3,  packSize:"Pack of 3",  stockQuantity: 0, availability:"can_be_sourced", imageUrl:null, addedAt:"2026-01-21T09:10:00Z" },
  // ── Chargers — Car ────────────────────────────────────────────────────────
  { id:"p21", sellerId:"s1", categoryId:"cat3", subcategoryId:"sc3d", name:"Dual USB Car Charger",                   description:"12V/24V compatible. 2.4A output.",              packPrice:2000, unitCount:5,  packSize:"Pack of 5",  stockQuantity:20, availability:"available",      imageUrl:null, addedAt:"2026-01-22T08:00:00Z" },
  // ── Cables ────────────────────────────────────────────────────────────────
  { id:"p22", sellerId:"s1", categoryId:"cat4", subcategoryId:"sc4a", name:"USB-C to USB-C Braided Cable 1m",        description:"65W fast charging, nylon braided.",             packPrice:1500, unitCount:10, packSize:"Pack of 10", stockQuantity:50, availability:"available",      imageUrl:null, addedAt:"2026-01-23T08:00:00Z" },
  { id:"p23", sellerId:"s1", categoryId:"cat4", subcategoryId:"sc4c", name:"Lightning Cable 1m",                     description:"For iPhone 5–14. Durable braided.",             packPrice:2000, unitCount:10, packSize:"Pack of 10", stockQuantity:20, availability:"available",      imageUrl:null, addedAt:"2026-01-23T08:05:00Z" },
  { id:"p24", sellerId:"s1", categoryId:"cat4", subcategoryId:"sc4d", name:"Micro-USB Cable 1m",                     description:"For older Android phones.",                     packPrice: 900, unitCount:10, packSize:"Pack of 10", stockQuantity:30, availability:"available",      imageUrl:null, addedAt:"2026-01-23T08:10:00Z" },
  // ── Earphones ─────────────────────────────────────────────────────────────
  { id:"p25", sellerId:"s1", categoryId:"cat5", subcategoryId:"sc5a", name:"Wired Earphones 3.5mm with Mic",         description:"In-ear stereo. Works with all phones.",         packPrice:1200, unitCount:10, packSize:"Pack of 10", stockQuantity:25, availability:"available",      imageUrl:null, addedAt:"2026-01-24T09:00:00Z" },
  { id:"p26", sellerId:"s1", categoryId:"cat5", subcategoryId:"sc5b", name:"Wireless Earbuds TWS",                   description:"Bluetooth 5.3. Touch controls.",                packPrice:3800, unitCount:1,  packSize:"1 pair",     stockQuantity: 0, availability:"can_be_sourced", imageUrl:null, addedAt:"2026-01-24T09:05:00Z" },
  { id:"p27", sellerId:"s1", categoryId:"cat5", subcategoryId:"sc5c", name:"Bluetooth Neckband Earphones",           description:"Magnetic clasp. 12h battery.",                  packPrice:2800, unitCount:1,  packSize:"1 pair",     stockQuantity: 0, availability:"can_be_sourced", imageUrl:null, addedAt:"2026-01-24T09:10:00Z" },
];

// ── Orders ─────────────────────────────────────────────────────────────────────

export interface OrderItem {
  productId: string | null;
  name: string;
  quantity: number;         // number of packs
  unitPrice: number;        // price per pack at submission
  subtotal: number;
  isSourcing?: boolean;
}

export interface LedgerEntry {
  id: string; amount: number; method: string;
  reference: string; note: string; recordedAt: string;
}

export interface Order {
  id: string; slug: string;
  buyerId: string; buyerName: string; buyerLocation: string;
  sellerId: string; sellerName: string;
  status: OrderStatus;
  draftTotal: number; finalTotal: number | null;
  buyerNotes: string; sourcingNotes: string;
  createdAt: string;
  submittedAt: string | null;
  sourcingStartedAt: string | null;
  lockedAt: string | null;
  items: OrderItem[];
  ledgerEntries: LedgerEntry[];
}

export const ORDERS: Order[] = [
  {
    id: "ord1", slug: "ord1-amani-waweru",
    buyerId: "b1", buyerName: "Amani Waweru", buyerLocation: "Nairobi, Eastleigh",
    sellerId: "s1", sellerName: "Eastleigh Phone Hub",
    status: "submitted",
    draftTotal: 9700, finalTotal: null,
    buyerNotes: "Please call before delivery.",
    sourcingNotes: "I need the USB-C cable in white only if available. Otherwise any colour.",
    createdAt: "2026-06-03T09:15:00Z",
    submittedAt: "2026-06-03T10:30:00Z",
    sourcingStartedAt: null, lockedAt: null,
    items: [
      { productId:"p8",  name:"iPhone 14 / 14 Pro Silicone Case (Pack of 12)", quantity:2, unitPrice:2800, subtotal:5600 },
      { productId:"p22", name:"USB-C to USB-C Braided Cable 1m (Pack of 10)",  quantity:1, unitPrice:1500, subtotal:1500 },
      { productId:"p25", name:"Wired Earphones 3.5mm with Mic (Pack of 10)",   quantity:1, unitPrice:1200, subtotal:1200 },
      { productId:null,  name:"Custom request: iPhone 15 cases (to be sourced)", quantity:1, unitPrice:0, subtotal:0, isSourcing:true },
    ],
    ledgerEntries: [],
  },
  {
    id: "ord2", slug: "ord2-grace-muthoni",
    buyerId: "b2", buyerName: "Grace Muthoni", buyerLocation: "Mombasa, Old Town",
    sellerId: "s1", sellerName: "Eastleigh Phone Hub",
    status: "debt_active",
    draftTotal: 8800, finalTotal: 9500,
    buyerNotes: "", sourcingNotes: "",
    createdAt: "2026-05-27T14:00:00Z",
    submittedAt: "2026-05-28T09:00:00Z",
    sourcingStartedAt: "2026-05-28T11:30:00Z",
    lockedAt: "2026-05-29T10:00:00Z",
    items: [
      { productId:"p1",  name:"3D Curved Tempered Glass — Samsung A54 (Pack of 10)", quantity:3, unitPrice:1800, subtotal:5400 },
      { productId:"p11", name:"Samsung Galaxy A54 Cover (Pack of 12)",               quantity:2, unitPrice:2200, subtotal:4400 },
    ],
    ledgerEntries: [
      { id:"le1", amount:5000, method:"mpesa", reference:"QAZ1234567", note:"First instalment", recordedAt:"2026-05-30T11:00:00Z" },
    ],
  },
  {
    id: "ord3", slug: "ord3-peter-kamau",
    buyerId: "b3", buyerName: "Peter Kamau", buyerLocation: "Kisumu, Market",
    sellerId: "s1", sellerName: "Eastleigh Phone Hub",
    status: "cleared",
    draftTotal: 7300, finalTotal: 7300,
    buyerNotes: "", sourcingNotes: "",
    createdAt: "2026-05-09T08:00:00Z",
    submittedAt: "2026-05-10T08:30:00Z",
    sourcingStartedAt: "2026-05-10T10:00:00Z",
    lockedAt: "2026-05-11T09:00:00Z",
    items: [
      { productId:"p9",  name:"iPhone 15 / 15 Pro Back Cover (Pack of 12)", quantity:1, unitPrice:3200, subtotal:3200 },
      { productId:"p17", name:"25W Type-C Fast Charger Brick (Pack of 5)",  quantity:1, unitPrice:3200, subtotal:3200 },
      { productId:"p25", name:"Wired Earphones 3.5mm with Mic (Pack of 10)", quantity:1, unitPrice:1200, subtotal:1200 },
    ],
    ledgerEntries: [
      { id:"le2", amount:7300, method:"mpesa", reference:"XYZ9876543", note:"Full payment", recordedAt:"2026-05-12T14:00:00Z" },
    ],
  },
  {
    id: "ord4", slug: "ord4-faith-njeri",
    buyerId: "b4", buyerName: "Faith Njeri", buyerLocation: "Kilifi, Town",
    sellerId: "s1", sellerName: "Eastleigh Phone Hub",
    status: "sourcing",
    draftTotal: 13200, finalTotal: null,
    buyerNotes: "Urgent — needed by Friday.",
    sourcingNotes: "Need the Samsung A54 covers in black only.",
    createdAt: "2026-06-04T07:00:00Z",
    submittedAt: "2026-06-04T07:45:00Z",
    sourcingStartedAt: "2026-06-04T09:00:00Z",
    lockedAt: null,
    items: [
      { productId:"p11", name:"Samsung Galaxy A54 Cover (Pack of 12)",               quantity:3, unitPrice:2200, subtotal:6600 },
      { productId:"p1",  name:"3D Curved Tempered Glass — Samsung A54 (Pack of 10)", quantity:2, unitPrice:1800, subtotal:3600 },
      { productId:"p25", name:"Wired Earphones 3.5mm with Mic (Pack of 10)",         quantity:2, unitPrice:1200, subtotal:2400 },
    ],
    ledgerEntries: [],
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

export function getSellerBySlug(slug: string) {
  return SELLERS.find((s) => s.slug === slug || s.id === slug);
}

export function getOrderBySlug(slug: string): Order | undefined {
  return ORDERS.find((o) => o.slug === slug || o.id === slug);
}

export function getOrdersByBuyer(buyerId: string)   { return ORDERS.filter((o) => o.buyerId  === buyerId);  }
export function getOrdersBySeller(sellerId: string) { return ORDERS.filter((o) => o.sellerId === sellerId); }
export function getProductsBySeller(sid: string)    { return PRODUCTS.filter((p) => p.sellerId === sid);    }

export function getRelationshipStatus(buyerId: string, sellerId: string): RelationshipStatus | null {
  return RELATIONSHIPS.find((r) => r.buyerId === buyerId && r.sellerId === sellerId)?.status ?? null;
}

export function remainingBalance(order: Order): number {
  if (!order.finalTotal) return 0;
  return order.finalTotal - order.ledgerEntries.reduce((s, e) => s + e.amount, 0);
}

export function formatKES(amount: number): string {
  return `KES ${amount.toLocaleString("en-KE")}`;
}

export function availabilityLabel(a: Availability): string {
  return { available:"Available", can_be_sourced:"Can be sourced", not_available:"Not available" }[a];
}

export const PENDING_SELLERS = SELLERS.filter((s) => s.approvalStatus === "pending");
