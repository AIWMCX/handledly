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
      chat_conversations: {
        Row: {
          created_at: string
          ended_at: string | null
          id: string
          lead_id: string | null
          metadata: Json | null
          session_id: string
          source_page: string | null
          started_at: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          session_id: string
          source_page?: string | null
          started_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: string
          lead_id?: string | null
          metadata?: Json | null
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
      leads: {
        Row: {
          bedrooms: number | null
          call_duration_seconds: number | null
          call_ended_at: string | null
          call_notes: string | null
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
          move_date: string | null
          move_from_address: string | null
          move_to_address: string | null
          notes: string | null
          phone: string
          prefer_email_only: boolean | null
          property_type: string | null
          specialty_items: string[] | null
          status: string
          updated_at: string
        }
        Insert: {
          bedrooms?: number | null
          call_duration_seconds?: number | null
          call_ended_at?: string | null
          call_notes?: string | null
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
          move_date?: string | null
          move_from_address?: string | null
          move_to_address?: string | null
          notes?: string | null
          phone: string
          prefer_email_only?: boolean | null
          property_type?: string | null
          specialty_items?: string[] | null
          status?: string
          updated_at?: string
        }
        Update: {
          bedrooms?: number | null
          call_duration_seconds?: number | null
          call_ended_at?: string | null
          call_notes?: string | null
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
          move_date?: string | null
          move_from_address?: string | null
          move_to_address?: string | null
          notes?: string | null
          phone?: string
          prefer_email_only?: boolean | null
          property_type?: string | null
          specialty_items?: string[] | null
          status?: string
          updated_at?: string
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
      business_info_public: {
        Row: {
          address: string | null
          company_name: string | null
          phone_number: string | null
          service_areas: string[] | null
        }
        Relationships: []
      }
    }
    Functions: {
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
      get_client_identifier: { Args: never; Returns: string }
      get_user_id_by_email: { Args: { email_input: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
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
