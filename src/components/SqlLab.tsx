import React, { useEffect, useMemo, useState } from 'react';
import { Database } from 'sql.js';
import { initDb } from '../db/initDb';
import ResultsTable from './ResultsTable';
import TablePreview from './TablePreview';
import { sampleQueries, QueryItem } from '../data/sampleQueries';

const DEFAULT_SQL = 'SELECT * FROM products;';

const toNumberOrNull = (v: string | number | Uint8Array | null | undefined): number | null => {
  if (v == null) return null;
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  }
  // Uint8Array (BLOB) → not a number
  return null;
};

type Mini = { columns: string[]; rows: (Array<string | number | null>)[]; total: number | null };


const SqlLab: React.FC = () => {
  const [db, setDb] = useState<Database | null>(null);
  const [query, setQuery] = useState<string>(DEFAULT_SQL);
  const [columns, setColumns] = useState<string[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [info, setInfo] = useState<string>('');
  const [topic, setTopic] = useState<string>('All');
  const [selectedLabel, setSelectedLabel] = useState<string>('');

  // NEW: top previews
  const [miniCustomers, setMiniCustomers] = useState<Mini>({ columns: [], rows: [], total: null });
  const [miniOrders, setMiniOrders]       = useState<Mini>({ columns: [], rows: [], total: null });
  const [miniItems, setMiniItems]         = useState<Mini>({ columns: [], rows: [], total: null });
  const [miniProducts, setMiniProducts]   = useState<Mini>({ columns: [], rows: [], total: null });

  useEffect(() => {
    (async () => {
      const dbi = await initDb();
      setDb(dbi);
      await loadTopPreviews(dbi);
      runQuery(DEFAULT_SQL, dbi);
    })();
  }, []);

  const topics = useMemo(
    () => ['All', ...Array.from(new Set(sampleQueries.map((q) => q.topic)))],
    []
  );

  const filtered = useMemo(
    () => sampleQueries.filter((q) => topic === 'All' || q.topic === topic),
    [topic]
  );

  const explanation = useMemo(() => {
    const hit = sampleQueries.find((q) => q.label === selectedLabel);
    return hit?.explain || '';
  }, [selectedLabel]);

  const handlePick = (qi: QueryItem) => {
    setQuery(qi.query.trim());
    setSelectedLabel(qi.label);
  };

  const runQuery = (sql: string, instance?: Database) => {
    setError('');
    setInfo('');
    try {
      const dbi = instance || db;
      if (!dbi) return;
      const res = dbi.exec(sql);
      if (res.length) {
        setColumns(res[0].columns);
        setRows(res[0].values);
      } else {
        setColumns([]);
        setRows([]);
        setInfo('✔ Query executed successfully (no result set).');
      }
    } catch (e: any) {
      setColumns([]);
      setRows([]);
      setError(e?.message || 'Unknown SQL error');
    }
  };

  // NEW: helper to fetch first N rows + count for any table
const fetchMini = (dbi: Database, table: string, limit = 5): Mini => {
  const res = dbi.exec(`SELECT * FROM ${table} LIMIT ${limit};`);
  const cnt = dbi.exec(`SELECT COUNT(*) AS c FROM ${table};`);

  // sql.js returns rows as arrays of (string|number|Uint8Array|null)
  const columns = res[0]?.columns ?? [];
  const rows = (res[0]?.values ?? []) as (Array<string | number | Uint8Array | null>)[];

  const rawCount = cnt[0]?.values?.[0]?.[0] as string | number | Uint8Array | null | undefined;
  const total = toNumberOrNull(rawCount);

  // Optional: strip Uint8Array from table previews to keep the UI sane
  const normalizedRows = rows.map(r =>
    r.map(cell => (cell instanceof Uint8Array ? '[BLOB]' : cell))
  ) as (Array<string | number | null>)[];

  return {
    columns,
    rows: normalizedRows,
    total, // now strictly number | null
  };
};


  const loadTopPreviews = async (dbi: Database) => {
    setMiniCustomers(fetchMini(dbi, 'customers'));
    setMiniOrders(fetchMini(dbi, 'orders'));
    setMiniItems(fetchMini(dbi, 'order_items'));
    setMiniProducts(fetchMini(dbi, 'products'));
  };

  // NEW: open a whole table in the editor fast
  const openTable = (table: string) => {
    const sql = `SELECT * FROM ${table};`;
    setSelectedLabel('');
    setQuery(sql);
    runQuery(sql);
  };

  return (
    <div className="slab-page">
      <div className="slab-container">
        <header className="slab-header">
          <h1>System Analyst SQL Lab</h1>
          <span className="slab-chip">SQLite (sql.js) • In-browser</span>
        </header>

  
        <section className="slab-card">
          <div className="slab-preview-grid">
            <TablePreview table="customers"   {...{ 
              columns: miniCustomers.columns, rows: miniCustomers.rows, totalRows: miniCustomers.total, onOpen: openTable 
            }} />
            <TablePreview table="orders"      {...{ 
              columns: miniOrders.columns, rows: miniOrders.rows, totalRows: miniOrders.total, onOpen: openTable 
            }} />
            <TablePreview table="order_items" {...{ 
              columns: miniItems.columns, rows: miniItems.rows, totalRows: miniItems.total, onOpen: openTable 
            }} />
            <TablePreview table="products"    {...{ 
              columns: miniProducts.columns, rows: miniProducts.rows, totalRows: miniProducts.total, onOpen: openTable 
            }} />
          </div>
        </section>

        {/* Interview talk track */}
        <section className="slab-card">
          <strong>Interview talk track</strong>
          <ul className="slab-list">
            <li><em>Frame:</em> customer value, order health, product performance.</li>
            <li><em>Model:</em> Customers, Orders, OrderItems, Products with FKs + indexes.</li>
            <li><em>KPIs:</em> total spend, AOV, monthly revenue, never-ordered products, recency.</li>
            <li><em>Answer:</em> choose a query, explain join/aggregate/window, note data quality checks.</li>
            <li><em>Next:</em> views, validations, timezones/calendars, scheduled reports/dashboards.</li>
          </ul>
        </section>

        {/* Query picker */}
        <section className="slab-card">
          <div className="slab-grid">
            <div className="slab-field">
              <label>Topic</label>
              <select
                className="slab-input"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              >
                {topics.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="slab-field slab-field-grow">
              <label>Sample queries</label>
              <select
                className="slab-input"
                value={selectedLabel}
                onChange={(e) => {
                  const qi = sampleQueries.find((s) => s.label === e.target.value);
                  if (qi) handlePick(qi);
                }}
              >
                <option value="">— Select a query —</option>
                {filtered.map((q, i) => (
                  <option key={`${q.topic}-${i}`} value={q.label}>
                    [{q.topic}] {q.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="slab-field">
            <label>SQL</label>
            <textarea
              className="slab-textarea"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="slab-actions">
            <button className="slab-btn" onClick={() => runQuery(query)}>Run Query</button>
            {error && <span className="slab-error">Error: {error}</span>}
            {info && <span className="slab-success">{info}</span>}
          </div>

          {explanation && (
            <div className="slab-explain">
              <strong>Analyst angle:</strong> {explanation}
            </div>
          )}
        </section>

        {/* Results */}
        <section className="slab-card">
          <h3>Results</h3>
          <ResultsTable columns={columns} rows={rows} />
        </section>

        {/* Schema */}
        <section className="slab-card">
          <strong>Schema quick reference</strong>
          <pre className="slab-pre">
{`customers(id PK, first_name, last_name, country, signup_date)
products (id PK, name, price, category)
orders   (id PK, customer_id FK->customers.id, order_date, status)
order_items(order_id FK->orders.id, product_id FK->products.id, quantity, unit_price)
Indexes: orders(customer_id), order_items(product_id)`}
          </pre>
        </section>
      </div>
    </div>
  );
};

export default SqlLab;
