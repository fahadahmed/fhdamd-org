import type { ServicesPage } from '../types';

export const servicesPage: Omit<ServicesPage, 'offerCards' | 'addonCards' | 'deliveryPhases'> = {
  heroKicker: 'What I do',
  heroHeading: 'Software, built and *owned by you.*',
  heroSubheading:
    'I take on a small number of engagements alongside the day job — custom websites, full-stack apps and products, and solution architecture or advisory work. Every project starts with a discovery call and ends with a written proposal scoped to what you actually need.',

  pricingNoteTitle: 'How pricing *works*',
  pricingNoteDesc:
    "A website, a product build, and an advisory engagement don't share a price list — so I don't publish one. After a short discovery call, you get a written proposal with what's included, the timeline, and a fixed price where the scope supports it, or a retainer where it doesn't. No hourly guessing games, and nothing in the proposal that wasn't already discussed on the call.",

  differentiators: [
    {
      title: 'Brand-first, not *template-first*',
      description:
        'Every site starts with a component library built from your palette — not a theme with colours swapped in. The result is a site that looks like it was made specifically for you. Because it was.',
    },
    {
      title: 'Direct to *code*',
      description:
        'No Figma handoff, no design agency in the loop. I design and build in code. That means faster iteration, no translation loss, and a tighter result at a lower total cost.',
    },
    {
      title: 'You own *everything*',
      description:
        'A hosted DatoCMS project or your own self-hosted Strapi instance — either way, you update content without calling me. Firebase means no shared hosting mystery. Snipcart and Stripe mean no platform lock-in. Deliberate architectural choices, every one.',
    },
  ],

  techStackTags: [
    'Astro',
    'React',
    'SwiftUI',
    'DatoCMS',
    'Strapi',
    'Firebase',
    'Snipcart',
    'Stripe',
    'Resend',
    'Threads DS',
  ],
  techStackNote:
    "Websites are built in code against your brand palette — not a template, not a page builder. Apps are native or full-stack, matched to the platform. Architecture and advisory work isn't tied to a stack at all — the recommendation follows your constraints, not my preferences.",

  ctaTitle: 'Ready to start? *Get a proposal.*',
  ctaSubtitle:
    "I work with a small number of clients at a time. Tell me what you're building and I'll come back with a scoped proposal.",
};
