-- Order items reference the human-readable order_number (UNIQUE on orders)
-- instead of the autoincrement id, so an order and its lines can be inserted
-- together in one D1 batch with no dependency on last_row_id.

DROP TABLE IF EXISTS order_items;

CREATE TABLE order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_number TEXT NOT NULL REFERENCES orders(order_number) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  variant_id TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  name TEXT NOT NULL,
  size TEXT,
  color TEXT,
  unit_price REAL NOT NULL,
  image TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_number ON order_items(order_number);