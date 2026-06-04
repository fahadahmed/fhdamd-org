import { AutoGrid, OpCard } from '@fhdamd/threads'

/* ── Inline SVG icons — stroke colour injected by OpCard's CSS (.icon svg) ── */

const MergeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8 6H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3" />
    <path d="M15 3H9l-1 3h8l-1-3z" />
    <path d="M12 11v6M9 14l3 3 3-3" />
  </svg>
)

const ConvertIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x={3} y={3} width={18} height={18} rx={2} />
    <circle cx={8.5} cy={8.5} r={1.5} />
    <polyline points="21 15 16 10 5 21" />
  </svg>
)

const EncryptIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x={3} y={11} width={18} height={11} rx={2} />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

const UnlockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x={3} y={11} width={18} height={11} rx={2} />
    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
  </svg>
)

export function OperationsContainer() {
  return (
    <AutoGrid minColWidth="240px" gap={4}>
      <OpCard
        name="Merge PDFs"
        description="Combine multiple PDF documents into one file."
        credits={2}
        href="/mergepdf"
        icon={<MergeIcon />}
        iconVariant="terra"
      />
      <OpCard
        name="Image to PDF"
        description="Convert JPG and PNG images into PDF format."
        credits={2}
        href="/imagetopdf"
        icon={<ConvertIcon />}
        iconVariant="sage"
      />
      <OpCard
        name="Protect PDF"
        description="Secure your PDF with a password to prevent access."
        credits={4}
        href="/encryptpdf"
        icon={<EncryptIcon />}
        iconVariant="terra"
      />
      <OpCard
        name="Unlock PDF"
        description="Remove password protection and restrictions easily."
        credits={4}
        href="/decryptpdf"
        icon={<UnlockIcon />}
        iconVariant="sage"
      />
    </AutoGrid>
  )
}

export default function Operations() {
  return <OperationsContainer />
}
