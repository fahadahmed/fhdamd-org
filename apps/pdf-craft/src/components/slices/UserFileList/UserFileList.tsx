'use client'
import { useState } from 'react'
import { actions } from 'astro:actions'
import { DataTable, Badge, type DataTableColumn, type BadgeVariant } from '@fhdamd/threads'

const OP_META: Record<string, { label: string; variant: BadgeVariant }> = {
  'merge':        { label: 'Merge',        variant: 'terra'   },
  'image-to-pdf': { label: 'Image to PDF', variant: 'sage'    },
  'encrypt':      { label: 'Protect',      variant: 'info'    },
  'decrypt':      { label: 'Unlock',       variant: 'neutral' },
  'split':        { label: 'Split',        variant: 'terra'   },
  'compress':     { label: 'Compress',     variant: 'info'    },
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
  status: string
  creditCost: number
}

interface UserFileListProps {
  readonly files?: any[]
  readonly mode?: string
}

function DownloadCell({ row }: { readonly row: FileRow }) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const isPending = row.status === 'pending' || row.status === 'migrated'

  if (!isPending) {
    return (
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
    )
  }

  const handleClaim = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await actions.claims.claimFile({ fileId: row.id })
      if (res.data?.success && res.data.payload?.downloadUrl) {
        globalThis.open(res.data.payload.downloadUrl, '_blank')
      } else {
        const msg = res.data?.error ?? 'Failed to download'
        if (msg === 'Insufficient credits') {
          globalThis.location.href = '/buy-credits'
        } else {
          setError(msg)
        }
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <button
        onClick={handleClaim}
        disabled={loading}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: loading ? 'wait' : 'pointer',
          color: 'var(--th-color-accent-text)',
          fontSize: 'var(--th-text-sm)',
          textDecoration: 'underline',
          textUnderlineOffset: '3px',
        }}
      >
        {loading ? 'Processing…' : `Download — ${row.creditCost} ${row.creditCost === 1 ? 'credit' : 'credits'}`}
      </button>
      {error && (
        <span style={{ color: 'var(--th-color-error)', fontSize: 'var(--th-text-xs)' }}>
          {error}
        </span>
      )}
    </div>
  )
}

export default function UserFileList({ files = [], mode }: UserFileListProps) {
  const rows: FileRow[] = files.map(file => ({
    id:         file.id,
    fileName:   file.fileName,
    operation:  file.operation as string,
    createdAt:  file.createdAt?.toDate?.()?.toLocaleString?.() ?? '—',
    fileUrl:    file.fileUrl ?? '',
    expiresAt:  file.expiresAt?.toDate?.()?.toLocaleString?.() ?? '',
    status:     file.status ?? 'ready',
    creditCost: file.creditCost ?? 0,
  }))

  const columns: DataTableColumn<FileRow>[] = [
    { key: 'fileName',  header: 'File Name',  sortable: true },
    {
      key: 'operation',
      header: 'Operation',
      sortable: true,
      render: (row) => <OperationBadge op={row.operation} />,
    },
    { key: 'createdAt', header: 'Created At', sortable: true },
    {
      key: 'fileUrl',
      header: mode === 'trash' ? 'Expires At' : 'Actions',
      render: (row) =>
        mode === 'trash' ? (
          <span style={{ color: 'var(--th-color-text-3)', fontSize: 'var(--th-text-sm)' }}>
            {row.expiresAt}
          </span>
        ) : (
          <DownloadCell row={row} />
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
