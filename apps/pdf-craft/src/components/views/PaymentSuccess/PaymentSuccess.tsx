import { Container, Stack, Text, Button, Card, CardTitle, CardBody } from '@fhdamd/threads'

const iconStyle: React.CSSProperties = {
  width: 64,
  height: 64,
  borderRadius: '50%',
  background: 'var(--th-color-success-subtle)',
  color: 'var(--th-color-success-text)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
}

export default function PaymentSuccess() {
  return (
    <Container style={{ paddingBlock: 'var(--th-space-16)' }}>
      <Stack gap={8} align="center" style={{ maxWidth: 480, marginInline: 'auto', textAlign: 'center' }}>

        <div style={iconStyle} aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5"/>
          </svg>
        </div>

        <Stack gap={3} align="center">
          <Text as="h1" size="2xl" family="serif" color="1" weight={400}>
            Payment successful
          </Text>
          <Text as="p" size="base" color="2">
            Your credits have been added to your account and are ready to use right away.
          </Text>
        </Stack>

        <Card style={{ width: '100%', textAlign: 'left' }}>
          <CardTitle>Your credits work across</CardTitle>
          <CardBody>
            <Stack as="ul" gap={2} style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {['Merge PDFs', 'Image to PDF', 'Encrypt & decrypt PDFs'].map(tool => (
                <li key={tool} style={{ display: 'flex', alignItems: 'center', gap: 'var(--th-space-3)' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--th-color-accent)', flexShrink: 0, display: 'inline-block' }} aria-hidden="true" />
                  <Text as="span" size="base" color="1">{tool}</Text>
                </li>
              ))}
            </Stack>
          </CardBody>
        </Card>

        <Stack gap={3} style={{ width: '100%' }}>
          <Button href="/dashboard" variant="solid-ink" style={{ width: '100%', justifyContent: 'center' }}>
            Go to dashboard
          </Button>
          <Button href="/buy-credits" variant="ghost" style={{ width: '100%', justifyContent: 'center' }}>
            Buy more credits
          </Button>
        </Stack>

      </Stack>
    </Container>
  )
}
