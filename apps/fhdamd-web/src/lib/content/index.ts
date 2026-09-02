import { getCollection } from "astro:content";
import { siteSettings } from "../../content/site/siteSettings";
import { aboutPage } from "../../content/site/aboutPage";
import { contactPage } from "../../content/site/contactPage";
import { homePage } from "../../content/site/homePage";
import { servicesPage } from "../../content/site/servicesPage";
import { blogPage } from "../../content/site/blogPage";
import { caseStudiesPage } from "../../content/site/caseStudiesPage";
import { labPage } from "../../content/site/labPage";
import { computeReadTime } from "../../utils/computeReadTime";
import type {
  SiteSettings,
  AboutPage,
  ContactPage,
  HomePage,
  ServicesPage,
  BlogPage,
  CaseStudiesPage,
  LabPage,
  Employer,
  ClientWorkItem,
  ExperienceItem,
  SkillCategory,
} from "../../content/types";

/**
 * Thin data-access layer — one function per content type. Page-level
 * singleton copy (hero text, CTAs, etc.) lives in src/content/site/*.ts;
 * repeating content (blog, case studies, employers, products, ...) is read
 * from Astro Content Collections defined in src/content.config.ts. Neither
 * page markup nor components below this layer need to know the difference.
 */

/**
 * getCollection() doesn't preserve a YAML/glob file's array or directory
 * order — it returns entries sorted by id. Every collection with a curated
 * (non-derivable) order carries an explicit `order` field for this reason.
 */
function byOrder<T extends { data: { order: number } }>(a: T, b: T): number {
  return a.data.order - b.data.order;
}

const ESSAY_CATEGORIES = ["design", "product", "dev"] as const;
type EssayCategory = (typeof ESSAY_CATEGORIES)[number];

/** EssayRow only has chip styling for this closed set — other tags (e.g. "architecture") get no chip. */
function toEssayCategory(tag: string | undefined): EssayCategory | undefined {
  return ESSAY_CATEGORIES.find((category) => category === tag);
}

const HOME_ESSAY_COUNT = 3;

export async function getSiteSettings(): Promise<SiteSettings> {
  return siteSettings;
}

export async function getAboutPage(): Promise<AboutPage> {
  return aboutPage;
}

export async function getContactPage(): Promise<ContactPage> {
  return contactPage;
}

export async function getHomePage(): Promise<HomePage> {
  const [products, posts] = await Promise.all([
    getCollection("products"),
    getCollection("blog"),
  ]);

  const essays = posts
    .sort((a, b) => Date.parse(b.data.date) - Date.parse(a.data.date))
    .slice(0, HOME_ESSAY_COUNT)
    .map((entry) => ({
      slug: entry.id,
      date: entry.data.date,
      // EssayRow's title is plain text, unlike titleToReact()'s *emphasis*
      // consumers elsewhere — strip the markup rather than show it literally.
      title: entry.data.title.replace(/\*/g, ""),
      subtitle: entry.data.dek,
      category: toEssayCategory(entry.data.tags[0]),
    }));

  return {
    ...homePage,
    personalProjects: products.sort(byOrder).map((entry) => entry.data),
    essays,
  };
}

export async function getServicesPage(): Promise<ServicesPage> {
  const [offerCards, addonCards, deliveryPhases] = await Promise.all([
    getCollection("serviceOfferings"),
    getCollection("serviceAddons"),
    getCollection("deliveryPhases"),
  ]);

  return {
    ...servicesPage,
    offerCards: offerCards.sort(byOrder).map((entry) => entry.data),
    addonCards: addonCards.sort(byOrder).map((entry) => entry.data),
    // DeliveryPhase already carries a natural sort key (its display number) — no separate order field needed.
    deliveryPhases: deliveryPhases
      .sort((a, b) => Number(a.data.number) - Number(b.data.number))
      .map((entry) => entry.data),
  };
}

export async function getBlogPage(): Promise<BlogPage> {
  const posts = await getCollection("blog");
  const featuredEntry = posts.find((p) => p.data.featured) ?? posts[0];
  const restEntries = posts
    .filter((p) => p.id !== featuredEntry.id)
    .sort((a, b) => Date.parse(b.data.date) - Date.parse(a.data.date));

  return {
    ...blogPage,
    featuredPost: {
      slug: featuredEntry.id,
      title: featuredEntry.data.title,
      description: featuredEntry.data.dek,
      date: featuredEntry.data.date,
      tags: featuredEntry.data.tags,
      readTime: computeReadTime(featuredEntry.body ?? ""),
    },
    posts: restEntries.map((entry) => ({
      slug: entry.id,
      title: entry.data.title,
      description: entry.data.dek,
      date: entry.data.date,
      tags: entry.data.tags,
    })),
  };
}

export async function getCaseStudiesPage(): Promise<CaseStudiesPage> {
  const items = (await getCollection("caseStudies")).sort(byOrder);
  const featuredEntry = items.find((i) => i.id === "rzest") ?? items[0];
  const dateLabel = (status: string) => (status === "comingSoon" ? "Coming soon" : "Delivered");

  return {
    ...caseStudiesPage,
    featured: {
      slug: featuredEntry.id,
      title: featuredEntry.data.title,
      description: featuredEntry.data.dek,
      dateLabel: dateLabel(featuredEntry.data.status),
      tag: featuredEntry.data.tag,
      eyebrowMeta: featuredEntry.data.eyebrowMeta ?? "",
      techBadge: featuredEntry.data.techBadge ?? "",
    },
    items: items.map((entry) => ({
      slug: entry.id,
      title: entry.data.title,
      description: entry.data.dek,
      dateLabel: dateLabel(entry.data.status),
      tag: entry.data.tag,
      comingSoon: entry.data.status === "comingSoon" ? true : undefined,
    })),
  };
}

export async function getLabPage(): Promise<LabPage> {
  return labPage;
}

export async function getEmployers(): Promise<Employer[]> {
  const employers = (await getCollection("employers")).sort(byOrder);
  return employers.map((entry) => entry.data);
}

export async function getClientWork(): Promise<ClientWorkItem[]> {
  const items = (await getCollection("clientWork")).sort(byOrder);
  return items.map((entry) => entry.data);
}

export async function getExperience(): Promise<ExperienceItem[]> {
  const items = (await getCollection("experience")).sort(byOrder);
  return items.map((entry) => entry.data);
}

export async function getSkills(): Promise<SkillCategory[]> {
  const items = (await getCollection("skills")).sort(byOrder);
  return items.map((entry) => entry.data);
}
