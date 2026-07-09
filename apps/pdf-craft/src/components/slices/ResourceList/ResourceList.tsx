import { AutoGrid, Card, Text, Button } from '@fhdamd/threads'
import type { Resource } from '../../../utils'

interface ResourceListProps {
  readonly resources: Resource[]
}

function ResourceCard({ resource }: { readonly resource: Resource }) {
  const date = new Date(resource._createdAt).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <Card variant="elevated" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--th-space-3)', padding: 'var(--th-space-5)', flex: 1 }}>
        <Text as="p" size="xs" color="3">{date}</Text>
        <Text as="h2" size="lg" color="1" weight={650} style={{ lineHeight: 1.3 }}>
          {resource.title}
        </Text>
        <Text as="p" size="sm" color="2" style={{ flex: 1 }}>
          {resource.excerpt}
        </Text>
        <div style={{ paddingTop: 'var(--th-space-2)' }}>
          <Button href={`/resources/${resource.slug}`} variant="ghost" size="sm">
            Read article →
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default function ResourceList({ resources }: ResourceListProps) {
  if (!resources.length) {
    return (
      <Text as="p" size="base" color="2" style={{ fontStyle: 'italic' }}>
        No articles yet — check back soon.
      </Text>
    )
  }

  return (
    <AutoGrid minColWidth="280px" gap={5}>
      {resources.map(resource => (
        <ResourceCard key={resource.id} resource={resource} />
      ))}
    </AutoGrid>
  )
}
