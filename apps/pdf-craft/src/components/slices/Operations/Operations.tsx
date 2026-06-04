import { AutoGrid, OpCard } from '@fhdamd/threads'

const MergeIcon = () => (
  <img src="/icons/icon-merge.svg" alt="" width={40} height={40} />
)
const ConvertIcon = () => (
  <img src="/icons/icon-convert.svg" alt="" width={40} height={40} />
)
const EncryptIcon = () => (
  <img src="/icons/icon-encrypt.svg" alt="" width={40} height={40} />
)
const UnlockIcon = () => (
  <img src="/icons/icon-unlock.svg" alt="" width={40} height={40} />
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
