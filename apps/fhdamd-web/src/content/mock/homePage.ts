import type { HomePage } from "../types";

export const homePage: HomePage = {
  heroKicker: "Software engineer & solution architect · Melbourne",
  heroHeading: "I build custom websites *and apps.*",
  heroBody:
    "Not templates — code. 14 years shipping production software across government, finance, and utilities. I'm available to build your site, storefront, or internal tool from the ground up. EY keeps me busy by day; Jamaal, Riqa, and Threads keep me building the rest of the time.",

  hireStrip: [
    {
      iconKey: "design",
      title: "Custom websites",
      description:
        "Brand-first brochure and content sites — Astro, headless CMS, no page builders. You own the content and the code.",
    },
    {
      iconKey: "phone",
      title: "Apps & products",
      description:
        "Full-stack web and iOS apps — React, Firebase, Stripe, SwiftUI. From first prototype to a shipped, paying product.",
    },
    {
      iconKey: "fileCheck",
      title: "Architecture & advisory",
      description:
        "Solution architecture, technical bids, and platform strategy — the same work I lead at enterprise scale, sized for a smaller team.",
    },
  ],

  personalProjects: [
    {
      eyebrow: "iOS app · SwiftUI",
      name: "Jamaal",
      description:
        "Privacy-first daily planning for iOS. One intelligent list, ordered each evening by a deterministic rules engine. One-time purchase, no subscription.",
      tags: ["SwiftUI", "SwiftData"],
      badge: { label: "In dev", variant: "terra" },
      accentColor: "terra",
      jamaalIcon: true,
    },
    {
      eyebrow: "SaaS · Pay-per-use",
      name: "Ri*qa*",
      description:
        "Pay-per-use PDF toolkit — merge, split, compress, encrypt, sign. Credits that don't expire, no subscription. Astro, Firebase, Stripe.",
      tags: ["Astro", "Firebase"],
      badge: { label: "Live", variant: "sage" },
      accentColor: "sage",
      iconKey: "fileText",
      pricingPills: [
        { price: "2cr", label: "Merge" },
        { price: "3cr", label: "Encrypt" },
        { price: "4cr", label: "Sign" },
      ],
    },
    {
      eyebrow: "Design system · Multi-platform",
      name: "Threads",
      description:
        "The token system powering this site, Jamaal, and Riqa. One set of decisions in coffee and sage that works across iOS, macOS, and web.",
      tags: ["CSS tokens", "iOS", "Web"],
      badge: { label: "System", variant: "neutral" },
      accentColor: "ink",
      iconKey: "settings",
    },
  ],

  servicesTeaserTitle: "Custom-designed, code-first, *yours to own.*",
  servicesTeaserDesc:
    "I design and build in code — no Figma handoff, no page builder, no theme with your logo swapped in. Every engagement starts with a discovery call and ends with a written proposal scoped to what you actually need.",
  serviceTiers: [
    { name: "Custom websites", price: "Brochure & commerce" },
    { name: "Apps & products", price: "Web & iOS" },
    { name: "Architecture & advisory", price: "Strategy & bids" },
  ],

  caseStudyEyebrow: "Custom website · Structural engineering · New Delhi",
  caseStudyTitle: "RZest Engineers — *a Presence build in under three weeks*",
  caseStudyDescription:
    "A brochure-and-portfolio site for a New Delhi structural engineering firm — a filterable project portfolio, DatoCMS-backed case study pages, and full OG/meta implementation, built on Astro and delivered in under three weeks.",
  caseStudyTags: ["Astro", "DatoCMS", "Custom website"],
  caseStudyStats: [
    { value: "<3*wks*", label: "Discovery to launch" },
    { value: "0", label: "Dev tickets to publish a new project since launch" },
    { value: "100*%*", label: "Pages with OG/meta coverage" },
  ],

  labTeaserEyebrow: "Lab",
  labTeaserTitle: "Curious how the interactions *are built?*",
  labTeaserDesc: "UI experiments and interaction patterns, played with in the open — the demo-first counterpart to the blog.",

  essays: [
    {
      date: "May 2026",
      title: "Why Jamaal has no subscription",
      subtitle: "On pricing honestly and respecting the people who pay you",
      category: "product",
    },
    {
      date: "Apr 2026",
      title: "Pay-per-use is underrated for small SaaS",
      subtitle: "What building Riqa taught me about pricing models",
      category: "product",
    },
    {
      date: "Mar 2026",
      title: "One design system for four platforms",
      subtitle: "How Threads tokens survive iOS, macOS, web, and watchOS",
      category: "design",
    },
  ],
};
