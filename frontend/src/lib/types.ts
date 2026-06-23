export type Role = "buyer" | "seller";
export type Step = "role" | "account" | "details" | "done";

export interface AccountFields {
  fullName: string;
  phone: string;
  password: string;
}

export interface BuyerFields {
  location: string;
  mainSupplier: string;
  businessType: string;
}

export interface SellerFields {
  shopName: string;
  location: string;
  categories: string[];
}

export interface WizardState {
  role: Role | null;
  step: Step;
  account: AccountFields;
  buyer: BuyerFields;
  seller: SellerFields;
  loading: boolean;
  apiErr: string;
  offline: boolean;
}
