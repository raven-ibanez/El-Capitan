/*
  # Add Cash Payment Method

  Adds 'Cash' as a payment option in the payment_methods table.
*/

INSERT INTO payment_methods (id, name, account_number, account_name, qr_code_url, sort_order, active) VALUES
  ('cash', 'Cash', 'N/A', 'N/A', '', 4, true)
ON CONFLICT (id) DO NOTHING;
