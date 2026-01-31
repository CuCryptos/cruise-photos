export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type OrderStatus = 'pending' | 'paid' | 'failed';

export interface Database {
  public: {
    Tables: {
      sessions: {
        Row: {
          id: string;
          cruise_date: string;
          name: string;
          qr_code_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          cruise_date: string;
          name: string;
          qr_code_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          cruise_date?: string;
          name?: string;
          qr_code_url?: string | null;
          created_at?: string;
        };
      };
      tables: {
        Row: {
          id: string;
          session_id: string;
          table_number: string;
          qr_code_url: string | null;
          access_code: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          table_number: string;
          qr_code_url?: string | null;
          access_code: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          table_number?: string;
          qr_code_url?: string | null;
          access_code?: string;
          created_at?: string;
        };
      };
      photos: {
        Row: {
          id: string;
          table_id: string;
          cloudinary_public_id: string;
          thumbnail_url: string;
          full_url: string;
          price_cents: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          table_id: string;
          cloudinary_public_id: string;
          thumbnail_url: string;
          full_url: string;
          price_cents?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          table_id?: string;
          cloudinary_public_id?: string;
          thumbnail_url?: string;
          full_url?: string;
          price_cents?: number;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          clover_order_id: string | null;
          customer_email: string;
          status: OrderStatus;
          total_cents: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          clover_order_id?: string | null;
          customer_email: string;
          status?: OrderStatus;
          total_cents: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          clover_order_id?: string | null;
          customer_email?: string;
          status?: OrderStatus;
          total_cents?: number;
          created_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          photo_id: string;
          download_token: string;
          downloaded_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          photo_id: string;
          download_token?: string;
          downloaded_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          photo_id?: string;
          download_token?: string;
          downloaded_at?: string | null;
          created_at?: string;
        };
      };
    };
  };
}

// Convenience types for use in components
export type Session = Database['public']['Tables']['sessions']['Row'];
export type Table = Database['public']['Tables']['tables']['Row'];
export type Photo = Database['public']['Tables']['photos']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];

// Extended types with relations
export interface TableWithPhotos extends Table {
  photos: Photo[];
}

export interface SessionWithTables extends Session {
  tables: TableWithPhotos[];
}

export interface OrderWithItems extends Order {
  order_items: (OrderItem & { photo: Photo })[];
}
