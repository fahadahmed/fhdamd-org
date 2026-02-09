import { useState, useMemo } from 'react';
import './datatable.css'

export interface TableHeader {
  label: string;
  key: string;
  sortable?: boolean;
}

export interface DataTableProps {
  headers: TableHeader[];
  data: any[];
  pageSize?: number;
}

export default function DataTable({ headers, data, pageSize = 5 }: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / pageSize);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return data.slice(startIndex, startIndex + pageSize);
  }, [data, currentPage, pageSize]);

  if (data.length === 0) {
    return <div className="data-table-empty">No data available</div>;
  }

  return (
    <div className="data-table-wrapper">
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
          {paginatedData.map((row, rowIndex) => (
            <tr key={rowIndex} className="data-table-row">
              {headers.map((header) => (
                <td key={header.key} className="data-table-cell">
                  {row[header.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="data-table-pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Prev
          </button>

          <span>
            Page {currentPage} of {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
