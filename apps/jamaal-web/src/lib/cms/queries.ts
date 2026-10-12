/**
 * One GraphQL query per page, each fetching everything that page shows in a
 * single request. Field names are the model API keys in camelCase; see the
 * README for the models in DatoCMS. Every query includes the site settings
 * because every page has the nav, the footer and the contact address.
 */

const SITE_FIELDS = `
  siteConfig {
    contactEmail
    footerLine
    siteDescription
    navButtonWaitlist
    navButtonTestflight
    navButtonLaunched
    appStoreUrl
    ctaLabelWaitlist
    ctaLabelTestflight
    ctaLabelLaunched
    ctaTitleTestflight
    ctaShortTitleLaunched
    ctaTitleWaitlist
    ctaShortTitleEarly
    ctaTitleLaunched
    ctaBodyWaitlist
    ctaBodyTestflight
    ctaBodyLaunched
  }
`;

const FAQ_FIELDS = `
  allFaqItems(first: 100, orderBy: position_ASC) {
    question
    answer
    stages
    shownOn
  }
`;

export const HOME_QUERY = `
  query HomePage {
    ${SITE_FIELDS}
    homePage {
      heroEyebrowWaitlist
      heroEyebrowTestflight
      heroEyebrowLaunched
      heroTitle
      heroTitleLineTwo
      heroAccent
      heroLede
      heroTrialNote
      heroAltPhone
      heroAltMac
      heroAltWidget
      formWaitlistSending
      formWaitlistSubmit
      formWaitlistNote
      formTestflightSending
      formTestflightSubmit
      formTestflightNote
      formTestflightSteps
      whyEyebrow
      whyTitle
      whyAccent
      whyBody
      whyColumnThem
      whyColumnUs
      orderEyebrow
      orderTitle
      orderAccent
      orderParagraphs
      orderButtonGrid
      orderButtonSort
      orderAxisMatters
      orderAxisDue
      orderAxisLater
      everywhereEyebrow
      everywhereTitle
      everywhereAccent
      everywhereBody
      everywhereFold
      everywhereUnfold
      comingLabel
      dayEyebrow
      dayTitle
      planEyebrow
      planTitle
      planAccent
      planBody
      canvasLabel
      canvasBody
      canvasAlt
      principlesEyebrow
      principlesTitle
      principlesAccent
      principlesBody
      devEyebrow
      devQuote
      devAccent
      devInitial
      devName
      devByline
      pricingEyebrowEarly
      pricingLedeEarly
      pricingEyebrowLaunched
      pricingLedeLaunched
      pricingTitle
      pricingAccent
      pricingAfterTrial
      pricingCurrency
      privacyEyebrow
      privacyTitle
      privacyAccent
      faqTitle
      joinTitle
      joinAccent
      joinLedeWaitlist
      joinLedeTestflight
      joinLedeLaunched
      whyRows { ... on ComparisonRowRecord { them us } }
      orderChips { ... on OrderChipRecord { title detail } }
      everywhereCards { ... on DeviceCardRecord { device name text alt altSecond altThird } }
      planSteps { ... on PlanStepRecord { title text } }
      principlesItems { ... on TitledTextRecord { title text } }
      privacyItems { ... on TitledTextRecord { title text } }
      pricingPlans { ... on PricePlanRecord { name offerName price unit featured } }
    }
    ${FAQ_FIELDS}
    allDayChapters(first: 20, orderBy: position_ASC) {
      time
      label
      title
      text
      place
    }
  }
`;

const JOURNAL_PAGE_FIELDS = `
  journalPage {
    eyebrow
    accent
    title
    lede
    readStory
    back
    empty
    filterAll
    nextLabel
    authorName
    authorRole
    authorInitial
  }
`;

const POST_FIELDS = `
  slug
  title
  accent
  category
  date
  readMinutes
  excerpt
  featuredExcerpt
  lede
  featured
  ctaNote
  next { slug }
  cover { url alt }
`;

/** The Journal index: the list needs no article bodies. */
export const JOURNAL_QUERY = `
  query JournalPage {
    ${SITE_FIELDS}
    ${JOURNAL_PAGE_FIELDS}
    allPosts(orderBy: date_DESC, first: 100) {
      ${POST_FIELDS}
    }
  }
`;

/** Every article with its body, fetched once for all the article pages. */
export const POSTS_QUERY = `
  query JournalPosts {
    ${SITE_FIELDS}
    ${JOURNAL_PAGE_FIELDS}
    allPosts(orderBy: date_DESC, first: 100) {
      ${POST_FIELDS}
      body {
        value
        blocks {
          __typename
          ... on FigureRecord { id image { url alt } caption }
          ... on PullQuoteRecord { id text cite }
          ... on DetailRowRecord { id label value }
          ... on StepRecord { id title body image { url alt } }
        }
      }
    }
  }
`;

/** Privacy, terms and support: one page record, plus the questions for the support page's list. */
export const CONTENT_PAGE_QUERY = `
  query ContentPage($key: String!) {
    ${SITE_FIELDS}
    contentPage(filter: { pageKey: { eq: $key } }) {
      pageKey
      eyebrow
      title
      description
      updated
      body {
        value
        blocks {
          __typename
          ... on ConditionalNoteRecord { id condition text }
          ... on FaqListRecord { id shownOn }
        }
      }
    }
    ${FAQ_FIELDS}
  }
`;

export const PRESS_QUERY = `
  query PressPage {
    ${SITE_FIELDS}
    pressPage {
      eyebrow
      title
      intro
      statusWaitlist
      statusTestflight
      statusLaunched
      aboutHeading
      about
      factsHeading
      facts { ... on PressFactRecord { label value } }
      downloadsHeading
      files { ... on PressFileRecord { label note alt file { url width height filename mimeType } } }
      brandHeading
      colours { ... on BrandColourRecord { name hex use } }
      fonts
      contactHeading
      contactText
    }
  }
`;

/** Pages with no copy of their own (404) still need the nav and footer. */
export const SITE_QUERY = `
  query Site {
    ${SITE_FIELDS}
  }
`;
