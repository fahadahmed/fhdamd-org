import { fetchCMSData } from "./datocms";
import { dastToParagraphHtml, type DastValue } from "./dast";
import { contactPage } from "../../content/mock/contactPage";
import { homePage } from "../../content/mock/homePage";
import { servicesPage } from "../../content/mock/servicesPage";
import { blogPage } from "../../content/mock/blogPage";
import { blogPostDetails } from "../../content/mock/blogPostDetails";
import { caseStudiesPage } from "../../content/mock/caseStudiesPage";
import { caseStudyDetails } from "../../content/mock/caseStudyDetails";
import { labPage } from "../../content/mock/labPage";
import type {
  SiteSettings,
  AboutPage,
  ContactPage,
  HomePage,
  ServicesPage,
  BlogPage,
  BlogPostDetail,
  CaseStudiesPage,
  CaseStudyDetail,
  LabPage,
  Employer,
  ClientWorkItem,
  ExperienceItem,
  SkillCategory,
} from "../../content/types";

/**
 * Thin data-access layer — one function per content type. Functions not yet
 * wired to DatoCMS return a typed mock fixture; swapping the rest over means
 * replacing a function body with a build-time GraphQL call of the same
 * shape, same as getSiteSettings/getAboutPage below — no page or component
 * that calls these needs to change.
 */

const SITE_SETTINGS_QUERY = `
  query SiteSettingsQuery {
    sitesetting {
      email
      github
      location
      currentEmployer
      currentTitle
      availabilityTitle
      availabilityStatus
      ctaTitle
      ctaSubtitle
      footerCopyrightNote
      authorInitials
      authorName
      authorRole
    }
  }
`;

export async function getSiteSettings(): Promise<SiteSettings> {
  const data = await fetchCMSData<{ sitesetting: SiteSettings }>(SITE_SETTINGS_QUERY);
  return data.sitesetting;
}

const ABOUT_PAGE_QUERY = `
  query AboutPageQuery {
    aboutPage {
      sidebarLabel
      hero {
        kicker
        heading
        subheading
      }
      bio {
        value
      }
    }
  }
`;

interface AboutPageResponse {
  aboutPage: {
    sidebarLabel: string;
    hero: { kicker: string; heading: string; subheading: string };
    bio: { value: DastValue };
  };
}

export async function getAboutPage(): Promise<AboutPage> {
  const { hero, bio, sidebarLabel } = (await fetchCMSData<AboutPageResponse>(ABOUT_PAGE_QUERY)).aboutPage;

  return {
    heroKicker: hero.kicker,
    heroHeading: hero.heading,
    heroSubheading: hero.subheading,
    bio: dastToParagraphHtml(bio.value),
    sidebarLabel,
  };
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

export async function getCaseStudyDetails(): Promise<CaseStudyDetail[]> {
  return caseStudyDetails;
}

export async function getLabPage(): Promise<LabPage> {
  return labPage;
}

const EMPLOYERS_QUERY = `
  query EmployersQuery {
    allEmployers(orderBy: _createdAt_ASC) {
      name
      label
      logo {
        url
      }
    }
  }
`;

interface EmployersResponse {
  allEmployers: { name: string; label: string; logo: { url: string } | null }[];
}

export async function getEmployers(): Promise<Employer[]> {
  const data = await fetchCMSData<EmployersResponse>(EMPLOYERS_QUERY);
  return data.allEmployers.map((employer) => ({
    name: employer.name,
    label: employer.label,
    logo: employer.logo?.url,
  }));
}

const CLIENT_WORK_QUERY = `
  query ClientWorkQuery {
    allClientWorkItems(orderBy: _createdAt_ASC) {
      client
      dateRange
      title
      description
      tags
      value
    }
  }
`;

export async function getClientWork(): Promise<ClientWorkItem[]> {
  const data = await fetchCMSData<{ allClientWorkItems: ClientWorkItem[] }>(CLIENT_WORK_QUERY);
  return data.allClientWorkItems;
}

const EXPERIENCE_QUERY = `
  query ExperienceQuery {
    allExperienceItems(orderBy: _createdAt_ASC) {
      company
      period
      role
      description
    }
  }
`;

export async function getExperience(): Promise<ExperienceItem[]> {
  const data = await fetchCMSData<{ allExperienceItems: ExperienceItem[] }>(EXPERIENCE_QUERY);
  return data.allExperienceItems;
}

const SKILLS_QUERY = `
  query SkillsQuery {
    allSkillCategories(orderBy: _createdAt_ASC) {
      label
      tags
    }
  }
`;

export async function getSkills(): Promise<SkillCategory[]> {
  const data = await fetchCMSData<{ allSkillCategories: SkillCategory[] }>(SKILLS_QUERY);
  return data.allSkillCategories;
}
