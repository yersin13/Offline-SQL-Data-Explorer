import React from "react";

type Props = {
  table: string;
  columns: string[];
  rows: (string | number | null)[][];
  totalRows: number | null;
  onOpen: (table: string) => void;
};

const TablePreview: React.FC<Props> = ({ table, columns, rows, totalRows, onOpen }) => {
  return (
    <div className="slab-card slab-preview">
      <div className="slab-preview-header">
        <div className="slab-preview-title">
          <span className="slab-badge">{table}</span>
          {typeof totalRows === "number" && (
            <span className="slab-muted"> • {totalRows} rows</span>
          )}
        </div>
        <button className="slab-btn slab-btn-ghost" onClick={() => onOpen(table)}>
          Open in editor
        </button>
      </div>

      {columns.length === 0 ? (
        <div className="slab-muted">No columns</div>
      ) : (
        <div className="slab-mini-wrap">
          <table className="slab-mini-table">
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="slab-muted">
                    No rows to show
                  </td>
                </tr>
              ) : (
                rows.map((r, i) => (
                  <tr key={i}>
                    {r.map((val, j) => (
                      <td key={j}>{val as any}</td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TablePreview;
