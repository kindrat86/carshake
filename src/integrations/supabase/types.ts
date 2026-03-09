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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      blog_keywords: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          intent_tier: string | null
          keyword: string
          post_id: string | null
          used: boolean | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          intent_tier?: string | null
          keyword: string
          post_id?: string | null
          used?: boolean | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          intent_tier?: string | null
          keyword?: string
          post_id?: string | null
          used?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_keywords_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          excerpt: string | null
          id: string
          intent_tier: string | null
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          read_time_minutes: number | null
          slug: string
          status: string | null
          tags: string[] | null
          target_keyword: string | null
          title: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          excerpt?: string | null
          id?: string
          intent_tier?: string | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          read_time_minutes?: number | null
          slug: string
          status?: string | null
          tags?: string[] | null
          target_keyword?: string | null
          title: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          excerpt?: string | null
          id?: string
          intent_tier?: string | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          read_time_minutes?: number | null
          slug?: string
          status?: string | null
          tags?: string[] | null
          target_keyword?: string | null
          title?: string
        }
        Relationships: []
      }
      comparison_findings: {
        Row: {
          angle: number | null
          comparison_id: string | null
          description: string
          id: string
          location: string
          severity: string | null
        }
        Insert: {
          angle?: number | null
          comparison_id?: string | null
          description: string
          id?: string
          location: string
          severity?: string | null
        }
        Update: {
          angle?: number | null
          comparison_id?: string | null
          description?: string
          id?: string
          location?: string
          severity?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comparison_findings_comparison_id_fkey"
            columns: ["comparison_id"]
            isOneToOne: false
            referencedRelation: "comparisons"
            referencedColumns: ["id"]
          },
        ]
      }
      comparisons: {
        Row: {
          ai_result_json: Json | null
          created_at: string | null
          dropoff_scan_id: string | null
          id: string
          pickup_scan_id: string | null
          processing_time_ms: number | null
          status: string | null
          total_differences: number | null
        }
        Insert: {
          ai_result_json?: Json | null
          created_at?: string | null
          dropoff_scan_id?: string | null
          id?: string
          pickup_scan_id?: string | null
          processing_time_ms?: number | null
          status?: string | null
          total_differences?: number | null
        }
        Update: {
          ai_result_json?: Json | null
          created_at?: string | null
          dropoff_scan_id?: string | null
          id?: string
          pickup_scan_id?: string | null
          processing_time_ms?: number | null
          status?: string | null
          total_differences?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "comparisons_dropoff_scan_id_fkey"
            columns: ["dropoff_scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comparisons_dropoff_scan_id_fkey"
            columns: ["dropoff_scan_id"]
            isOneToOne: false
            referencedRelation: "scans_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comparisons_pickup_scan_id_fkey"
            columns: ["pickup_scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comparisons_pickup_scan_id_fkey"
            columns: ["pickup_scan_id"]
            isOneToOne: false
            referencedRelation: "scans_public"
            referencedColumns: ["id"]
          },
        ]
      }
      confirmations: {
        Row: {
          confirmed_at: string | null
          device_fingerprint: string | null
          device_info: string | null
          id: string
          ip_address: string | null
          method: string | null
          scan_id: string | null
        }
        Insert: {
          confirmed_at?: string | null
          device_fingerprint?: string | null
          device_info?: string | null
          id?: string
          ip_address?: string | null
          method?: string | null
          scan_id?: string | null
        }
        Update: {
          confirmed_at?: string | null
          device_fingerprint?: string | null
          device_info?: string | null
          id?: string
          ip_address?: string | null
          method?: string | null
          scan_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "confirmations_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "confirmations_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans_public"
            referencedColumns: ["id"]
          },
        ]
      }
      email_sequence_log: {
        Row: {
          clicked_at: string | null
          email_subject: string | null
          id: string
          opened_at: string | null
          resend_id: string | null
          sent_at: string | null
          sequence_name: string
          step_number: number
          user_id: string | null
        }
        Insert: {
          clicked_at?: string | null
          email_subject?: string | null
          id?: string
          opened_at?: string | null
          resend_id?: string | null
          sent_at?: string | null
          sequence_name: string
          step_number: number
          user_id?: string | null
        }
        Update: {
          clicked_at?: string | null
          email_subject?: string | null
          id?: string
          opened_at?: string | null
          resend_id?: string | null
          sent_at?: string | null
          sequence_name?: string
          step_number?: number
          user_id?: string | null
        }
        Relationships: []
      }
      scan_photos: {
        Row: {
          angle: number
          angle_name: string
          client_timestamp: string | null
          id: string
          quality_score: number | null
          scan_id: string | null
          server_timestamp: string | null
          storage_path: string
        }
        Insert: {
          angle: number
          angle_name: string
          client_timestamp?: string | null
          id?: string
          quality_score?: number | null
          scan_id?: string | null
          server_timestamp?: string | null
          storage_path: string
        }
        Update: {
          angle?: number
          angle_name?: string
          client_timestamp?: string | null
          id?: string
          quality_score?: number | null
          scan_id?: string | null
          server_timestamp?: string | null
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "scan_photos_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scan_photos_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans_public"
            referencedColumns: ["id"]
          },
        ]
      }
      scans: {
        Row: {
          address: string | null
          confirmation_method: string | null
          confirmed_at: string | null
          confirmed_by_fingerprint: string | null
          confirmed_device_info: string | null
          created_at: string | null
          device_info: string | null
          gps_lat: number | null
          gps_lon: number | null
          hash_sha256: string | null
          id: string
          paired_scan_id: string | null
          status: string | null
          type: string
          user_id: string | null
          vehicle_color_hex: string | null
          vehicle_color_name: string | null
          vehicle_model: string | null
          vehicle_plate: string | null
        }
        Insert: {
          address?: string | null
          confirmation_method?: string | null
          confirmed_at?: string | null
          confirmed_by_fingerprint?: string | null
          confirmed_device_info?: string | null
          created_at?: string | null
          device_info?: string | null
          gps_lat?: number | null
          gps_lon?: number | null
          hash_sha256?: string | null
          id?: string
          paired_scan_id?: string | null
          status?: string | null
          type: string
          user_id?: string | null
          vehicle_color_hex?: string | null
          vehicle_color_name?: string | null
          vehicle_model?: string | null
          vehicle_plate?: string | null
        }
        Update: {
          address?: string | null
          confirmation_method?: string | null
          confirmed_at?: string | null
          confirmed_by_fingerprint?: string | null
          confirmed_device_info?: string | null
          created_at?: string | null
          device_info?: string | null
          gps_lat?: number | null
          gps_lon?: number | null
          hash_sha256?: string | null
          id?: string
          paired_scan_id?: string | null
          status?: string | null
          type?: string
          user_id?: string | null
          vehicle_color_hex?: string | null
          vehicle_color_name?: string | null
          vehicle_model?: string | null
          vehicle_plate?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scans_paired_scan_id_fkey"
            columns: ["paired_scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scans_paired_scan_id_fkey"
            columns: ["paired_scan_id"]
            isOneToOne: false
            referencedRelation: "scans_public"
            referencedColumns: ["id"]
          },
        ]
      }
      signups_cap: {
        Row: {
          founding_cap: number | null
          founding_price_active: boolean | null
          id: string
          total_signups: number | null
        }
        Insert: {
          founding_cap?: number | null
          founding_price_active?: boolean | null
          id?: string
          total_signups?: number | null
        }
        Update: {
          founding_cap?: number | null
          founding_price_active?: boolean | null
          id?: string
          total_signups?: number | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          billing_cycle_start: string | null
          cancel_at: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          email_preferences: Json | null
          id: string
          payment_failed: boolean | null
          plan: string | null
          referral_code: string | null
          referrals_count: number | null
          referred_by: string | null
          role: string | null
          scans_this_month: number | null
          stripe_customer_id: string | null
        }
        Insert: {
          billing_cycle_start?: string | null
          cancel_at?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          email_preferences?: Json | null
          id: string
          payment_failed?: boolean | null
          plan?: string | null
          referral_code?: string | null
          referrals_count?: number | null
          referred_by?: string | null
          role?: string | null
          scans_this_month?: number | null
          stripe_customer_id?: string | null
        }
        Update: {
          billing_cycle_start?: string | null
          cancel_at?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          email_preferences?: Json | null
          id?: string
          payment_failed?: boolean | null
          plan?: string | null
          referral_code?: string | null
          referrals_count?: number | null
          referred_by?: string | null
          role?: string | null
          scans_this_month?: number | null
          stripe_customer_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      confirmations_public: {
        Row: {
          confirmed_at: string | null
          id: string | null
          method: string | null
          scan_id: string | null
        }
        Insert: {
          confirmed_at?: string | null
          id?: string | null
          method?: string | null
          scan_id?: string | null
        }
        Update: {
          confirmed_at?: string | null
          id?: string | null
          method?: string | null
          scan_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "confirmations_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "confirmations_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans_public"
            referencedColumns: ["id"]
          },
        ]
      }
      scans_public: {
        Row: {
          confirmation_method: string | null
          confirmed_at: string | null
          created_at: string | null
          hash_sha256: string | null
          id: string | null
          paired_scan_id: string | null
          status: string | null
          type: string | null
          vehicle_color_hex: string | null
          vehicle_color_name: string | null
          vehicle_model: string | null
          vehicle_plate: string | null
        }
        Insert: {
          confirmation_method?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          hash_sha256?: string | null
          id?: string | null
          paired_scan_id?: string | null
          status?: string | null
          type?: string | null
          vehicle_color_hex?: string | null
          vehicle_color_name?: string | null
          vehicle_model?: string | null
          vehicle_plate?: string | null
        }
        Update: {
          confirmation_method?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          hash_sha256?: string | null
          id?: string | null
          paired_scan_id?: string | null
          status?: string | null
          type?: string | null
          vehicle_color_hex?: string | null
          vehicle_color_name?: string | null
          vehicle_model?: string | null
          vehicle_plate?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scans_paired_scan_id_fkey"
            columns: ["paired_scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scans_paired_scan_id_fkey"
            columns: ["paired_scan_id"]
            isOneToOne: false
            referencedRelation: "scans_public"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      increment_scan_count: {
        Args: { user_id_param: string }
        Returns: undefined
      }
      reset_billing_cycle: {
        Args: { user_id_param: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
