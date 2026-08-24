import { defineCollection, z } from "astro:content";
import { glob, file } from "astro/loaders";

const badge = z.object({
  label: z.string(),
  variant: z.enum(["terra", "sage", "neutral"]),
});

const blog = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    dek: z.string(),
    breadcrumbCategory: z.string(),
    date: z.string(),
    /** Closed category set (dev/product/design/architecture) — drives listing/detail badges via BLOG_TAG_LABELS. */
    tags: z.array(z.string()),
    /** Freeform chips shown at the foot of the detail page — distinct from the category badges above. */
    postTags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    relatedSlugs: z.array(z.string()).default([]),
  }),
});

const caseStudies = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/case-studies" }),
  schema: z.object({
    title: z.string(),
    dek: z.string(),
    breadcrumbCategory: z.string(),
    badges: z.array(badge).default([]),
    tags: z.array(z.string()).default([]),
    tag: z.enum(["website", "app", "advisory"]),
    status: z.enum(["published", "comingSoon"]).default("published"),
    client: z.string().optional(),
    location: z.string().optional(),
    industry: z.string().optional(),
    timeline: z.string().optional(),
    offering: z.string().optional(),
    stack: z.array(z.string()).default([]),
    eyebrowMeta: z.string().optional(),
    techBadge: z.string().optional(),
    buildCreditName: z.string().optional(),
    buildCreditRole: z.string().optional(),
    buildCreditBio: z.string().optional(),
    relatedItems: z
      .array(
        z.object({
          badgeLabel: z.string(),
          badgeVariant: z.enum(["terra", "sage", "neutral"]),
          title: z.string(),
          dateLabel: z.string(),
          href: z.string(),
        }),
      )
      .default([]),
  }),
});

const employers = defineCollection({
  loader: file("./src/content/employers.yaml"),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    label: z.string(),
    logo: z.string().optional(),
  }),
});

const clientWork = defineCollection({
  loader: file("./src/content/client-work.yaml"),
  schema: z.object({
    id: z.string(),
    client: z.string(),
    dateRange: z.string(),
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    value: z.string().optional(),
  }),
});

const experience = defineCollection({
  loader: file("./src/content/experience.yaml"),
  schema: z.object({
    id: z.string(),
    company: z.string(),
    period: z.string(),
    role: z.string(),
    description: z.string(),
  }),
});

const skills = defineCollection({
  loader: file("./src/content/skills.yaml"),
  schema: z.object({
    id: z.string(),
    label: z.string(),
    tags: z.array(z.string()),
  }),
});

const products = defineCollection({
  loader: file("./src/content/products.yaml"),
  schema: z.object({
    id: z.string(),
    eyebrow: z.string(),
    name: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    badge: z.object({ label: z.string(), variant: z.enum(["sage", "terra", "neutral"]) }),
    accentColor: z.enum(["terra", "sage", "ink"]),
    iconKey: z.enum(["fileText", "settings"]).optional(),
    jamaalIcon: z.boolean().optional(),
    pricingPills: z.array(z.object({ price: z.string(), label: z.string() })).optional(),
  }),
});

const serviceOfferings = defineCollection({
  loader: file("./src/content/service-offerings.yaml"),
  schema: z.object({
    id: z.string(),
    iconKey: z.enum(["design", "phone", "fileCheck"]),
    eyebrow: z.string(),
    title: z.string(),
    description: z.string(),
    checklist: z.array(z.string()),
  }),
});

const serviceAddons = defineCollection({
  loader: file("./src/content/service-addons.yaml"),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    badge: z.object({ label: z.string(), variant: z.enum(["sage", "neutral"]) }),
    items: z.array(z.string()),
  }),
});

const deliveryPhases = defineCollection({
  loader: file("./src/content/delivery-phases.yaml"),
  schema: z.object({
    id: z.string(),
    number: z.string(),
    name: z.string(),
    badge: z.object({ label: z.string(), variant: z.enum(["terra", "sage", "neutral"]) }),
    description: z.string(),
    pills: z.array(z.string()),
  }),
});

export const collections = {
  blog,
  caseStudies,
  employers,
  clientWork,
  experience,
  skills,
  products,
  serviceOfferings,
  serviceAddons,
  deliveryPhases,
};
