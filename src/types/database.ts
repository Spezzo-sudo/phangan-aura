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
            availability: {
                Row: {
                    day_of_week: number
                    end_time: string
                    id: string
                    is_active: boolean | null
                    staff_id: string | null
                    start_time: string
                }
                Insert: {
                    day_of_week: number
                    end_time: string
                    id?: string
                    is_active?: boolean | null
                    staff_id?: string | null
                    start_time: string
                }
                Update: {
                    day_of_week?: number
                    end_time?: string
                    id?: string
                    is_active?: boolean | null
                    staff_id?: string | null
                    start_time?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "availability_staff_id_fkey"
                        columns: ["staff_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            blockers: {
                Row: {
                    end_time: string
                    id: string
                    reason: string | null
                    staff_id: string | null
                    start_time: string
                }
                Insert: {
                    end_time: string
                    id?: string
                    reason?: string | null
                    staff_id?: string | null
                    start_time: string
                }
                Update: {
                    end_time?: string
                    id?: string
                    reason?: string | null
                    staff_id?: string | null
                    start_time?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "blockers_staff_id_fkey"
                        columns: ["staff_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            bookings: {
                Row: {
                    created_at: string
                    customer_id: string | null
                    end_time: string
                    id: string
                    location_address: string | null
                    location_lat: number | null
                    location_lng: number | null
                    notes: string | null
                    price_snapshot: number | null
                    service_id: string | null
                    staff_id: string | null
                    start_time: string
                    status: Database["public"]["Enums"]["booking_status"] | null
                    updated_at: string
                    // New fields for accounting & payment
                    total_price: number | null
                    payment_method: string | null
                    addons: Json | null
                    staff_commission: number | null
                    transport_fee: number | null
                    stripe_fee: number | null
                    material_cost: number | null
                    company_share: number | null
                    customer_name: string | null
                    customer_email: string | null
                    customer_phone: string | null
                }
                Insert: {
                    created_at?: string
                    customer_id?: string | null
                    end_time: string
                    id?: string
                    location_address?: string | null
                    location_lat?: number | null
                    location_lng?: number | null
                    notes?: string | null
                    price_snapshot?: number | null
                    service_id?: string | null
                    staff_id?: string | null
                    start_time: string
                    status?: Database["public"]["Enums"]["booking_status"] | null
                    updated_at?: string
                    total_price?: number | null
                    payment_method?: string | null
                    addons?: Json | null
                    staff_commission?: number | null
                    transport_fee?: number | null
                    stripe_fee?: number | null
                    material_cost?: number | null
                    company_share?: number | null
                    customer_name?: string | null
                    customer_email?: string | null
                    customer_phone?: string | null
                }
                Update: {
                    created_at?: string
                    customer_id?: string | null
                    end_time?: string
                    id?: string
                    location_address?: string | null
                    location_lat?: number | null
                    location_lng?: number | null
                    notes?: string | null
                    price_snapshot?: number | null
                    service_id?: string | null
                    staff_id?: string | null
                    start_time?: string
                    status?: Database["public"]["Enums"]["booking_status"] | null
                    updated_at?: string
                    total_price?: number | null
                    payment_method?: string | null
                    addons?: Json | null
                    staff_commission?: number | null
                    transport_fee?: number | null
                    stripe_fee?: number | null
                    material_cost?: number | null
                    company_share?: number | null
                    customer_name?: string | null
                    customer_email?: string | null
                    customer_phone?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "bookings_customer_id_fkey"
                        columns: ["customer_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "bookings_service_id_fkey"
                        columns: ["service_id"]
                        isOneToOne: false
                        referencedRelation: "services"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "bookings_staff_id_fkey"
                        columns: ["staff_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            profiles: {
                Row: {
                    avatar_url: string | null
                    bio: string | null
                    created_at: string
                    email: string
                    full_name: string | null
                    id: string
                    phone: string | null
                    role: Database["public"]["Enums"]["user_role"] | null
                    updated_at: string
                }
                Insert: {
                    avatar_url?: string | null
                    bio?: string | null
                    created_at?: string
                    email: string
                    full_name?: string | null
                    id: string
                    phone?: string | null
                    role?: Database["public"]["Enums"]["user_role"] | null
                    updated_at?: string
                }
                Update: {
                    avatar_url?: string | null
                    bio?: string | null
                    created_at?: string
                    email?: string
                    full_name?: string | null
                    id?: string
                    phone?: string | null
                    role?: Database["public"]["Enums"]["user_role"] | null
                    updated_at?: string
                }
                Relationships: []
            }
            services: {
                Row: {
                    category: Database["public"]["Enums"]["service_category"]
                    created_at: string
                    description: Json | null
                    duration_min: number
                    id: string
                    image_url: string | null
                    is_active: boolean | null
                    price_thb: number
                    title: Json
                    updated_at: string
                }
                Insert: {
                    category: Database["public"]["Enums"]["service_category"]
                    created_at?: string
                    description?: string | null
                    duration_min: number
                    id?: string
                    image_url?: string | null
                    is_active?: boolean | null
                    price_thb: number
                    title: string
                }
                Update: {
                    category?: Database["public"]["Enums"]["service_category"]
                    created_at?: string
                    description?: string | null
                    duration_min?: number
                    id?: string
                    image_url?: string | null
                    is_active?: boolean | null
                    price_thb?: number
                    title?: string
                }
                Relationships: []
            }
            staff_services: {
                Row: {
                    service_id: string
                    staff_id: string
                }
                Insert: {
                    service_id: string
                    staff_id: string
                }
                Update: {
                    service_id?: string
                    staff_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "staff_services_service_id_fkey"
                        columns: ["service_id"]
                        isOneToOne: false
                        referencedRelation: "services"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "staff_services_staff_id_fkey"
                        columns: ["staff_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            company_settings: {
                Row: {
                    id: string
                    created_at: string
                    updated_at: string
                    setting_key: string
                    setting_value: Json
                    description: string | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    setting_key: string
                    setting_value: Json
                    description?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    setting_key?: string
                    setting_value?: Json
                    description?: string | null
                }
                Relationships: []
            }
            orders: {
                Row: {
                    id: string
                    created_at: string
                    updated_at: string
                    order_number: string
                    user_id: string | null
                    status: string | null
                    payment_status: string | null
                    payment_method: string | null
                    subtotal: number
                    total_amount: number
                    currency: string | null
                    customer_name: string
                    customer_email: string
                    customer_phone: string | null
                    shipping_address: string | null
                    items: Json
                    stripe_session_id: string | null
                    stripe_payment_intent_id: string | null
                    notes: string | null
                    delivery_notes: string | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    order_number: string
                    user_id?: string | null
                    status?: string | null
                    payment_status?: string | null
                    payment_method?: string | null
                    subtotal: number
                    total_amount: number
                    currency?: string | null
                    customer_name: string
                    customer_email: string
                    customer_phone?: string | null
                    shipping_address?: string | null
                    items: Json
                    stripe_session_id?: string | null
                    stripe_payment_intent_id?: string | null
                    notes?: string | null
                    delivery_notes?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    order_number?: string
                    user_id?: string | null
                    status?: string | null
                    payment_status?: string | null
                    payment_method?: string | null
                    subtotal?: number
                    total_amount?: number
                    currency?: string | null
                    customer_name?: string
                    customer_email?: string
                    customer_phone?: string | null
                    shipping_address?: string | null
                    items?: Json
                    stripe_session_id?: string | null
                    stripe_payment_intent_id?: string | null
                    notes?: string | null
                    delivery_notes?: string | null
                }
                Relationships: []
            }
            products: {
                Row: {
                    id: string
                    created_at: string
                    updated_at: string
                    name: Json
                    description: Json | null
                    price_thb: number
                    category: string | null
                    image_url: string | null
                    stock_quantity: number | null
                    is_active: boolean | null
                    slug: string | null
                    metadata: Json | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    name: string
                    description?: string | null
                    price_thb: number
                    category?: string | null
                    image_url?: string | null
                    stock_quantity?: number | null
                    is_active?: boolean | null
                    slug?: string | null
                    metadata?: Json | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    name?: string
                    description?: string | null
                    price_thb?: number
                    category?: string | null
                    image_url?: string | null
                    stock_quantity?: number | null
                    is_active?: boolean | null
                    slug?: string | null
                    metadata?: Json | null
                }
                Relationships: []
            }
        }
        Views: {
            public_profiles_view: {
                Row: {
                    id: string
                    full_name: string | null
                    avatar_url: string | null
                    role: Database["public"]["Enums"]["user_role"] | null
                    bio: string | null
                }
            }
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            booking_status: "pending" | "confirmed" | "completed" | "cancelled"
            service_category: "massage" | "nails" | "beauty"
            user_role: "customer" | "staff" | "admin"
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
export type UserRole = Database["public"]["Enums"]["user_role"];
