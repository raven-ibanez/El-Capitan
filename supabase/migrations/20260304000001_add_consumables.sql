/*
  # Add Consumables and Link to Products
  
  1. New Category
    - 'consumables' for tracking internal stocks
    
  2. New Menu Items
    - Big Cap Seal
    - Small Cap Seal
    - Faucet Seal
    - Umbrella Seal
    
  3. New Table
    - `item_consumables` - maps products to their required consumables
    
  4. Automation
    - Update `update_item_stock` to automatically deduct consumables
*/

-- 1. Add Category
INSERT INTO categories (id, name, icon, sort_order, active)
VALUES ('consumables', 'Packaging & Seals', '🏷️', 5, false)
ON CONFLICT (id) DO UPDATE SET active = EXCLUDED.active;

-- 2. Add Consumable Items
INSERT INTO menu_items (id, name, description, base_price, category, available, track_inventory, stock_quantity, low_stock_threshold)
VALUES 
  (gen_random_uuid(), 'Big Cap Seal', 'Consumable for water containers', 0, 'consumables', true, true, 1000, 100),
  (gen_random_uuid(), 'Small Cap Seal', 'Consumable for water containers', 0, 'consumables', true, true, 1000, 100),
  (gen_random_uuid(), 'Faucet Seal', 'Consumable for water containers', 0, 'consumables', true, true, 1000, 100),
  (gen_random_uuid(), 'Umbrella Seal', 'Consumable for round containers', 0, 'consumables', true, true, 1000, 100)
ON CONFLICT (id) DO NOTHING;

-- 3. Create Mapping Table
CREATE TABLE IF NOT EXISTS item_consumables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_item_id uuid NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  consumable_item_id uuid NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  quantity_per_unit integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  UNIQUE(parent_item_id, consumable_item_id)
);

-- Enable RLS
ALTER TABLE item_consumables ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can read consumables mapping"
  ON item_consumables FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage consumables mapping"
  ON item_consumables FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Map Products to Consumables
-- Water containers (Refill & New) get Big Cap, Small Cap, and Faucet seals
WITH products AS (
  SELECT id FROM menu_items WHERE name IN ('Purified Water — Refill Only', 'Purified Water — With New Container')
),
seals AS (
  SELECT id, name FROM menu_items WHERE name IN ('Big Cap Seal', 'Small Cap Seal', 'Faucet Seal')
)
INSERT INTO item_consumables (parent_item_id, consumable_item_id)
SELECT p.id, s.id FROM products p CROSS JOIN seals s
ON CONFLICT DO NOTHING;

-- Round container gets Umbrella seal
INSERT INTO item_consumables (parent_item_id, consumable_item_id)
VALUES (
  (SELECT id FROM menu_items WHERE name = 'Purified Water - Round Container' LIMIT 1),
  (SELECT id FROM menu_items WHERE name = 'Umbrella Seal' LIMIT 1)
)
ON CONFLICT DO NOTHING;

-- 5. Update Stock Function to handle recursion
CREATE OR REPLACE FUNCTION update_item_stock(
  p_menu_item_id uuid,
  p_variation_id uuid,
  p_change_amount integer,
  p_reason text
) RETURNS void AS $$
DECLARE
  v_consumable RECORD;
BEGIN
  -- Update main item/variation stock
  IF p_variation_id IS NOT NULL THEN
    UPDATE variations 
    SET stock_quantity = stock_quantity + p_change_amount
    WHERE id = p_variation_id;
  ELSE
    UPDATE menu_items 
    SET stock_quantity = stock_quantity + p_change_amount
    WHERE id = p_menu_item_id;
  END IF;

  -- Log the change
  INSERT INTO inventory_logs (menu_item_id, variation_id, change_amount, reason)
  VALUES (p_menu_item_id, p_variation_id, p_change_amount, p_reason);

  -- Handle consumables if this is a deduction (Sale)
  -- We don't want recursion for restocks usually, or we might double count
  -- But standard for sales:
  IF p_change_amount < 0 THEN
    FOR v_consumable IN 
      SELECT consumable_item_id, quantity_per_unit 
      FROM item_consumables 
      WHERE parent_item_id = p_menu_item_id
    LOOP
      -- Deduct consumable stock recursively (non-trigger way to avoid infinite loops)
      UPDATE menu_items
      SET stock_quantity = stock_quantity + (p_change_amount * v_consumable.quantity_per_unit)
      WHERE id = v_consumable.consumable_item_id;

      -- Log consumable deduction
      INSERT INTO inventory_logs (menu_item_id, change_amount, reason)
      VALUES (
        v_consumable.consumable_item_id, 
        p_change_amount * v_consumable.quantity_per_unit, 
        'Consumable for ' || (SELECT name FROM menu_items WHERE id = p_menu_item_id)
      );
    END LOOP;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
