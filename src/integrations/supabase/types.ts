export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      companies: {
        Row: {
          address: string | null
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          code: string | null
          company_id: string | null
          created_at: string | null
          email: string
          id: string
          mobile_number: string | null
          name: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          address?: string | null
          code?: string | null
          company_id?: string | null
          created_at?: string | null
          email: string
          id: string
          mobile_number?: string | null
          name: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          address?: string | null
          code?: string | null
          company_id?: string | null
          created_at?: string | null
          email?: string
          id?: string
          mobile_number?: string | null
          name?: string
          updated_at?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      transportation_request_items: {
        Row: {
          created_at: string | null
          dimension: string | null
          fragile: boolean | null
          hazardous: boolean | null
          id: string
          item_code: string | null
          item_description: string | null
          item_name: string
          quantity: number
          transportation_request_id: string
          uom: string
          weight: number | null
        }
        Insert: {
          created_at?: string | null
          dimension?: string | null
          fragile?: boolean | null
          hazardous?: boolean | null
          id?: string
          item_code?: string | null
          item_description?: string | null
          item_name: string
          quantity: number
          transportation_request_id: string
          uom: string
          weight?: number | null
        }
        Update: {
          created_at?: string | null
          dimension?: string | null
          fragile?: boolean | null
          hazardous?: boolean | null
          id?: string
          item_code?: string | null
          item_description?: string | null
          item_name?: string
          quantity?: number
          transportation_request_id?: string
          uom?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "transportation_request_items_transportation_request_id_fkey"
            columns: ["transportation_request_id"]
            isOneToOne: false
            referencedRelation: "transportation_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      transportation_requests: {
        Row: {
          created_at: string | null
          customer_id: string
          destination_city: string | null
          destination_country: string | null
          destination_lat: number | null
          destination_lng: number | null
          destination_state: string | null
          destination_street1: string | null
          destination_street2: string | null
          destination_zip: string | null
          driver_mobile: string | null
          driver_name: string | null
          id: string
          insurance_coverage: boolean | null
          loading_proof_url: string | null
          mode: string
          pickup_contact_email: string | null
          pickup_contact_mobile: string | null
          pickup_contact_name: string | null
          pod_proof_url: string | null
          price: number | null
          provider_id: string | null
          receiver_contact_email: string | null
          receiver_contact_mobile: string | null
          receiver_contact_name: string | null
          reference: string
          remarks: string | null
          source_city: string | null
          source_country: string | null
          source_lat: number | null
          source_lng: number | null
          source_state: string | null
          source_street1: string | null
          source_street2: string | null
          source_zip: string | null
          status: string | null
          tracking_link: string | null
          tracking_ref: string | null
          transport_date: string
          updated_at: string | null
          vehicle_mode: string | null
          vehicle_model: string | null
          vehicle_number: string | null
          vehicle_type: string | null
          vendor_name: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          destination_city?: string | null
          destination_country?: string | null
          destination_lat?: number | null
          destination_lng?: number | null
          destination_state?: string | null
          destination_street1?: string | null
          destination_street2?: string | null
          destination_zip?: string | null
          driver_mobile?: string | null
          driver_name?: string | null
          id?: string
          insurance_coverage?: boolean | null
          loading_proof_url?: string | null
          mode: string
          pickup_contact_email?: string | null
          pickup_contact_mobile?: string | null
          pickup_contact_name?: string | null
          pod_proof_url?: string | null
          price?: number | null
          provider_id?: string | null
          receiver_contact_email?: string | null
          receiver_contact_mobile?: string | null
          receiver_contact_name?: string | null
          reference: string
          remarks?: string | null
          source_city?: string | null
          source_country?: string | null
          source_lat?: number | null
          source_lng?: number | null
          source_state?: string | null
          source_street1?: string | null
          source_street2?: string | null
          source_zip?: string | null
          status?: string | null
          tracking_link?: string | null
          tracking_ref?: string | null
          transport_date: string
          updated_at?: string | null
          vehicle_mode?: string | null
          vehicle_model?: string | null
          vehicle_number?: string | null
          vehicle_type?: string | null
          vendor_name?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          destination_city?: string | null
          destination_country?: string | null
          destination_lat?: number | null
          destination_lng?: number | null
          destination_state?: string | null
          destination_street1?: string | null
          destination_street2?: string | null
          destination_zip?: string | null
          driver_mobile?: string | null
          driver_name?: string | null
          id?: string
          insurance_coverage?: boolean | null
          loading_proof_url?: string | null
          mode?: string
          pickup_contact_email?: string | null
          pickup_contact_mobile?: string | null
          pickup_contact_name?: string | null
          pod_proof_url?: string | null
          price?: number | null
          provider_id?: string | null
          receiver_contact_email?: string | null
          receiver_contact_mobile?: string | null
          receiver_contact_name?: string | null
          reference?: string
          remarks?: string | null
          source_city?: string | null
          source_country?: string | null
          source_lat?: number | null
          source_lng?: number | null
          source_state?: string | null
          source_street1?: string | null
          source_street2?: string | null
          source_zip?: string | null
          status?: string | null
          tracking_link?: string | null
          tracking_ref?: string | null
          transport_date?: string
          updated_at?: string | null
          vehicle_mode?: string | null
          vehicle_model?: string | null
          vehicle_number?: string | null
          vehicle_type?: string | null
          vendor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transportation_requests_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      warehouse_request_items: {
        Row: {
          created_at: string | null
          id: string
          item_name: string
          quantity: number
          uom: string
          warehouse_request_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_name: string
          quantity: number
          uom: string
          warehouse_request_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          item_name?: string
          quantity?: number
          uom?: string
          warehouse_request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "warehouse_request_items_warehouse_request_id_fkey"
            columns: ["warehouse_request_id"]
            isOneToOne: false
            referencedRelation: "warehouse_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      warehouse_requests: {
        Row: {
          area_required: number | null
          created_at: string | null
          customer_id: string
          dimensions: string | null
          from_date: string
          id: string
          price: number | null
          provider_id: string | null
          reference: string
          status: string | null
          to_date: string
          updated_at: string | null
        }
        Insert: {
          area_required?: number | null
          created_at?: string | null
          customer_id: string
          dimensions?: string | null
          from_date: string
          id?: string
          price?: number | null
          provider_id?: string | null
          reference: string
          status?: string | null
          to_date: string
          updated_at?: string | null
        }
        Update: {
          area_required?: number | null
          created_at?: string | null
          customer_id?: string
          dimensions?: string | null
          from_date?: string
          id?: string
          price?: number | null
          provider_id?: string | null
          reference?: string
          status?: string | null
          to_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "warehouse_requests_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "customer" | "ops"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["customer", "ops"],
    },
  },
} as const
