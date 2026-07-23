import type { BlogPage } from '../types';

export const blogPage: BlogPage = {
  heroKicker: 'Blog',
  heroHeading: 'Notes from the *work.*',
  heroSubheading:
    "Engineering tradeoffs, product decisions, and the occasional deep-dive into how a system is actually built — from client engagements at EY to shipping Jamaal and Riqa on nights and weekends.",

  featuredPost: {
    slug: 'sequence-diagram-you-can-trust',
    title: 'Building a sequence diagram *you can trust*',
    description:
      "A walkthrough of how the Kindergarten Arrival Funding platform's prefill flow is documented — with Mermaid diagrams checked into the same repo as the code they describe, so the docs can't drift.",
    date: 'July 2026',
    readTime: '9 min read',
    tags: ['dev', 'architecture'],
  },

  posts: [
    {
      slug: 'why-jamaal-has-no-subscription',
      title: 'Why Jamaal has no *subscription*',
      description: 'On pricing honestly and respecting the people who pay you.',
      date: 'May 2026',
      tags: ['product'],
    },
    {
      slug: 'pay-per-use-is-underrated',
      title: 'Pay-per-use is underrated for small SaaS',
      description: 'What building Riqa taught me about pricing models.',
      date: 'Apr 2026',
      tags: ['product', 'dev'],
    },
    {
      slug: 'one-design-system-four-platforms',
      title: 'One design system for four platforms',
      description: 'How Threads tokens survive iOS, macOS, web, and watchOS.',
      date: 'Mar 2026',
      tags: ['design'],
    },
    {
      slug: 'deterministic-rules-before-a-model',
      title: 'Deterministic rules before you reach for a model',
      description: "Jamaal's rules engine — and why v1 has no ML at all.",
      date: 'Jan 2026',
      tags: ['dev', 'architecture'],
    },
    {
      slug: 'swiftdata-after-six-months',
      title: 'SwiftData after six months in production',
      description: "The real-world gaps the WWDC sessions don't mention.",
      date: 'Nov 2025',
      tags: ['dev'],
    },
    {
      slug: 'winning-a-bid-with-a-diagram',
      title: 'Winning a $1.3M bid with a diagram',
      description: 'What actually gets a solution architecture across the line.',
      date: 'Sep 2025',
      tags: ['architecture'],
    },
  ],
};
