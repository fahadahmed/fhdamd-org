"use client";
import { useState, useMemo } from "react";
import type { ReactNode } from "react";
import styles from "./DataTable.module.css";

export type SortDir = "asc" | "desc" | null;

export interface DataTableColumn<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  render?: (row: T) => ReactNode;
  width?: string;
}

export interface DataTableProps<T extends Record<string, unknown>> {
  columns: DataTableColumn<T>[];
  rows: T[];
  /** Unique key field for row identity */
  rowKey: keyof T;
  caption?: string;
  pageSize?: number;
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Slot for toolbar actions (buttons, etc.) */
  actions?: ReactNode;
  emptyState?: ReactNode;
  className?: string;
}

const SortIcon = ({ dir }: { dir: SortDir }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={styles.sortIcon}>
    {dir === "asc"  && <path d="M8 9l4-4 4 4M12 5v14" />}
    {dir === "desc" && <path d="M16 15l-4 4-4-4M12 19V5" />}
    {!dir && <><path d="M8 9l4-4 4 4"/><path d="M16 15l-4 4-4-4"/></>}
  </svg>
);

const ChevronIcon = ({ dir }: { dir: "prev" | "next" }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {dir === "prev" ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 18l6-6-6-6" />}
  </svg>
);

export function DataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  rowKey,
  caption,
  pageSize = 10,
  searchable,
  searchPlaceholder = "Search…",
  actions,
  emptyState,
  className,
}: DataTableProps<T>) {
  const [query, setQuery]       = useState("");
  const [sortKey, setSortKey]   = useState<string | null>(null);
  const [sortDir, setSortDir]   = useState<SortDir>(null);
  const [page, setPage]         = useState(1);

  /* Filter */
  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.toLowerCase();
    return rows.filter((row) =>
      Object.values(row).some((v) =>
        String(v ?? "").toLowerCase().includes(q)
      )
    );
  }, [rows, query]);

  /* Sort */
  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return filtered;
    return [...filtered].sort((a, b) => {
      const av = String(a[sortKey] ?? "");
      const bv = String(b[sortKey] ?? "");
      const cmp = av.localeCompare(bv, undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  /* Paginate */
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : d === "desc" ? null : "asc"));
      if (sortDir === "desc") setSortKey(null);
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const handleSearch = (v: string) => {
    setQuery(v);
    setPage(1);
  };

  const getCellValue = (row: T, col: DataTableColumn<T>): ReactNode => {
    if (col.render) return col.render(row);
    const key = col.key as keyof T;
    return String(row[key] ?? "");
  };

  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")}>
      {/* Toolbar */}
      {(searchable || actions) && (
        <div className={styles.toolbar}>
          {searchable && (
            <div className={styles.searchWrap}>
              <svg className={styles.searchIcon} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="search"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className={styles.search}
                aria-label="Search table"
              />
            </div>
          )}
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
      )}

      {/* Table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          {caption && <caption className={styles.caption}>{caption}</caption>}
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  scope="col"
                  className={styles.th}
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      className={styles.sortBtn}
                      onClick={() => handleSort(String(col.key))}
                      aria-label={`Sort by ${col.header}`}
                    >
                      {col.header}
                      <SortIcon dir={sortKey === String(col.key) ? sortDir : null} />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className={styles.empty}>
                  {emptyState ?? "No results found."}
                </td>
              </tr>
            ) : (
              paginated.map((row) => (
                <tr key={String(row[rowKey])} className={styles.row}>
                  {columns.map((col) => (
                    <td key={String(col.key)} className={styles.td}>
                      {getCellValue(row, col)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer — count + pagination */}
      <div className={styles.footer}>
        <span className={styles.count}>
          {sorted.length} {sorted.length === 1 ? "result" : "results"}
          {query && ` for "${query}"`}
        </span>
        {totalPages > 1 && (
          <div className={styles.pagination} aria-label="Pagination">
            <button
              type="button"
              className={styles.pgBtn}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <ChevronIcon dir="prev" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                className={[styles.pgNum, p === currentPage ? styles.pgActive : ""].filter(Boolean).join(" ")}
                onClick={() => setPage(p)}
                aria-label={`Page ${p}`}
                aria-current={p === currentPage ? "page" : undefined}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              className={styles.pgBtn}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              <ChevronIcon dir="next" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
