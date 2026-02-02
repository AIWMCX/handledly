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
      ai_quality_reviews: {
        Row: {
          accuracy_score: number | null
          conversation_id: string
          created_at: string
          customer_rating: number | null
          flagged_for_improvement: boolean | null
          id: string
          improvement_category: string | null
          quality_score: number | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string
        }
        Insert: {
          accuracy_score?: number | null
          conversation_id: string
          created_at?: string
          customer_rating?: number | null
          flagged_for_improvement?: boolean | null
          id?: string
          improvement_category?: string | null
          quality_score?: number | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by: string
        }
        Update: {
          accuracy_score?: number | null
          conversation_id?: string
          created_at?: string
          customer_rating?: number | null
          flagged_for_improvement?: boolean | null
          id?: string
          improvement_category?: string | null
          quality_score?: number | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_quality_reviews_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          created_at: string
          crew_size: number | null
          estimated_duration: number | null
          id: string
          lead_id: string | null
          move_type: string
          notes: string | null
          scheduled_date: string
          scheduled_time: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          crew_size?: number | null
          estimated_duration?: number | null
          id?: string
          lead_id?: string | null
          move_type: string
          notes?: string | null
          scheduled_date: string
          scheduled_time: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          crew_size?: number | null
          estimated_duration?: number | null
          id?: string
          lead_id?: string | null
          move_type?: string
          notes?: string | null
          scheduled_date?: string
          scheduled_time?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      business_settings: {
        Row: {
          address: string | null
          base_rate_per_hour: number | null
          company_name: string
          created_at: string
          email: string | null
          id: string
          minimum_hours: number | null
          phone_number: string
          service_areas: string[] | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          base_rate_per_hour?: number | null
          company_name?: string
          created_at?: string
          email?: string | null
          id?: string
          minimum_hours?: number | null
          phone_number?: string
          service_areas?: string[] | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          base_rate_per_hour?: number | null
          company_name?: string
          created_at?: string
          email?: string | null
          id?: string
          minimum_hours?: number | null
          phone_number?: string
          service_areas?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      call_retry_queue: {
        Row: {
          created_at: string
          id: string
          last_error: string | null
          lead_id: string
          max_attempts: number
          processed_at: string | null
          retry_attempt: number
          scheduled_for: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_error?: string | null
          lead_id: string
          max_attempts?: number
          processed_at?: string | null
          retry_attempt?: number
          scheduled_for: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_error?: string | null
          lead_id?: string
          max_attempts?: number
          processed_at?: string | null
          retry_attempt?: number
          scheduled_for?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_retry_queue_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_conversations: {
        Row: {
          created_at: string
          customer_satisfaction: number | null
          ended_at: string | null
          id: string
          lead_id: string | null
          metadata: Json | null
          quality_reviewed: boolean | null
          session_id: string
          source_page: string | null
          started_at: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_satisfaction?: number | null
          ended_at?: string | null
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          quality_reviewed?: boolean | null
          session_id: string
          source_page?: string | null
          started_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_satisfaction?: number | null
          ended_at?: string | null
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          quality_reviewed?: boolean | null
          session_id?: string
          source_page?: string | null
          started_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_conversations_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          message_type: string
          role: string
          tool_data: Json | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          message_type?: string
          role: string
          tool_data?: Json | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          message_type?: string
          role?: string
          tool_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      circuit_breaker_config: {
        Row: {
          created_at: string
          current_daily_spend: number | null
          current_hourly_spend: number | null
          daily_limit: number
          enabled: boolean | null
          hourly_limit: number
          id: string
          last_reset_daily: string | null
          last_reset_hourly: string | null
          service_name: string
          trip_reason: string | null
          tripped: boolean | null
          tripped_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_daily_spend?: number | null
          current_hourly_spend?: number | null
          daily_limit?: number
          enabled?: boolean | null
          hourly_limit?: number
          id?: string
          last_reset_daily?: string | null
          last_reset_hourly?: string | null
          service_name: string
          trip_reason?: string | null
          tripped?: boolean | null
          tripped_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_daily_spend?: number | null
          current_hourly_spend?: number | null
          daily_limit?: number
          enabled?: boolean | null
          hourly_limit?: number
          id?: string
          last_reset_daily?: string | null
          last_reset_hourly?: string | null
          service_name?: string
          trip_reason?: string | null
          tripped?: boolean | null
          tripped_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      client_trust_scores: {
        Row: {
          blocked_requests: number | null
          client_identifier: string
          created_at: string
          flags: Json | null
          id: string
          last_request_at: string | null
          total_requests: number | null
          trust_score: number | null
          updated_at: string
        }
        Insert: {
          blocked_requests?: number | null
          client_identifier: string
          created_at?: string
          flags?: Json | null
          id?: string
          last_request_at?: string | null
          total_requests?: number | null
          trust_score?: number | null
          updated_at?: string
        }
        Update: {
          blocked_requests?: number | null
          client_identifier?: string
          created_at?: string
          flags?: Json | null
          id?: string
          last_request_at?: string | null
          total_requests?: number | null
          trust_score?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      cost_tracker: {
        Row: {
          created_at: string
          estimated_cost: number
          id: string
          ip_hash: string | null
          lead_id: string | null
          metadata: Json | null
          service_type: string
          session_id: string | null
          success: boolean | null
        }
        Insert: {
          created_at?: string
          estimated_cost?: number
          id?: string
          ip_hash?: string | null
          lead_id?: string | null
          metadata?: Json | null
          service_type: string
          session_id?: string | null
          success?: boolean | null
        }
        Update: {
          created_at?: string
          estimated_cost?: number
          id?: string
          ip_hash?: string | null
          lead_id?: string | null
          metadata?: Json | null
          service_type?: string
          session_id?: string | null
          success?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "cost_tracker_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      honeypot_detections: {
        Row: {
          blocked: boolean | null
          created_at: string
          detection_data: Json | null
          detection_type: string
          id: string
          ip_hash: string
          page: string | null
        }
        Insert: {
          blocked?: boolean | null
          created_at?: string
          detection_data?: Json | null
          detection_type: string
          id?: string
          ip_hash: string
          page?: string | null
        }
        Update: {
          blocked?: boolean | null
          created_at?: string
          detection_data?: Json | null
          detection_type?: string
          id?: string
          ip_hash?: string
          page?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          bedrooms: number | null
          call_duration_seconds: number | null
          call_ended_at: string | null
          call_notes: string | null
          call_retry_count: number | null
          call_sid: string | null
          call_summary: string | null
          call_transcript: string | null
          confirmation_call_status: string | null
          confirmation_call_time: string | null
          conversation_id: string | null
          created_at: string
          email: string
          email_sent: boolean | null
          email_sent_at: string | null
          estimated_quote: number | null
          full_name: string
          has_specialty_items: boolean | null
          id: string
          lead_source: string | null
          move_date: string | null
          move_from_address: string | null
          move_to_address: string | null
          next_retry_at: string | null
          notes: string | null
          phone: string
          prefer_email_only: boolean | null
          property_type: string | null
          specialty_items: string[] | null
          status: string
          updated_at: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          verification_token: string | null
        }
        Insert: {
          bedrooms?: number | null
          call_duration_seconds?: number | null
          call_ended_at?: string | null
          call_notes?: string | null
          call_retry_count?: number | null
          call_sid?: string | null
          call_summary?: string | null
          call_transcript?: string | null
          confirmation_call_status?: string | null
          confirmation_call_time?: string | null
          conversation_id?: string | null
          created_at?: string
          email: string
          email_sent?: boolean | null
          email_sent_at?: string | null
          estimated_quote?: number | null
          full_name: string
          has_specialty_items?: boolean | null
          id?: string
          lead_source?: string | null
          move_date?: string | null
          move_from_address?: string | null
          move_to_address?: string | null
          next_retry_at?: string | null
          notes?: string | null
          phone: string
          prefer_email_only?: boolean | null
          property_type?: string | null
          specialty_items?: string[] | null
          status?: string
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          verification_token?: string | null
        }
        Update: {
          bedrooms?: number | null
          call_duration_seconds?: number | null
          call_ended_at?: string | null
          call_notes?: string | null
          call_retry_count?: number | null
          call_sid?: string | null
          call_summary?: string | null
          call_transcript?: string | null
          confirmation_call_status?: string | null
          confirmation_call_time?: string | null
          conversation_id?: string | null
          created_at?: string
          email?: string
          email_sent?: boolean | null
          email_sent_at?: string | null
          estimated_quote?: number | null
          full_name?: string
          has_specialty_items?: boolean | null
          id?: string
          lead_source?: string | null
          move_date?: string | null
          move_from_address?: string | null
          move_to_address?: string | null
          next_retry_at?: string | null
          notes?: string | null
          phone?: string
          prefer_email_only?: boolean | null
          property_type?: string | null
          specialty_items?: string[] | null
          status?: string
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          verification_token?: string | null
        }
        Relationships: []
      }
      leads_archive: {
        Row: {
          archived_at: string | null
          bedrooms: number | null
          call_duration_seconds: number | null
          call_ended_at: string | null
          call_notes: string | null
          call_retry_count: number | null
          call_sid: string | null
          call_summary: string | null
          call_transcript: string | null
          confirmation_call_status: string | null
          confirmation_call_time: string | null
          conversation_id: string | null
          created_at: string
          email: string
          email_sent: boolean | null
          email_sent_at: string | null
          estimated_quote: number | null
          full_name: string
          has_specialty_items: boolean | null
          id: string
          lead_source: string | null
          move_date: string | null
          move_from_address: string | null
          move_to_address: string | null
          next_retry_at: string | null
          notes: string | null
          phone: string
          prefer_email_only: boolean | null
          property_type: string | null
          specialty_items: string[] | null
          status: string
          updated_at: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          verification_token: string | null
        }
        Insert: {
          archived_at?: string | null
          bedrooms?: number | null
          call_duration_seconds?: number | null
          call_ended_at?: string | null
          call_notes?: string | null
          call_retry_count?: number | null
          call_sid?: string | null
          call_summary?: string | null
          call_transcript?: string | null
          confirmation_call_status?: string | null
          confirmation_call_time?: string | null
          conversation_id?: string | null
          created_at?: string
          email: string
          email_sent?: boolean | null
          email_sent_at?: string | null
          estimated_quote?: number | null
          full_name: string
          has_specialty_items?: boolean | null
          id?: string
          lead_source?: string | null
          move_date?: string | null
          move_from_address?: string | null
          move_to_address?: string | null
          next_retry_at?: string | null
          notes?: string | null
          phone: string
          prefer_email_only?: boolean | null
          property_type?: string | null
          specialty_items?: string[] | null
          status?: string
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          verification_token?: string | null
        }
        Update: {
          archived_at?: string | null
          bedrooms?: number | null
          call_duration_seconds?: number | null
          call_ended_at?: string | null
          call_notes?: string | null
          call_retry_count?: number | null
          call_sid?: string | null
          call_summary?: string | null
          call_transcript?: string | null
          confirmation_call_status?: string | null
          confirmation_call_time?: string | null
          conversation_id?: string | null
          created_at?: string
          email?: string
          email_sent?: boolean | null
          email_sent_at?: string | null
          estimated_quote?: number | null
          full_name?: string
          has_specialty_items?: boolean | null
          id?: string
          lead_source?: string | null
          move_date?: string | null
          move_from_address?: string | null
          move_to_address?: string | null
          next_retry_at?: string | null
          notes?: string | null
          phone?: string
          prefer_email_only?: boolean | null
          property_type?: string | null
          specialty_items?: string[] | null
          status?: string
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          verification_token?: string | null
        }
        Relationships: []
      }
      quote_requests: {
        Row: {
          base_price: number | null
          bedrooms: number | null
          created_at: string
          distance_fee: number | null
          distance_zone: string | null
          floor_number: number | null
          has_stairs: boolean | null
          id: string
          lead_id: string | null
          property_type: string
          quote_number: string | null
          specialty_fee: number | null
          specialty_items: string[] | null
          square_footage: number | null
          stairs_fee: number | null
          total_quote: number | null
        }
        Insert: {
          base_price?: number | null
          bedrooms?: number | null
          created_at?: string
          distance_fee?: number | null
          distance_zone?: string | null
          floor_number?: number | null
          has_stairs?: boolean | null
          id?: string
          lead_id?: string | null
          property_type: string
          quote_number?: string | null
          specialty_fee?: number | null
          specialty_items?: string[] | null
          square_footage?: number | null
          stairs_fee?: number | null
          total_quote?: number | null
        }
        Update: {
          base_price?: number | null
          bedrooms?: number | null
          created_at?: string
          distance_fee?: number | null
          distance_zone?: string | null
          floor_number?: number | null
          has_stairs?: boolean | null
          id?: string
          lead_id?: string | null
          property_type?: string
          quote_number?: string | null
          specialty_fee?: number | null
          specialty_items?: string[] | null
          square_footage?: number | null
          stairs_fee?: number | null
          total_quote?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_requests_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limit_tracker: {
        Row: {
          created_at: string
          id: string
          identifier: string
          table_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          identifier: string
          table_name: string
        }
        Update: {
          created_at?: string
          id?: string
          identifier?: string
          table_name?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      archive_old_leads: { Args: never; Returns: number }
      check_circuit_breaker: {
        Args: { p_service_name: string }
        Returns: boolean
      }
      check_rate_limit: {
        Args: {
          ip_identifier: string
          max_requests?: number
          table_name: string
          time_window_minutes?: number
        }
        Returns: boolean
      }
      check_rate_limit_readonly: {
        Args: {
          p_identifier: string
          p_max_requests?: number
          p_table_name: string
          p_time_window_minutes?: number
        }
        Returns: boolean
      }
      cleanup_old_rate_limits: { Args: never; Returns: undefined }
      get_admin_users_with_email: {
        Args: never
        Returns: {
          email: string
          role: string
          role_created_at: string
          role_id: string
          user_id: string
        }[]
      }
      get_client_identifier: { Args: never; Returns: string }
      get_cost_summary: {
        Args: { p_days?: number }
        Returns: {
          avg_cost: number
          date: string
          request_count: number
          service_type: string
          total_cost: number
        }[]
      }
      get_public_business_info: {
        Args: never
        Returns: {
          address: string
          company_name: string
          phone_number: string
          service_areas: string[]
        }[]
      }
      get_tiered_rate_limit: {
        Args: { p_base_limit?: number; p_identifier: string }
        Returns: number
      }
      get_user_id_by_email: { Args: { email_input: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_valid_phone: { Args: { phone_input: string }; Returns: boolean }
      record_service_cost: {
        Args: {
          p_cost: number
          p_ip_hash?: string
          p_lead_id?: string
          p_metadata?: Json
          p_service_type: string
          p_session_id?: string
        }
        Returns: boolean
      }
      record_trust_violation: {
        Args: {
          p_identifier: string
          p_penalty?: number
          p_violation_type: string
        }
        Returns: number
      }
      timeout_stale_calls: { Args: never; Returns: number }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
