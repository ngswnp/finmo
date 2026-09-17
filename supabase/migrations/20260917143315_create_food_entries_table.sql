/*
# Create food_entries table (single-tenant, no auth)

1. New Tables
- `food_entries`
  - `id` (uuid, primary key, auto-generated)
  - `dish_name` (text, not null) — detected or user-entered dish name
  - `price` (numeric, not null) — estimated or user-edited price in USD
  - `image_url` (text, nullable) — optional URL to the captured photo
  - `note` (text, nullable) — optional note/caption
  - `created_at` (timestamptz, defaults to now()) — when the entry was posted

2. Security
- Enable RLS on `food_entries`.
- Allow anon + authenticated full CRUD because the data is intentionally
  shared/public (single-tenant app, no sign-in screen).
*/

CREATE TABLE IF NOT EXISTS food_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dish_name text NOT NULL,
  price numeric(10,2) NOT NULL DEFAULT 0,
  image_url text,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE food_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_food_entries" ON food_entries;
CREATE POLICY "anon_select_food_entries"
ON food_entries FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_food_entries" ON food_entries;
CREATE POLICY "anon_insert_food_entries"
ON food_entries FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_food_entries" ON food_entries;
CREATE POLICY "anon_update_food_entries"
ON food_entries FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_food_entries" ON food_entries;
CREATE POLICY "anon_delete_food_entries"
ON food_entries FOR DELETE
TO anon, authenticated USING (true);
