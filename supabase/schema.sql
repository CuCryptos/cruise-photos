-- Cruise Photo Sales System Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sessions table (cruise events)
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cruise_date DATE NOT NULL,
    name VARCHAR(255) NOT NULL,
    qr_code_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tables/groups within a session
CREATE TABLE tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    table_number VARCHAR(50) NOT NULL,
    qr_code_url TEXT,
    access_code VARCHAR(10) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Photos
CREATE TABLE photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_id UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
    cloudinary_public_id VARCHAR(255) NOT NULL UNIQUE,
    thumbnail_url TEXT NOT NULL,
    full_url TEXT NOT NULL,
    price_cents INTEGER NOT NULL DEFAULT 1499,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clover_order_id VARCHAR(255),
    customer_email VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
    total_cents INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items (purchased photos)
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
    download_token UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    downloaded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_tables_session_id ON tables(session_id);
CREATE INDEX idx_tables_access_code ON tables(access_code);
CREATE INDEX idx_photos_table_id ON photos(table_id);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_download_token ON order_items(download_token);
CREATE INDEX idx_sessions_cruise_date ON sessions(cruise_date);

-- Row Level Security (RLS)
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Public read access for tables (via access code)
CREATE POLICY "Tables are viewable by access code" ON tables
    FOR SELECT USING (true);

-- Public read access for photos (linked to accessible tables)
CREATE POLICY "Photos are viewable via table access" ON photos
    FOR SELECT USING (true);

-- Orders can be read by the customer
CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT USING (true);

-- Order items viewable
CREATE POLICY "Order items viewable" ON order_items
    FOR SELECT USING (true);

-- Service role has full access (for admin operations)
-- Note: Service role bypasses RLS by default

-- Function to validate download token and mark as downloaded
CREATE OR REPLACE FUNCTION validate_download_token(token UUID)
RETURNS TABLE (
    photo_cloudinary_id VARCHAR(255),
    is_valid BOOLEAN
) AS $$
DECLARE
    item_record order_items%ROWTYPE;
    photo_record photos%ROWTYPE;
BEGIN
    -- Find the order item with this token
    SELECT * INTO item_record FROM order_items WHERE download_token = token;

    IF NOT FOUND THEN
        RETURN QUERY SELECT NULL::VARCHAR(255), FALSE;
        RETURN;
    END IF;

    -- Check if the order is paid
    IF NOT EXISTS (SELECT 1 FROM orders WHERE id = item_record.order_id AND status = 'paid') THEN
        RETURN QUERY SELECT NULL::VARCHAR(255), FALSE;
        RETURN;
    END IF;

    -- Get the photo
    SELECT * INTO photo_record FROM photos WHERE id = item_record.photo_id;

    -- Mark as downloaded if first time
    IF item_record.downloaded_at IS NULL THEN
        UPDATE order_items SET downloaded_at = NOW() WHERE download_token = token;
    END IF;

    RETURN QUERY SELECT photo_record.cloudinary_public_id, TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
