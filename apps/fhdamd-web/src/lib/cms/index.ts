import { siteSettings } from "../../content/mock/siteSettings";
import { aboutPage } from "../../content/mock/aboutPage";
import { contactPage } from "../../content/mock/contactPage";
import { homePage } from "../../content/mock/homePage";
import { servicesPage } from "../../content/mock/servicesPage";
import { blogPage } from "../../content/mock/blogPage";
import { blogPostDetails } from "../../content/mock/blogPostDetails";
import { caseStudiesPage } from "../../content/mock/caseStudiesPage";
import { employers } from "../../content/mock/employers";
import { clientWork } from "../../content/mock/clientWork";
import { experience } from "../../content/mock/experience";
import { skills } from "../../content/mock/skills";
import type {
  SiteSettings,
  AboutPage,
  ContactPage,
  HomePage,
  ServicesPage,
  BlogPage,
  BlogPostDetail,
  CaseStudiesPage,
  Employer,
  ClientWorkItem,
  ExperienceItem,
  SkillCategory,
} from "../../content/types";

/**
 * Thin data-access layer — one function per content type, each currently
 * returning a typed mock fixture. Swapping to real DatoCMS means replacing
 * a function body with a build-time GraphQL call of the same shape; no page
 * or component that calls these needs to change.
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
  return homePage;
}

export async function getServicesPage(): Promise<ServicesPage> {
  return servicesPage;
}

export async function getBlogPage(): Promise<BlogPage> {
  return blogPage;
}

export async function getBlogPostDetails(): Promise<BlogPostDetail[]> {
  return blogPostDetails;
}

export async function getCaseStudiesPage(): Promise<CaseStudiesPage> {
  return caseStudiesPage;
}

export async function getEmployers(): Promise<Employer[]> {
  return employers;
}

export async function getClientWork(): Promise<ClientWorkItem[]> {
  return clientWork;
}

export async function getExperience(): Promise<ExperienceItem[]> {
  return experience;
}

export async function getSkills(): Promise<SkillCategory[]> {
  return skills;
}
