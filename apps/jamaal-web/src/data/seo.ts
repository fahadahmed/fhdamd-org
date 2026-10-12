export interface SeoOptions {
  /** Absolute site origin, e.g. https://jamaal.app */
  origin: string;
  description: string;
  launched: boolean;
  /** The plans on sale, from the pricing in DatoCMS. */
  plans: readonly { offerName: string; price: string }[];
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
export function softwareApplicationJsonLd({ origin, description, launched, plans }: SeoOptions) {
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
      offers: plans.map((plan) => ({
        "@type": "Offer",
        name: plan.offerName,
        price: amount(plan.price),
        priceCurrency: "USD",
      })),
    }),
  };
}

interface ArticleOptions {
  origin: string;
  slug: string;
  headline: string;
  description: string;
  /** ISO date. */
  datePublished: string;
  authorName: string;
  /** Absolute image URL, if the article has its own. */
  image?: string;
}

/** Article structured data for a Journal post. */
export function articleJsonLd({ origin, slug, headline, description, datePublished, authorName, image }: ArticleOptions) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    datePublished,
    mainEntityOfPage: `${origin}/journal/${slug}`,
    image: image ?? `${origin}/og-image.png`,
    author: { "@type": "Person", name: authorName },
    publisher: { "@type": "Organization", name: "fhdamd", url: "https://fhdamd.dev" },
  };
}
