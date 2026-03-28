/**
 * Aligns with supabase/migrations/20250328120000_init_liger.sql
 * Regenerate after schema changes: npx supabase gen types typescript --project-id <ref> > types/database.ts
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role:
            | "buyer"
            | "merchant"
            | "service_provider"
            | "admin"
            | "courier";
          full_name: string | null;
          phone: string | null;
          mpesa_msisdn: string | null;
          avatar_url: string | null;
          merchant_id: string | null;
          service_provider_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?:
            | "buyer"
            | "merchant"
            | "service_provider"
            | "admin"
            | "courier";
          full_name?: string | null;
          phone?: string | null;
          mpesa_msisdn?: string | null;
          avatar_url?: string | null;
          merchant_id?: string | null;
          service_provider_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          role?:
            | "buyer"
            | "merchant"
            | "service_provider"
            | "admin"
            | "courier";
          full_name?: string | null;
          phone?: string | null;
          mpesa_msisdn?: string | null;
          avatar_url?: string | null;
          merchant_id?: string | null;
          service_provider_id?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      merchants: {
        Row: {
          id: string;
          owner_id: string;
          business_name: string;
          description: string | null;
          location_label: string | null;
          latitude: number | null;
          longitude: number | null;
          operating_hours: Json;
          trust_score: string;
          verification_badge: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          business_name: string;
          description?: string | null;
          location_label?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          operating_hours?: Json;
          trust_score?: string;
          verification_badge?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["merchants"]["Insert"]>;
        Relationships: [];
      };
      service_providers: {
        Row: {
          id: string;
          owner_id: string;
          business_name: string;
          bio: string | null;
          latitude: number | null;
          longitude: number | null;
          trust_score: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          business_name: string;
          bio?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          trust_score?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["service_providers"]["Insert"]>;
        Relationships: [];
      };
      merchant_applications: {
        Row: {
          id: string;
          applicant_id: string;
          business_name: string;
          description: string | null;
          location_label: string | null;
          phone: string | null;
          status: Database["public"]["Enums"]["application_status"];
          admin_note: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          applicant_id: string;
          business_name: string;
          description?: string | null;
          location_label?: string | null;
          phone?: string | null;
          status?: Database["public"]["Enums"]["application_status"];
          admin_note?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["merchant_applications"]["Insert"]>;
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          kind: Database["public"]["Enums"]["category_kind"];
          parent_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          kind?: Database["public"]["Enums"]["category_kind"];
          parent_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          merchant_id: string;
          category_id: string | null;
          title: string;
          description: string | null;
          price: string;
          stock: number;
          status: Database["public"]["Enums"]["product_status"];
          featured_image_path: string | null;
          sold_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          merchant_id: string;
          category_id?: string | null;
          title: string;
          description?: string | null;
          price: string;
          stock?: number;
          status?: Database["public"]["Enums"]["product_status"];
          featured_image_path?: string | null;
          sold_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          storage_path: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          product_id: string;
          storage_path: string;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["product_images"]["Insert"]>;
        Relationships: [];
      };
      service_listings: {
        Row: {
          id: string;
          service_provider_id: string;
          category_id: string | null;
          title: string;
          description: string | null;
          price_min: string | null;
          price_max: string | null;
          prepaid_escrow: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          service_provider_id: string;
          category_id?: string | null;
          title: string;
          description?: string | null;
          price_min?: string | null;
          price_max?: string | null;
          prepaid_escrow?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["service_listings"]["Insert"]>;
        Relationships: [];
      };
      service_areas: {
        Row: {
          id: string;
          service_listing_id: string;
          area_label: string;
        };
        Insert: {
          id?: string;
          service_listing_id: string;
          area_label: string;
        };
        Update: Partial<Database["public"]["Tables"]["service_areas"]["Insert"]>;
        Relationships: [];
      };
      service_portfolio: {
        Row: {
          id: string;
          service_listing_id: string;
          storage_path: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          service_listing_id: string;
          storage_path: string;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["service_portfolio"]["Insert"]>;
        Relationships: [];
      };
      service_requests: {
        Row: {
          id: string;
          service_listing_id: string;
          buyer_id: string;
          message: string | null;
          status: Database["public"]["Enums"]["service_request_status"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          service_listing_id: string;
          buyer_id: string;
          message?: string | null;
          status?: Database["public"]["Enums"]["service_request_status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["service_requests"]["Insert"]>;
        Relationships: [];
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          label: string | null;
          line1: string;
          city: string;
          latitude: number | null;
          longitude: number | null;
          is_default: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          label?: string | null;
          line1: string;
          city: string;
          latitude?: number | null;
          longitude?: number | null;
          is_default?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["addresses"]["Insert"]>;
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          buyer_id: string;
          merchant_id: string | null;
          service_listing_id: string | null;
          order_type: Database["public"]["Enums"]["order_type"];
          status: Database["public"]["Enums"]["order_status"];
          subtotal: string;
          delivery_fee: string;
          platform_fee: string;
          total: string;
          delivery_snapshot: Json | null;
          mpesa_checkout_request_id: string | null;
          escrow_released: boolean;
          buyer_confirmed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          buyer_id: string;
          merchant_id?: string | null;
          service_listing_id?: string | null;
          order_type?: Database["public"]["Enums"]["order_type"];
          status?: Database["public"]["Enums"]["order_status"];
          subtotal?: string;
          delivery_fee?: string;
          platform_fee?: string;
          total?: string;
          delivery_snapshot?: Json | null;
          mpesa_checkout_request_id?: string | null;
          escrow_released?: boolean;
          buyer_confirmed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: string;
        };
        Update: Partial<Database["public"]["Tables"]["order_items"]["Insert"]>;
        Relationships: [];
      };
      order_status_history: {
        Row: {
          id: string;
          order_id: string;
          status: Database["public"]["Enums"]["order_status"];
          note: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          status: Database["public"]["Enums"]["order_status"];
          note?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["order_status_history"]["Insert"]>;
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          order_id: string;
          amount: string;
          provider: string;
          mpesa_checkout_request_id: string | null;
          mpesa_receipt: string | null;
          status: Database["public"]["Enums"]["payment_status"];
          raw_callback: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          amount: string;
          provider?: string;
          mpesa_checkout_request_id?: string | null;
          mpesa_receipt?: string | null;
          status?: Database["public"]["Enums"]["payment_status"];
          raw_callback?: Json | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
        Relationships: [];
      };
      escrow_events: {
        Row: {
          id: string;
          order_id: string;
          event_type: string;
          meta: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          event_type: string;
          meta?: Json | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["escrow_events"]["Insert"]>;
        Relationships: [];
      };
      couriers: {
        Row: {
          id: string;
          user_id: string;
          vehicle_info: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          vehicle_info?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["couriers"]["Insert"]>;
        Relationships: [];
      };
      delivery_assignments: {
        Row: {
          id: string;
          order_id: string;
          courier_id: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          courier_id: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["delivery_assignments"]["Insert"]>;
        Relationships: [];
      };
      delivery_events: {
        Row: {
          id: string;
          assignment_id: string;
          event_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          assignment_id: string;
          event_type: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["delivery_events"]["Insert"]>;
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          order_id: string;
          reviewer_id: string;
          merchant_id: string | null;
          service_provider_id: string | null;
          rating: number;
          body: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          reviewer_id: string;
          merchant_id?: string | null;
          service_provider_id?: string | null;
          rating: number;
          body?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["reviews"]["Insert"]>;
        Relationships: [];
      };
      review_images: {
        Row: {
          id: string;
          review_id: string;
          storage_path: string;
        };
        Insert: {
          id?: string;
          review_id: string;
          storage_path: string;
        };
        Update: Partial<Database["public"]["Tables"]["review_images"]["Insert"]>;
        Relationships: [];
      };
      promotions: {
        Row: {
          id: string;
          merchant_id: string;
          promotion_type: Database["public"]["Enums"]["promotion_type"];
          product_id: string | null;
          amount_paid: string;
          mpesa_checkout_request_id: string | null;
          status: string;
          starts_at: string;
          ends_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          merchant_id: string;
          promotion_type: Database["public"]["Enums"]["promotion_type"];
          product_id?: string | null;
          amount_paid?: string;
          mpesa_checkout_request_id?: string | null;
          status?: string;
          starts_at?: string;
          ends_at: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["promotions"]["Insert"]>;
        Relationships: [];
      };
      disputes: {
        Row: {
          id: string;
          order_id: string;
          opened_by: string;
          status: Database["public"]["Enums"]["dispute_status"];
          evidence_urls: string[] | null;
          resolution_note: string | null;
          resolved_by: string | null;
          outcome: Database["public"]["Enums"]["dispute_outcome"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          opened_by: string;
          status?: Database["public"]["Enums"]["dispute_status"];
          evidence_urls?: string[] | null;
          resolution_note?: string | null;
          resolved_by?: string | null;
          outcome?: Database["public"]["Enums"]["dispute_outcome"];
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["disputes"]["Insert"]>;
        Relationships: [];
      };
      moderation_actions: {
        Row: {
          id: string;
          product_id: string;
          admin_id: string;
          action: string;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          admin_id: string;
          action: string;
          reason?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["moderation_actions"]["Insert"]>;
        Relationships: [];
      };
      wishlist_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["wishlist_items"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      current_merchant_id: { Args: Record<string, never>; Returns: string | null };
      current_service_provider_id: {
        Args: Record<string, never>;
        Returns: string | null;
      };
    };
    Enums: {
      user_role:
        | "buyer"
        | "merchant"
        | "service_provider"
        | "admin"
        | "courier";
      application_status: "pending" | "approved" | "rejected";
      product_status: "draft" | "active" | "suspended";
      order_status:
        | "awaiting_payment"
        | "paid_escrow"
        | "merchant_confirmed"
        | "pickup_scheduled"
        | "collected"
        | "in_transit"
        | "delivered"
        | "completed"
        | "cancelled"
        | "disputed";
      order_type: "product" | "service";
      payment_status: "pending" | "completed" | "failed" | "refunded";
      promotion_type: "store" | "product" | "featured_merchant";
      service_request_status:
        | "pending"
        | "accepted"
        | "declined"
        | "completed"
        | "cancelled";
      dispute_status: "open" | "under_review" | "resolved" | "closed";
      dispute_outcome:
        | "pending"
        | "release_to_merchant"
        | "refund_buyer"
        | "partial_refund";
      category_kind: "product" | "service";
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];
