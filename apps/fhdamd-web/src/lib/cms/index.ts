import { siteSettings } from "../../content/mock/siteSettings";
import { aboutPage } from "../../content/mock/aboutPage";
import { contactPage } from "../../content/mock/contactPage";
import { employers } from "../../content/mock/employers";
import { clientWork } from "../../content/mock/clientWork";
import { experience } from "../../content/mock/experience";
import { skills } from "../../content/mock/skills";
import type {
  SiteSettings,
  AboutPage,
  ContactPage,
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
