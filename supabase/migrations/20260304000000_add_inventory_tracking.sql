/*
  # Add Inventory Management and Monitoring

  1. New Columns
    - `menu_items`
      - `track_inventory` (boolean) - whether to track stock for this item
      - `stock_quantity` (integer) - current stock level
      - `low_stock_threshold` (integer) - threshold for low stock alert
    - `variations`
      - `track_inventory` (boolean) - whether to track stock for this variation
      - `stock_quantity` (integer) - current stock level
      - `low_stock_threshold` (integer) - threshold for low stock alert

  2. New Tables
    - `inventory_logs`
      - `id` (uuid, primary key)
      - `menu_item_id` (uuid, references menu_items)
      - `variation_id` (uuid, references variations, optional)
      - `change_amount` (integer) - positive for additions, negative for deductions
      - `reason` (text) - e.g., 'restock', 'sale', 'adjustment'
      - `created_at` (timestamp)

  3. Security
    - Enable RLS on inventory_logs
    - Add policies for authenticated admin access
*/

-- Add columns to menu_items
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'menu_items' AND COLUMN_NAME = 'track_inventory') THEN
    ALTER TABLE menu_items ADD COLUMN track_inventory boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'menu_items' AND COLUMN_NAME = 'stock_quantity') THEN
    ALTER TABLE menu_items ADD COLUMN stock_quantity integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'menu_items' AND COLUMN_NAME = 'low_stock_threshold') THEN
    ALTER TABLE menu_items ADD COLUMN low_stock_threshold integer DEFAULT 5;
  END IF;
END $$;

-- Add columns to variations
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'variations' AND COLUMN_NAME = 'track_inventory') THEN
    ALTER TABLE variations ADD COLUMN track_inventory boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'variations' AND COLUMN_NAME = 'stock_quantity') THEN
    ALTER TABLE variations ADD COLUMN stock_quantity integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'variations' AND COLUMN_NAME = 'low_stock_threshold') THEN
    ALTER TABLE variations ADD COLUMN low_stock_threshold integer DEFAULT 5;
  END IF;
END $$;

-- Create inventory_logs table
CREATE TABLE IF NOT EXISTS inventory_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE CASCADE,
  variation_id uuid REFERENCES variations(id) ON DELETE CASCADE,
  change_amount integer NOT NULL,
  reason text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated admin access
CREATE POLICY "Authenticated users can manage inventory logs"
  ON inventory_logs
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create a function to update stock automatically and log it
CREATE OR REPLACE FUNCTION update_item_stock(
  p_menu_item_id uuid,
  p_variation_id uuid,
  p_change_amount integer,
  p_reason text
) RETURNS void AS $$
BEGIN
  IF p_variation_id IS NOT NULL THEN
    UPDATE variations 
    SET stock_quantity = stock_quantity + p_change_amount
    WHERE id = p_variation_id;
  ELSE
    UPDATE menu_items 
    SET stock_quantity = stock_quantity + p_change_amount
    WHERE id = p_menu_item_id;
  END IF;

  INSERT INTO inventory_logs (menu_item_id, variation_id, change_amount, reason)
  VALUES (p_menu_item_id, p_variation_id, p_change_amount, p_reason);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
