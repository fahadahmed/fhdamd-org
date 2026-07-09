const HERO_FIELDS = `key eyebrow heading subheading body chips primaryCtaLabel primaryCtaHref secondaryCtaLabel secondaryCtaHref`;
const FAQ_FIELDS = `title content id _createdAt area`;
const PRICING_FIELDS = `id productName price credits description`;
const OPERATION_FIELDS = `id _createdAt title detail creditCost active actionLabel actionRoute iconKey sortOrder`;
const TESTIMONIAL_FIELDS = `id name detail title _createdAt`;
const SECTION_HEADER_FIELDS = `key eyebrow title intro`;
const STEP_FIELDS = `id number title body`;

const LEGAL_PAGE_FIELDS = `title slug eyebrow metaDescription _updatedAt content`;
const RESOURCE_FIELDS = `id title slug excerpt content coverImage { url } relatedOperationIds _createdAt _updatedAt`;

export const CMS_QUERIES = {
  legalPage: `
    query LegalPageQuery($slug: String!) {
      legalPage(filter: { slug: { eq: $slug } }) { ${LEGAL_PAGE_FIELDS} }
    }
  `,
  faqs: `
    query FaqsQuery($area: String) {
      allFaqs(filter: { area: { eq: $area } }, orderBy: _createdAt_ASC) { ${FAQ_FIELDS} }
    }
  `,
  pricing: `
    query PricingQuery {
      allPricingOptions(orderBy: _createdAt_ASC) { ${PRICING_FIELDS} }
    }
  `,
  operations: `
    query OperationsQuery {
      allOperations(orderBy: sortOrder_ASC) { ${OPERATION_FIELDS} }
    }
  `,
  testimonials: `
    query TestimonialsQuery {
      allTestimonials(orderBy: sortOrder_ASC) { ${TESTIMONIAL_FIELDS} }
    }
  `,
  sectionHeaders: `
    query SectionHeadersQuery($pattern: String!) {
      allSectionHeaders(filter: { key: { matches: { pattern: $pattern } } }) { ${SECTION_HEADER_FIELDS} }
    }
  `,
  resources: `
    query ResourcesQuery {
      allResources(orderBy: _createdAt_DESC) { ${RESOURCE_FIELDS} }
    }
  `,
  resource: `
    query ResourceQuery($slug: String!) {
      resource(filter: { slug: { eq: $slug } }) { ${RESOURCE_FIELDS} }
    }
  `,
  homePage: `
    query HomePageQuery {
      allHeros(filter: { key: { eq: "home" } }) { ${HERO_FIELDS} }
      allFaqs(filter: { area: { eq: "home" } }, orderBy: _createdAt_ASC) { ${FAQ_FIELDS} }
      allOperations(orderBy: sortOrder_ASC) { ${OPERATION_FIELDS} }
      allTestimonials(orderBy: sortOrder_ASC) { ${TESTIMONIAL_FIELDS} }
      allSectionHeaders(filter: { key: { matches: { pattern: "^home--" } } }) { ${SECTION_HEADER_FIELDS} }
      allSteps { ${STEP_FIELDS} }
    }
  `,
};
