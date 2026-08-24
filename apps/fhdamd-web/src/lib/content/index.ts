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
  const products = await getCollection("products");
  return {
    ...homePage,
    personalProjects: products.map((entry) => entry.data),
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
    offerCards: offerCards.map((entry) => entry.data),
    addonCards: addonCards.map((entry) => entry.data),
    deliveryPhases: deliveryPhases.map((entry) => entry.data),
  };
}

export async function getBlogPage(): Promise<BlogPage> {
  const posts = await getCollection("blog");
  const featuredEntry = posts.find((p) => p.data.featured) ?? posts[0];
  const restEntries = posts.filter((p) => p.id !== featuredEntry.id);

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
  const items = await getCollection("caseStudies");
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
  const employers = await getCollection("employers");
  return employers.map((entry) => entry.data);
}

export async function getClientWork(): Promise<ClientWorkItem[]> {
  const items = await getCollection("clientWork");
  return items.map((entry) => entry.data);
}

export async function getExperience(): Promise<ExperienceItem[]> {
  const items = await getCollection("experience");
  return items.map((entry) => entry.data);
}

export async function getSkills(): Promise<SkillCategory[]> {
  const items = await getCollection("skills");
  return items.map((entry) => entry.data);
}
