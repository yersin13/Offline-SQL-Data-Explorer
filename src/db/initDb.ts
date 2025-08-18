import initSqlJs, { Database } from 'sql.js';

export async function initDb(): Promise<Database> {
  const SQL = await initSqlJs({
    locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
  });

  const db = new SQL.Database();

  db.run(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name  TEXT NOT NULL,
      country    TEXT NOT NULL,
      signup_date TEXT NOT NULL
    );

    CREATE TABLE products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      category TEXT NOT NULL
    );

    CREATE TABLE orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      order_date TEXT NOT NULL,
      status TEXT NOT NULL,
      FOREIGN KEY(customer_id) REFERENCES customers(id)
    );

    CREATE TABLE order_items (
      order_id   INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity   INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      PRIMARY KEY (order_id, product_id),
      FOREIGN KEY(order_id) REFERENCES orders(id),
      FOREIGN KEY(product_id) REFERENCES products(id)
    );

    CREATE INDEX idx_orders_customer ON orders(customer_id);
    CREATE INDEX idx_items_product  ON order_items(product_id);
  `);

  db.run(`
    INSERT INTO customers (first_name, last_name, country, signup_date) VALUES
      ('Alice','Brown','Canada','2024-10-05'),
      ('Ben','Lopez','Canada','2024-12-11'),
      ('Chloe','Ng','USA','2025-01-17'),
      ('David','Singh','Canada','2025-02-02'),
      ('Eva','Martinez','Mexico','2025-03-09'),
      ('Frank','Wong','USA','2025-03-20');

    INSERT INTO products (name, price, category) VALUES
      ('Extra Virgin Olive Oil', 9.99, 'Pantry'),
      ('Free Range Eggs', 4.49, 'Dairy'),
      ('Almond Milk', 3.79, 'Dairy'),
      ('Whole Wheat Bread', 2.50, 'Bakery'),
      ('Organic Apple', 1.29, 'Fruits'),
      ('Granola Bars', 3.20, 'Snacks'),
      ('Bananas', 1.10, 'Fruits'),
      ('Milk Chocolate', 2.99, 'Snacks'),
      ('Peanut Butter', 4.89, 'Pantry'),
      ('Greek Yogurt', 5.49, 'Dairy'),
      ('Orange Juice', 3.99, 'Beverages'),
      ('Brown Rice', 2.79, 'Pantry'),
      ('Shampoo', 6.25, 'Personal Care'),
      ('Toilet Paper (12 pack)', 7.99, 'Household'),
      ('Frozen Pizza', 4.99, 'Frozen Foods'),
      ('Strawberries', 3.50, 'Fruits'),
      ('Cheddar Cheese', 4.75, 'Dairy'),
      ('Sparkling Water', 1.99, 'Beverages');

    INSERT INTO orders (customer_id, order_date, status) VALUES
      (1,'2025-04-01T10:00:00','placed'),
      (1,'2025-04-15T09:30:00','shipped'),
      (2,'2025-04-16T14:15:00','cancelled'),
      (3,'2025-05-01T11:45:00','placed'),
      (3,'2025-05-02T18:10:00','shipped'),
      (4,'2025-05-10T08:05:00','placed'),
      (5,'2025-06-02T12:22:00','placed'),
      (6,'2025-06-12T16:40:00','shipped');

    INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
      (1, 1, 1, 9.99),
      (1, 4, 2, 2.50),
      (1, 7, 6, 1.10),

      (2, 9, 1, 4.89),
      (2, 11, 2, 3.99),

      (3, 15, 1, 4.99),

      (4, 5, 4, 1.29),
      (4, 10, 2, 5.49),

      (5, 8, 3, 2.99),
      (5, 12, 1, 2.79),

      (6, 1, 1, 9.99),
      (6, 17, 1, 4.75),

      (7, 4, 2, 2.50),
      (7, 6, 5, 3.20),

      (8, 3, 2, 3.79),
      (8, 18, 4, 1.99);
  `);

  return db;
}
