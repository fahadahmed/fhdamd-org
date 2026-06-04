import { DataTable, Badge, type DataTableColumn, type BadgeVariant } from '@fhdamd/threads'

const OP_META: Record<string, { label: string; variant: BadgeVariant }> = {
  'merge':       { label: 'Merge',       variant: 'terra'   },
  'image-to-pdf':{ label: 'Image to PDF',variant: 'sage'    },
  'encrypt':     { label: 'Protect',     variant: 'info'    },
  'decrypt':     { label: 'Unlock',      variant: 'neutral' },
}

function OperationBadge({ op }: { op: string }) {
  const meta = OP_META[op.toLowerCase()] ?? { label: op, variant: 'neutral' as BadgeVariant }
  return <Badge variant={meta.variant}>{meta.label}</Badge>
}

interface FileRow extends Record<string, unknown> {
  id: string
  fileName: string
  operation: string
  createdAt: string
  fileUrl: string
  expiresAt: string
}

interface UserFileListProps {
  files?: any[]
  mode?: string
}

export default function UserFileList({ files = [], mode }: UserFileListProps) {
  const rows: FileRow[] = files.map(file => ({
    id:        file.id,
    fileName:  file.fileName,
    operation: file.operation as string,
    createdAt: file.createdAt.toDate().toLocaleString(),
    fileUrl:   file.fileUrl ?? '',
    expiresAt: file.expiresAt ? file.expiresAt.toDate().toLocaleString() : '',
  }))

  const columns: DataTableColumn<FileRow>[] = [
    { key: 'fileName',  header: 'File Name',  sortable: true },
    {
      key: 'operation',
      header: 'Operation',
      sortable: true,
      render: (row) => <OperationBadge op={row.operation} />,
    },
    { key: 'createdAt', header: 'Created At',  sortable: true },
    {
      key: 'fileUrl',
      header: mode === 'trash' ? 'Expires At' : 'Actions',
      render: (row) =>
        mode === 'trash' ? (
          <span style={{ color: 'var(--th-color-text-3)', fontSize: 'var(--th-text-sm)' }}>
            {row.expiresAt}
          </span>
        ) : (
          <a
            href={row.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--th-color-accent-text)',
              fontSize: 'var(--th-text-sm)',
              textDecoration: 'none',
            }}
            onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
          >
            <img src="/icons/icon-download.svg" alt="" width={14} height={14} />
            Download
          </a>
        ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      rows={rows}
      rowKey="id"
      pageSize={10}
      searchable
      searchPlaceholder="Search files..."
      emptyState={
        <span style={{ color: 'var(--th-color-text-3)', fontStyle: 'italic' }}>
          {mode === 'trash' ? 'No deleted files.' : 'No files yet. Run a PDF operation to get started.'}
        </span>
      }
    />
  )
}
