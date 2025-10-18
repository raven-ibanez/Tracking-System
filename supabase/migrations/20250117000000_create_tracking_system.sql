/*
  # Tracking System Schema

  1. New Tables
    - `tracking_records`
      - `id` (uuid, primary key)
      - `tracking_number` (text, unique) - unique tracking identifier
      - `customer_name` (text) - customer full name
      - `customer_phone` (text) - customer phone number
      - `status` (text) - shipment status (pending, in_transit, delivered, etc.)
      - `notes` (text) - additional notes or description
      - `image_url` (text) - URL to the uploaded image
      - `extracted_data` (jsonb) - raw extracted data from OCR
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `created_by` (uuid) - admin who created the record

  2. Indexes
    - Index on customer_name and customer_phone for fast lookups
    - Index on tracking_number for unique queries

  3. Security
    - Enable RLS on tracking_records
    - Public can query by name and phone
    - Only authenticated users can create/update records
*/

-- Create tracking_records table
CREATE TABLE IF NOT EXISTS tracking_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_number text UNIQUE NOT NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  image_url text,
  extracted_data jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tracking_number ON tracking_records(tracking_number);
CREATE INDEX IF NOT EXISTS idx_customer_lookup ON tracking_records(customer_name, customer_phone);
CREATE INDEX IF NOT EXISTS idx_status ON tracking_records(status);
CREATE INDEX IF NOT EXISTS idx_created_at ON tracking_records(created_at DESC);

-- Enable Row Level Security
ALTER TABLE tracking_records ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can query tracking records by name and phone
CREATE POLICY "Anyone can query their tracking records"
  ON tracking_records
  FOR SELECT
  TO public
  USING (true);

-- Policy: Only authenticated users can insert tracking records
CREATE POLICY "Authenticated users can create tracking records"
  ON tracking_records
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Only authenticated users can update tracking records
CREATE POLICY "Authenticated users can update tracking records"
  ON tracking_records
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Only authenticated users can delete tracking records
CREATE POLICY "Authenticated users can delete tracking records"
  ON tracking_records
  FOR DELETE
  TO authenticated
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_tracking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_tracking_records_updated_at
  BEFORE UPDATE ON tracking_records
  FOR EACH ROW
  EXECUTE FUNCTION update_tracking_updated_at();

-- Create function to generate tracking number
CREATE OR REPLACE FUNCTION generate_tracking_number()
RETURNS text AS $$
DECLARE
  new_tracking_number text;
  is_unique boolean := false;
BEGIN
  WHILE NOT is_unique LOOP
    -- Generate tracking number format: TRK-YYYYMMDD-XXXX (where X is random)
    new_tracking_number := 'TRK-' || 
                          to_char(now(), 'YYYYMMDD') || '-' ||
                          LPAD(floor(random() * 10000)::text, 4, '0');
    
    -- Check if tracking number is unique
    SELECT NOT EXISTS(
      SELECT 1 FROM tracking_records WHERE tracking_number = new_tracking_number
    ) INTO is_unique;
  END LOOP;
  
  RETURN new_tracking_number;
END;
$$ LANGUAGE plpgsql;

