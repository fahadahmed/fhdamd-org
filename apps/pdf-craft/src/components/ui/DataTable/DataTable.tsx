import './datatable.css'

export interface TableHeader {
  label: string;
  key: string;
  sortable?: boolean;
}

export interface DataTableProps {
  headers: TableHeader[];
  data: any[];
}

export default function DataTable({ headers, data }: DataTableProps) {
  if (data.length === 0) {
    return <div className="data-table-empty">No data available</div>;
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          {headers.map((header) => (
            <th key={header.key} className="data-table-header">
              {header.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={rowIndex} className="data-table-row">
            {headers.map((header, colIndex) => (
              <td key={colIndex} className="data-table-cell">
                {row[header.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
