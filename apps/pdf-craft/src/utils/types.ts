export type Faq = {
  title: string;
  content: string;
  id: string;
  _createdAt: string;
};

export type PricingOption = {
  id: string;
  productName: string;
  price: number; // in cents
  credits: number;
  description: string;
};

export type Operation = {
  id: string;
  title: string;
  detail: string;
  creditCost: number;
  active: boolean;
  actionLabel: string;
  actionRoute: string;
  iconKey: string;
  sortOrder: number;
};
