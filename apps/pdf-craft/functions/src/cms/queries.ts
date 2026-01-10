export const CMS_QUERIES = {
  faqs: `
    query MyQuery {
      allFaqs(orderBy: _createdAt_ASC) {
        title
        content
        id
        _createdAt
      }
    }
  `,
};
