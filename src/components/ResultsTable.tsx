import React from 'react';

type Props = {
  columns: string[];
  rows: (Array<string | number | null>)[];
};

const ResultsTable: React.FC<Props> = ({ columns, rows }) => {
  if (!columns.length && !rows.length) {
    return <div className="slab-muted">No rows to display.</div>;
  }

  return (
    <div className="slab-table-wrap">
      <table className="slab-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((val, j) => (
                <td key={j}>{val as any}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsTable;
