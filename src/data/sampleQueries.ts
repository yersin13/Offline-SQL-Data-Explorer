export type QueryItem = {
  topic: string;
  label: string;
  query: string;
  explain: string;
};

export const sampleQueries: QueryItem[] = [
  // JOINS
  {
    topic: 'Joins',
    label: 'Orders with customer name',
    query: `
SELECT o.id AS order_id, c.first_name || ' ' || c.last_name AS customer, o.order_date, o.status
FROM orders o
JOIN customers c ON c.id = o.customer_id
ORDER BY o.order_date DESC;`,
    explain: 'INNER JOIN across orders/customers; discuss keys and sorting for “recent activity”.',
  },
  {
    topic: 'Joins',
    label: 'Order items with product names',
    query: `
SELECT oi.order_id, p.name AS product, oi.quantity, oi.unit_price,
       (oi.quantity * oi.unit_price) AS line_total
FROM order_items oi
JOIN products p ON p.id = oi.product_id
ORDER BY oi.order_id, product;`,
    explain: 'Join fact to dimension, plus a derived field (line_total).',
  },
  {
    topic: 'Joins',
    label: 'Products never ordered',
    query: `
SELECT p.id, p.name, p.category, p.price
FROM products p
LEFT JOIN order_items oi ON oi.product_id = p.id
WHERE oi.product_id IS NULL
ORDER BY p.name;`,
    explain: 'LEFT JOIN anti-join pattern; useful for catalog gaps.',
  },

  // AGGREGATIONS & KPIs
  {
    topic: 'Aggregations',
    label: 'Total spend by customer',
    query: `
SELECT c.id, c.first_name || ' ' || c.last_name AS customer,
       ROUND(SUM(oi.quantity * oi.unit_price), 2) AS total_spend
FROM customers c
JOIN orders o ON o.customer_id = c.id
JOIN order_items oi ON oi.order_id = o.id
GROUP BY c.id
ORDER BY total_spend DESC;`,
    explain: 'GROUP BY across multiple tables; leads to VIP strategy.',
  },
  {
    topic: 'Aggregations',
    label: 'Average order value (AOV)',
    query: `
WITH order_totals AS (
  SELECT o.id AS order_id, SUM(oi.quantity * oi.unit_price) AS order_total
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.id
  GROUP BY o.id
)
SELECT ROUND(AVG(order_total), 2) AS avg_order_value
FROM order_totals;`,
    explain: 'CTE + AVG for AOV; talk about KPI validation.',
  },
  {
    topic: 'Aggregations',
    label: 'Monthly sales (YYYY-MM)',
    query: `
WITH order_totals AS (
  SELECT o.id, DATE(substr(o.order_date,1,10)) AS d,
         SUM(oi.quantity * oi.unit_price) AS order_total
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.id
  GROUP BY o.id
)
SELECT strftime('%Y-%m', d) AS month, ROUND(SUM(order_total), 2) AS revenue
FROM order_totals
GROUP BY month
ORDER BY month;`,
    explain: 'Time bucketing with strftime; mention calendar/timezone considerations.',
  },

  // SUBQUERIES
  {
    topic: 'Subqueries',
    label: 'Customers above average spend',
    query: `
WITH spend AS (
  SELECT c.id AS customer_id,
         SUM(oi.quantity * oi.unit_price) AS total_spend
  FROM customers c
  JOIN orders o ON o.customer_id = c.id
  JOIN order_items oi ON oi.order_id = o.id
  GROUP BY c.id
),
avg_spend AS (
  SELECT AVG(total_spend) AS avg_spend FROM spend
)
SELECT c.first_name || ' ' || c.last_name AS customer, ROUND(s.total_spend,2) AS total_spend
FROM spend s
JOIN customers c ON c.id = s.customer_id
WHERE s.total_spend > (SELECT avg_spend FROM avg_spend)
ORDER BY total_spend DESC;`,
    explain: 'CTEs + comparison to benchmark; segmentation thinking.',
  },
  {
    topic: 'Subqueries',
    label: 'Most recent order per customer',
    query: `
SELECT c.first_name || ' ' || c.last_name AS customer,
       o.id AS order_id, o.order_date, o.status
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE o.order_date = (
  SELECT MAX(o2.order_date)
  FROM orders o2
  WHERE o2.customer_id = o.customer_id
)
ORDER BY o.order_date DESC;`,
    explain: 'Correlated subquery for latest-by-group; window alternative discussion.',
  },

  // WINDOW FUNCTIONS
  {
    topic: 'Window',
    label: 'Top product per category by revenue',
    query: `
WITH line AS (
  SELECT p.category, p.name,
         SUM(oi.quantity * oi.unit_price) AS revenue
  FROM products p
  LEFT JOIN order_items oi ON oi.product_id = p.id
  GROUP BY p.category, p.name
),
ranked AS (
  SELECT *,
         RANK() OVER (PARTITION BY category ORDER BY revenue DESC) AS rnk
  FROM line
)
SELECT category, name, ROUND(revenue,2) AS revenue
FROM ranked
WHERE rnk = 1
ORDER BY category;`,
    explain: 'Window + PARTITION BY for per-category ranking; RANK vs DENSE_RANK.',
  },

  // DATA QUALITY
  {
    topic: 'Data Quality',
    label: 'Orders missing items',
    query: `
SELECT o.id AS order_id, o.order_date, o.status
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
GROUP BY o.id
HAVING COUNT(oi.product_id) = 0;`,
    explain: 'Detect joins with zero children; propose guards and tests.',
  },
  {
    topic: 'Data Quality',
    label: 'Customers with no orders',
    query: `
SELECT c.id, c.first_name || ' ' || c.last_name AS customer, c.country
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.id IS NULL
ORDER BY customer;`,
    explain: 'Funnel/onboarding view; outreach candidates.',
  },

  // REPORTING
  {
    topic: 'Reporting',
    label: 'Order status summary',
    query: `
SELECT status, COUNT(*) AS total_orders
FROM orders
GROUP BY status
ORDER BY total_orders DESC;`,
    explain: 'Dimensional breakdown; talk about status lifecycle.',
  },
  {
    topic: 'Reporting',
    label: 'Basket analysis: top 5 products by quantity',
    query: `
SELECT p.name, SUM(oi.quantity) AS total_units
FROM products p
JOIN order_items oi ON oi.product_id = p.id
GROUP BY p.id
ORDER BY total_units DESC
LIMIT 5;`,
    explain: 'Simple basket lens; segue to advanced analysis beyond SQL.',
  },
];
