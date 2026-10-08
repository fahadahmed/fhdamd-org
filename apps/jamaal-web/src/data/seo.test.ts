import { describe, expect, it } from "vitest";
import { softwareApplicationJsonLd } from "./seo";

const options = { origin: "https://jamaal.app", description: "A calm daily planner." };

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
      { "@type": "Offer", name: "Yearly", price: "24.99", priceCurrency: "USD" },
      { "@type": "Offer", name: "Monthly", price: "2.99", priceCurrency: "USD" },
    ]);
  });

  it("serialises to valid JSON", () => {
    expect(() => JSON.parse(JSON.stringify(softwareApplicationJsonLd({ ...options, launched: true })))).not.toThrow();
  });
});
