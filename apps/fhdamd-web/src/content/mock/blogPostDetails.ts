import type { BlogPostDetail } from '../types';

export const blogPostDetails: BlogPostDetail[] = [
  {
    slug: 'sequence-diagram-you-can-trust',
    breadcrumbCategory: 'Architecture',
    badges: ['dev', 'architecture'],
    title: 'Building a sequence diagram *you can trust*',
    dek: "Docs rot the moment they're written down separately from the code. Here's how the prefill flow on a government platform is documented with Mermaid diagrams that live in the same repo — and the same pull request — as the code they describe.",
    authorInitials: 'FA',
    authorName: 'Fahad Ahmed',
    authorRole: 'Solution Architect',
    publishedDate: '14 Jul 2026',
    readTime: '9 min read',
    postTags: ['Architecture', 'Mermaid', 'Documentation', 'EY'],
    relatedSlugs: [
      'why-jamaal-has-no-subscription',
      'deterministic-rules-before-a-model',
      'winning-a-bid-with-a-diagram',
    ],
    body: [
      { type: 'heading', id: 'problem', text: 'The problem with *docs*' },
      {
        type: 'html',
        html: "<p>Every architecture diagram I've inherited on a client engagement has been wrong by the time I opened it. Not maliciously — just quietly out of date, drawn in a tool nobody on the delivery team has a licence for, exported once as a PNG, and never touched again. The system moved on. The picture didn't.</p><p>On the <b>Kindergarten Arrival Funding</b> platform, the prefill flow touches four services, two queues, and an external IBM ODM integration. A diagram that goes stale here doesn't just look bad in a wiki — it costs a new team member a day of tracing logs to rebuild a mental model that used to be free.</p><blockquote>If a diagram can't be reviewed in the same pull request as the code it describes, it will eventually lie to you.</blockquote>",
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Why this matters for client work',
        body: 'Bid documentation with diagrams that survive past the bid win is one of the differentiators that actually gets referenced by the review panel — not just the fixed-price number.',
      },
      { type: 'heading', id: 'approach', text: 'Diagrams as *code*' },
      {
        type: 'html',
        html: "<p>The fix is boring: write the diagram in text, check it into the same directory as the service it documents, and render it at build time. Mermaid is the format I've settled on — it's supported natively by GitHub and GitLab previews, and it renders identically whether you're looking at a PR or the published docs site.</p><p>Here's the flow definition that documents the prefill sequence. It lives at <code>docs/prefill-sequence.mmd</code>, next to the handler it describes:</p>",
      },
      {
        type: 'code',
        filename: 'prefill-handler.ts',
        code: `import { PrefillClient } from './odm-client';
import { QueueProducer } from './queue';

// Triggered when a guardian submits the arrival funding form.
// Runs the ODM ruleset, then queues the funding decision.
export async function handlePrefillRequest(applicationId: string) {
  const application = await getApplication(applicationId);
  const decision = await PrefillClient.evaluate(application);

  if (decision.status === 'approved') {
    await QueueProducer.publish('funding.approved', {
      applicationId,
      amount: decision.amount,
    });
  }

  return decision;
}`,
      },
      {
        type: 'html',
        html: '<p>And the sequence diagram sitting right beside it, rendered from source rather than pasted as an image:</p>',
      },
      {
        type: 'diagram',
        label: 'Sequence diagram · Mermaid',
        caption:
          'Rendered live from the .mmd source at build time — no exported PNG to go stale',
        source: `sequenceDiagram
    accTitle: Prefill request sequence
    accDescr: Guardian submits the funding form, which calls the prefill handler, which evaluates the application against IBM ODM and publishes an approval or returns a rejection reason.
    participant G as Guardian
    participant F as Funding Form
    participant H as Prefill Handler
    participant ODM as IBM ODM
    participant Q as Queue

    G->>F: Submit application
    F->>H: handlePrefillRequest(id)
    H->>ODM: evaluate(application)
    ODM-->>H: decision
    alt approved
        H->>Q: publish(funding.approved)
        Q-->>G: Confirmation email
    else declined
        H-->>F: Rejection reason
    end`,
      },
      { type: 'heading', id: 'example', text: 'A worked *example*' },
      {
        type: 'html',
        html: "<p>The same approach works for state and flow diagrams. Here's the funding application's lifecycle — useful for onboarding, and honest about the one state most diagrams quietly omit: the dead end.</p>",
      },
      {
        type: 'diagram',
        label: 'Flowchart · Mermaid',
        source: `flowchart LR
    accTitle: Funding application lifecycle
    accDescr: An application moves from draft to submitted, then to an ODM decision that results in funded, rejected with an appeal window, or sent back for more information.
    A[Draft] --> B[Submitted]
    B --> C{ODM decision}
    C -->|Approved| D[Funded]
    C -->|Declined| E[Rejected]
    C -->|Needs info| F[Awaiting docs]
    F --> B
    E --> G[Appeal window]
    G -->|Upheld| D
    G -->|Denied| H[Closed]`,
      },
      {
        type: 'html',
        html: '<p>A short clip from the internal walkthrough I recorded for the delivery team when this pattern was rolled out:</p>',
      },
      {
        type: 'embed',
        kind: 'youtube',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        title: 'YouTube video player',
      },
      {
        type: 'html',
        html: '<p>The pattern got a bit of attention when I wrote it up publicly:</p>',
      },
      {
        type: 'embed',
        kind: 'tweet',
        authorName: 'Fahad Ahmed',
        handle: '@fahadahmed · Jul 2026',
        text: 'Checked-in Mermaid diagrams next to the code they describe. Docs review in the same PR as the change. No more architecture diagrams that lie to you six months later.',
        foot: '142 reposts · 890 likes',
      },
      {
        type: 'html',
        html: '<p>And a look at the whiteboard session where the sequence above started life:</p>',
      },
      {
        type: 'embed',
        kind: 'instagram',
        accountName: 'fhdamd.dev',
        caption:
          'Whiteboard session — the messy version before it became a Mermaid diagram.',
      },
      { type: 'heading', id: 'pitfalls', text: 'Where this breaks *down*' },
      {
        type: 'html',
        html: "<p>Text-based diagrams aren't free. Mermaid's auto-layout struggles past roughly a dozen participants — beyond that, hand-tuned tools still win on readability. And a diagram checked into a repo is only as trustworthy as the review discipline around it; nothing stops it from going stale, it's just now a code review problem instead of a wiki problem, which in my experience is a discipline most engineering teams already have.</p>",
      },
      {
        type: 'callout',
        variant: 'warn',
        title: "Don't diagram everything",
        body: 'A sequence diagram for every function call is worse than no diagram at all — reserve it for flows that cross a service boundary, involve an external system, or trip people up in onboarding.',
      },
      { type: 'heading', id: 'takeaways', text: 'Takeaways' },
      {
        type: 'html',
        html: "<ul><li>Keep diagrams as text, in the same repo as the code they describe.</li><li>Review diagram changes in the same pull request as the behaviour change.</li><li>Reserve diagrams for service boundaries and external integrations — not every function call.</li><li>Mermaid renders natively in GitHub/GitLab previews, so there's no extra tooling tax for reviewers.</li></ul>",
      },
    ],
  },
];
