export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      addresses: {
        Row: {
          address_line_2: string | null
          category: Database["public"]["Enums"]["address_category"]
          city: string
          country: string
          created_at: string
          email: string | null
          first_name: string | null
          full_name: string | null
          id: string
          identification: string | null
          is_default: boolean | null
          label: string
          last_name: string | null
          phone: string | null
          state: string
          street: string
          updated_at: string
          user_id: string
          zip_code: string | null
        }
        Insert: {
          address_line_2?: string | null
          category?: Database["public"]["Enums"]["address_category"]
          city: string
          country: string
          created_at?: string
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          identification?: string | null
          is_default?: boolean | null
          label: string
          last_name?: string | null
          phone?: string | null
          state: string
          street: string
          updated_at?: string
          user_id: string
          zip_code?: string | null
        }
        Update: {
          address_line_2?: string | null
          category?: Database["public"]["Enums"]["address_category"]
          city?: string
          country?: string
          created_at?: string
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          identification?: string | null
          is_default?: boolean | null
          label?: string
          last_name?: string | null
          phone?: string | null
          state?: string
          street?: string
          updated_at?: string
          user_id?: string
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      field_mappings: {
        Row: {
          created_at: string
          id: string
          platform: Database["public"]["Enums"]["ecommerce_platform"]
          platform_field_id: string
          replace_field: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          platform: Database["public"]["Enums"]["ecommerce_platform"]
          platform_field_id: string
          replace_field: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          platform?: Database["public"]["Enums"]["ecommerce_platform"]
          platform_field_id?: string
          replace_field?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      store_discounts: {
        Row: {
          code: string
          created_at: string
          discount_type: string
          id: string
          status: string
          store_id: string
          type: string
          updated_at: string
          valid_from: string
          valid_until: string
          value: number
        }
        Insert: {
          code: string
          created_at?: string
          discount_type: string
          id?: string
          status?: string
          store_id: string
          type: string
          updated_at?: string
          valid_from: string
          valid_until: string
          value: number
        }
        Update: {
          code?: string
          created_at?: string
          discount_type?: string
          id?: string
          status?: string
          store_id?: string
          type?: string
          updated_at?: string
          valid_from?: string
          valid_until?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "store_discounts_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          category: string | null
          created_at: string
          email: string | null
          id: string
          keywords: string[] | null
          logo_url: string | null
          name: string
          platform: Database["public"]["Enums"]["ecommerce_platform"] | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          email?: string | null
          id?: string
          keywords?: string[] | null
          logo_url?: string | null
          name: string
          platform?: Database["public"]["Enums"]["ecommerce_platform"] | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          email?: string | null
          id?: string
          keywords?: string[] | null
          logo_url?: string | null
          name?: string
          platform?: Database["public"]["Enums"]["ecommerce_platform"] | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      address_category:
        | "casa"
        | "trabajo"
        | "vecino"
        | "amigo"
        | "familiares"
        | "conserje"
        | "otro"
      ecommerce_platform:
        | "shopify"
        | "woocommerce"
        | "wix"
        | "tiendanube"
        | "jumpseller"
        | "vtex"
        | "magento"
        | "otro"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
