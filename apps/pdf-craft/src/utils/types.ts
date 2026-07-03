export type Faq = {
  id: string;
  title: string;
  content: string;
  _createdAt: string;
  area: string;
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

export type Testimonial = {
  id: string;
  name: string;
  detail: string;
  title: string;
  _createdAt: string;
};

export type SectionHeader = {
  key: string;
  eyebrow: string;
  title: string;
  intro?: string;
};

export type HeroData = {
  key: string;
  eyebrow: string;
  heading: string;
  subheading: string;
  body: string;
  chips: string[] | null;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
};

export type Step = {
  id: string;
  number: string;
  title: string;
  body: string;
};
