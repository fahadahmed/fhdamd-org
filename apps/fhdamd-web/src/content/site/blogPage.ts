import type { BlogPage } from '../types';

export const blogPage: Omit<BlogPage, 'featuredPost' | 'posts'> = {
  heroKicker: 'Blog',
  heroHeading: 'Notes from the *work.*',
  heroSubheading:
    "Engineering tradeoffs, product decisions, and the occasional deep-dive into how a system is actually built — from client engagements at EY to shipping Jamaal and Riqa on nights and weekends.",
};
