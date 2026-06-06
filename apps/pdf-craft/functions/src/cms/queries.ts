export const CMS_QUERIES = {
  faqs: `
    query FaqsQuery {
      allFaqs(orderBy: _createdAt_ASC) {
        title
        content
        id
        _createdAt
      }
    }
  `,
  pricing: `
    query PricingQuery {
      allPricingOptions(orderBy: _createdAt_ASC) {
        id
        productName
        price
        credits
        description
      }
    }
  `,
  operations: `
    query OperationsQuery {
      allOperations(orderBy: sortOrder_ASC) {
        id
        _createdAt
        title
        detail
        creditCost
        active
        actionLabel
        actionRoute
        iconKey
        sortOrder
      }
    }
  `,
};
