import type { ServicesPage } from '../types';

export const servicesPage: ServicesPage = {
  heroKicker: 'What I do',
  heroHeading: 'Software, built and *owned by you.*',
  heroSubheading:
    'I take on a small number of engagements alongside the day job — custom websites, full-stack apps and products, and solution architecture or advisory work. Every project starts with a discovery call and ends with a written proposal scoped to what you actually need.',

  offerCards: [
    {
      iconKey: 'design',
      eyebrow: 'Brochure, content & light commerce sites',
      title: 'Custom *websites*',
      description:
        'Brand-first sites built in code, not assembled from a theme. You leave with a component library built from your palette, a headless CMS you can update yourself, and a site that passes Core Web Vitals on day one.',
      checklist: [
        'Component library from your brand palette',
        'Astro build on a headless CMS — no calling me to edit content',
        'Light e-commerce where the project calls for it',
        'SEO foundations, Core Web Vitals, post-launch support window',
      ],
    },
    {
      iconKey: 'phone',
      eyebrow: 'Web & iOS · full-stack',
      title: 'Apps & *products*',
      description:
        'Full-stack builds for a product, an internal tool, or a customer-facing app — from first prototype to something real people use and pay for. The same rigour I bring to Jamaal and Riqa, applied to your idea.',
      checklist: [
        'Full-stack web apps — React, Firebase, Stripe',
        'Native iOS apps — SwiftUI, SwiftData',
        'Prototype-to-production, not just a demo',
        'Payments, auth, and data architecture built in, not bolted on',
      ],
    },
    {
      iconKey: 'fileCheck',
      eyebrow: 'Solution architecture & technical strategy',
      title: 'Architecture & *advisory*',
      description:
        'The same solution architecture and bid work I lead at enterprise scale at EY, sized for a smaller team — technical strategy, platform decisions, and architecture documentation that survives past the workshop it was drawn in.',
      checklist: [
        'Solution architecture for new or existing platforms',
        'Technical input on bids, RFPs, and vendor evaluation',
        'Platform and technology strategy',
        'Delivered as workshops, documented architecture, or embedded advisory time',
      ],
    },
  ],

  pricingNoteTitle: 'How pricing *works*',
  pricingNoteDesc:
    "A website, a product build, and an advisory engagement don't share a price list — so I don't publish one. After a short discovery call, you get a written proposal with what's included, the timeline, and a fixed price where the scope supports it, or a retainer where it doesn't. No hourly guessing games, and nothing in the proposal that wasn't already discussed on the call.",

  addonCards: [
    {
      name: 'Strategic discovery',
      badge: { label: 'Credited if you proceed', variant: 'sage' },
      items: [
        'For clients unsure what they need yet',
        'Competitive & content audit',
        'Tech stack & offering recommendation',
        'Fee credited toward the project if you proceed',
      ],
    },
    {
      name: 'Transactional comms',
      badge: { label: 'Websites & products', variant: 'neutral' },
      items: [
        'Email domain setup + transactional templates',
        'Order confirm, shipping, abandoned cart',
        'SMS/WhatsApp if needed',
      ],
    },
    {
      name: 'Migration',
      badge: { label: 'Websites', variant: 'neutral' },
      items: [
        'WordPress or Shopify to a headless CMS',
        'URL redirect mapping',
        'SEO continuity audit',
        'Schema mapping & data integrity',
      ],
    },
  ],

  deliveryPhases: [
    {
      number: '1',
      name: 'Discovery',
      badge: { label: 'Included in project', variant: 'terra' },
      description:
        "A brand or product questionnaire is sent 24–48 hours before the call so we skip the basics and have a real conversation. The 45–60 minute video call covers your context, goals, and constraints. For a product build this goes deeper into scope and integrations; for advisory work it's framed around the problem you're trying to solve. Nothing in the proposal will surprise you.",
      pills: [
        'Pre-call questionnaire',
        '45–60 min video call',
        'Written discovery summary within 48 hrs',
      ],
    },
    {
      number: '2',
      name: 'Brand foundation',
      badge: { label: 'The step most skip', variant: 'terra' },
      description:
        "Before a single page is designed, I build a component library from your brand palette — colour, typography, spacing, interactive states, form elements, cards. Every component is consistent before the first page is touched. This is how enterprise agencies work. It's also why the finished site looks coherent rather than assembled.",
      pills: [
        'Brand palette extraction',
        'AI-assisted component generation',
        'Client brand review before build starts',
      ],
    },
    {
      number: '3',
      name: 'Architecture',
      badge: { label: 'Technical setup', variant: 'neutral' },
      description:
        "Content model defined and structured in DatoCMS. Firebase project initialised — hosting, functions, Firestore if needed. Astro site scaffolded against the component library. Where a project needs e-commerce, that's when payments, catalogue schema, and cart logic get designed. The architecture is deliberate — no decisions made by default.",
      pills: [
        'DatoCMS content model',
        'Firebase project setup',
        'Astro scaffolding',
        'Stripe payments where needed',
      ],
    },
    {
      number: '4',
      name: 'Build',
      badge: { label: 'Direct to code', variant: 'neutral' },
      description:
        'Pages are built in code against your confirmed content — no Figma handoff, no design agency in the loop, no translation loss between what was designed and what was built. Two rounds of client review are included. Changes within agreed scope are addressed without back-and-forth quoting. What you see in review is what goes live.',
      pills: [
        'No Figma handoff',
        'Two review rounds included',
        'Mobile-responsive from day one',
        'Content supplied by client before build',
      ],
    },
    {
      number: '5',
      name: 'Launch',
      badge: { label: 'Performance-first', variant: 'sage' },
      description:
        'QA across devices, browsers, and screen sizes. Performance audit targeting green Core Web Vitals scores — not as an afterthought but as a build requirement. SEO foundations in place: page titles, meta descriptions, Open Graph, sitemap, robots.txt. A 30-minute handover call and CMS walkthrough before DNS is pointed. Balance due on launch day.',
      pills: [
        'Core Web Vitals audit',
        'SEO foundations',
        '30-min CMS handover call',
        'DNS + go-live',
      ],
    },
    {
      number: '6',
      name: 'Support',
      badge: { label: 'Included post-launch', variant: 'sage' },
      description:
        'A support window is included after every launch — the length is scoped to the project in your proposal. Covers bugs, minor content adjustments, and anything that surfaces in production. After that window, ongoing work is available on a retainer basis for clients who want fast turnaround on updates without scoping new work each time.',
      pills: [
        'Support window scoped per project',
        'Retainer available post-launch',
      ],
    },
  ],

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
        'DatoCMS means you update content without calling me. Firebase means no shared hosting mystery. Snipcart and Stripe mean no platform lock-in. Deliberate architectural choices, every one.',
    },
  ],

  techStackTags: [
    'Astro',
    'React',
    'SwiftUI',
    'DatoCMS',
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
