import { describe, expect, it } from "vitest";
import { articleJsonLd, breadcrumbJsonLd, organizationJsonLd, softwareApplicationJsonLd, websiteJsonLd } from "./seo";

const plans = [
  { offerName: "Monthly", price: "$2.99" },
  { offerName: "Yearly", price: "$24.99" },
];
const options = { origin: "https://jamaal.app", description: "A calm daily planner.", plans };

describe("softwareApplicationJsonLd", () => {
  it("describes the app for iPhone, iPad and Mac", () => {
    const data = softwareApplicationJsonLd({ ...options, launched: false });
    expect(data["@type"]).toBe("SoftwareApplication");
    expect(data.name).toBe("Jamaal");
    expect(data.operatingSystem).toBe("iOS, iPadOS, macOS");
    expect(data.url).toBe("https://jamaal.app/");
    expect(data.image).toBe("https://jamaal.app/og-image.png");
    expect(data.description).toBe("A calm daily planner.");
  });

  it("lists no offers before launch, when there is nothing to buy", () => {
    expect(softwareApplicationJsonLd({ ...options, launched: false })).not.toHaveProperty("offers");
  });

  it("lists the yearly and monthly prices in USD once launched", () => {
    const data = softwareApplicationJsonLd({ ...options, launched: true }) as { offers: unknown };
    expect(data.offers).toEqual([
      { "@type": "Offer", name: "Monthly", price: "2.99", priceCurrency: "USD" },
      { "@type": "Offer", name: "Yearly", price: "24.99", priceCurrency: "USD" },
    ]);
  });

  it("serialises to valid JSON", () => {
    expect(() => JSON.parse(JSON.stringify(softwareApplicationJsonLd({ ...options, launched: true })))).not.toThrow();
  });
});

describe("articleJsonLd", () => {
  const base = { origin: "https://jamaal.app", slug: "hello", headline: "Hello", description: "Short", datePublished: "2026-10-08", authorName: "Fahad Ahmed" };

  it("describes the article, its author and where it lives", () => {
    const data = articleJsonLd(base);
    expect(data["@type"]).toBe("Article");
    expect(data.mainEntityOfPage).toBe("https://jamaal.app/journal/hello");
    expect(data.author).toEqual({ "@type": "Person", name: "Fahad Ahmed" });
    expect(data.datePublished).toBe("2026-10-08");
  });

  it("uses the site image unless the article has its own", () => {
    expect(articleJsonLd(base).image).toBe("https://jamaal.app/og-image.png");
    expect(articleJsonLd({ ...base, image: "https://www.datocms-assets.com/x.png" }).image).toBe("https://www.datocms-assets.com/x.png");
  });

  it("serialises to valid JSON", () => {
    expect(() => JSON.parse(JSON.stringify(articleJsonLd(base)))).not.toThrow();
  });
});

describe("organizationJsonLd and websiteJsonLd", () => {
  it("names the organisation, its logo and the company behind it", () => {
    const data = organizationJsonLd({ origin: "https://jamaal.app", name: "Jamaal" });
    expect(data).toMatchObject({ "@type": "Organization", name: "Jamaal", url: "https://jamaal.app/", logo: "https://jamaal.app/apple-touch-icon.png" });
    expect(data.parentOrganization.name).toBe("fhdamd");
  });

  it("describes the website", () => {
    expect(websiteJsonLd({ origin: "https://jamaal.app", name: "Jamaal", description: "A planner." })).toMatchObject({ "@type": "WebSite", url: "https://jamaal.app/", inLanguage: "en", description: "A planner." });
  });
});

describe("breadcrumbJsonLd", () => {
  it("numbers each step and gives its full address", () => {
    const data = breadcrumbJsonLd("https://jamaal.app", [
      { name: "Jamaal", path: "/" },
      { name: "Journal", path: "/journal" },
      { name: "An article", path: "/journal/an-article" },
    ]);
    expect(data["@type"]).toBe("BreadcrumbList");
    expect(data.itemListElement.map((i) => [i.position, i.item])).toEqual([
      [1, "https://jamaal.app/"],
      [2, "https://jamaal.app/journal"],
      [3, "https://jamaal.app/journal/an-article"],
    ]);
  });
});
