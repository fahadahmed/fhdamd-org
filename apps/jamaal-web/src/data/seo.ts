import { pricing } from "./content";

export interface SeoOptions {
  /** Absolute site origin, e.g. https://jamaal.app */
  origin: string;
  description: string;
  launched: boolean;
}

/** Plain monetary amount from a display price like "$24.99". */
function amount(price: string): string {
  return price.replace(/[^0-9.]/g, "");
}

/**
 * schema.org SoftwareApplication for the home page. Offers are only listed
 * once the app is on sale: before launch there is nothing to buy, and listing
 * prices early would promise something that isn't available.
 */
export function softwareApplicationJsonLd({ origin, description, launched }: SeoOptions) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Jamaal",
    alternateName: "جمال",
    description,
    url: `${origin}/`,
    image: `${origin}/og-image.png`,
    applicationCategory: "LifestyleApplication",
    operatingSystem: "iOS, iPadOS, macOS",
    publisher: { "@type": "Organization", name: "fhdamd", url: "https://fhdamd.dev" },
    ...(launched && {
      offers: pricing.plans.map((plan) => ({
        "@type": "Offer",
        name: plan.name,
        price: amount(plan.price),
        priceCurrency: "USD",
      })),
    }),
  };
}
