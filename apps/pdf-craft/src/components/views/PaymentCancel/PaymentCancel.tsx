import { Container, Stack, Text, Button, Callout } from '@fhdamd/threads'

const iconStyle: React.CSSProperties = {
  width: 64,
  height: 64,
  borderRadius: 'var(--th-radius-lg)',
  background: 'var(--th-color-error-subtle)',
  color: 'var(--th-color-error-text)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
}

export default function PaymentCancel() {
  return (
    <Container style={{ paddingBlock: 'var(--th-space-16)' }}>
      <Stack gap={8} align="center" style={{ maxWidth: 480, marginInline: 'auto', textAlign: 'center' }}>

        <div style={iconStyle} aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </div>

        <Stack gap={3} align="center">
          <Text as="h1" size="2xl" family="serif" color="1" weight={400}>
            Payment cancelled
          </Text>
          <Text as="p" size="base" color="2">
            No worries — your payment was not processed and no charges were made.
          </Text>
        </Stack>

        <Callout variant="info" style={{ textAlign: 'left', width: '100%' }}>
          Your account and any existing credits are untouched. Credits are only deducted when an operation completes successfully.
        </Callout>

        <Stack gap={3} style={{ width: '100%' }}>
          <Button href="/buy-credits" variant="solid-ink" style={{ width: '100%', justifyContent: 'center' }}>
            Try again
          </Button>
          <Button href="/dashboard" variant="ghost" style={{ width: '100%', justifyContent: 'center' }}>
            Back to dashboard
          </Button>
        </Stack>

      </Stack>
    </Container>
  )
}
