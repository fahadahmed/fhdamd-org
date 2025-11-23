import { DataTable, type TableHeader } from '../../ui'

interface UserFileListProps {
  files?: any[];
}

export default function UserFileList({ files = [] }: UserFileListProps) {

  const tableHeaders: TableHeader[] = [
    { label: 'File Name', key: 'fileName' },
    { label: 'Operation', key: 'operation' },
    { label: 'Created At', key: 'createdAt' },
    { label: 'Actions', key: 'actions' }
  ]


  const tableData = files.map(file => ({
    id: file.id,
    fileName: file.fileName,
    operation: (file.operation as string).toUpperCase(),
    createdAt: file.createdAt.toDate().toLocaleString(),
    actions: (
      <div>
        <a href={file.fileUrl} target="_blank">Download</a>
      </div>
    )
  }));

  return (
    <div className="user-file-list">
      <h2>Your Files</h2>
      <DataTable headers={tableHeaders} data={tableData} />
    </div>
  );
}