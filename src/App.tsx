import React, { useEffect, useState } from 'react';
import initSqlJs, { Database } from 'sql.js';
import base64Db from './sampleDb';

const defaultQuery = 'SELECT * FROM products';

const sampleQueries = [
  { label: 'Show all products', query: 'SELECT * FROM products;' },
  { label: 'Names and prices only', query: 'SELECT name, price FROM products;' },
  { label: 'Products under $3', query: 'SELECT * FROM products WHERE price < 3;' },
  { label: 'Sort by price ascending', query: 'SELECT * FROM products ORDER BY price ASC;' },
  { label: 'Count products per category', query: 'SELECT category, COUNT(*) AS total_items FROM products GROUP BY category;' },
  { label: 'Average price per category', query: 'SELECT category, AVG(price) AS avg_price FROM products GROUP BY category;' },
  { label: 'Find products with "Milk"', query: "SELECT * FROM products WHERE name LIKE '%Milk%';" }
];

const App: React.FC = () => {
  const [db, setDb] = useState<Database | null>(null);
  const [query, setQuery] = useState(defaultQuery);
  const [results, setResults] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadDb = async () => {
      const SQL = await initSqlJs({ locateFile: (file: any) => `https://sql.js.org/dist/${file}` });
      const binaryString = atob(base64Db);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const dbInstance = new SQL.Database(bytes);
      setDb(dbInstance);
      runQuery(defaultQuery, dbInstance);
    };

    loadDb();
  }, []);

  const runQuery = (sql: string, dbInstance?: Database) => {
    setError('');
    try {
      const instance = dbInstance || db;
      if (!instance) return;
      const res = instance.exec(sql);
      if (res.length > 0) {
        setColumns(res[0].columns);
        setResults(res[0].values);
      } else {
        setColumns([]);
        setResults([]);
      }
    } catch (err: any) {
      setError(err.message);
      setColumns([]);
      setResults([]);
    }
  };

  return (
    <div className="container">
    <div style={{ background: '#1e1e1e', minHeight: '100vh', padding: '2rem', color: '#fff' }}>
      <h1 style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>Offline SQL Data Explorer</h1>
      <label style={{ fontWeight: 'bold' }}>Try a sample query:</label>
      <select
        onChange={(e) => setQuery(e.target.value)}
        style={{ display: 'block', margin: '1rem 0', padding: '0.5rem', fontFamily: 'monospace' }}
      >
        <option value="">-- Select a query --</option>
        {sampleQueries.map((item, idx) => (
          <option key={idx} value={item.query}>{item.label}</option>
        ))}
      </select>
      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ width: '100%', height: '100px', marginBottom: '1rem', padding: '0.5rem', fontFamily: 'monospace' }}
      />
      <button onClick={() => runQuery(query)} style={{ padding: '0.5rem 1rem', marginBottom: '1rem' }}>
        Run Query
      </button>
      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>Error: {error}</div>}
      {results.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col} style={{ border: '1px solid #ccc', padding: '0.5rem' }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((row, i) => (
              <tr key={i}>
                {row.map((val: any, j: number) => (
                  <td key={j} style={{ border: '1px solid #444', padding: '0.5rem' }}>{val}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
    </div>
  );
};

export default App;
