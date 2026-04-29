import { DataTable, Heading, type TableHeader } from '../../ui'
import './userFileList.css'

interface UserFileListProps {
  files?: any[];
  mode?: string;
}

export default function UserFileList({ files = [], mode }: UserFileListProps) {

  const tableHeaders: TableHeader[] = [
    { label: 'File Name', key: 'fileName' },
    { label: 'Operation', key: 'operation' },
    { label: 'Created At', key: 'createdAt' },
    { label: mode === 'trash' ? 'Deleted At' : 'Actions', key: 'actions' }
  ]


  const tableData = files.map(file => ({
    id: file.id,
    fileName: file.fileName,
    operation: (file.operation as string).toUpperCase(),
    createdAt: file.createdAt.toDate().toLocaleString(),
    actions: (
      mode === 'trash' ? (
        <span className="deleted-label">{file.expiresAt.toDate().toLocaleString()}</span>
      ) : (
        <div>
          <a href={file.fileUrl} target="_blank">
            <img src="/icons/icon-download.svg" alt="Download" />
            <span style={{ marginLeft: '8px' }}>Download</span>
          </a>
        </div>
      )
    )
  }));

  return (
    <div className="user-file-list">
      <DataTable headers={tableHeaders} data={tableData} />
    </div >
  );
}