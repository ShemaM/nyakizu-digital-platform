export const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const PRODUCT_CATEGORIES = [
  "Tempered glass",
  "Phone cases & covers",
  "Chargers & adapters",
  "USB & charging cables",
  "Batteries & power banks",
  "Earphones & earbuds",
  "Memory cards (SD cards)",
  "Phone repair parts",
] as const;

export const BUSINESS_TYPES = [
  "Hawker",
  "Retail shop",
  "Repair shop",
  "Online seller",
] as const;
