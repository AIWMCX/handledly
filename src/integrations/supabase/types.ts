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
      activity_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
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
      bookings: {
        Row: {
          actual_duration_minutes: number | null
          balance_due: number | null
          booking_number: string
          check_in_time: string | null
          check_out_time: string | null
          completion_confirmed_at: string | null
          created_at: string
          crew_size: number | null
          customer_id: string
          deposit_amount: number | null
          estimated_duration_hours: number | null
          id: string
          move_date: string
          move_request_id: string
          move_time: string | null
          moving_company_id: string
          payment_method: string | null
          payment_status: string | null
          payout_completed_at: string | null
          platform_commission_amount: number | null
          platform_commission_rate: number | null
          quote_id: string
          status: string
          total_price: number
          updated_at: string
        }
        Insert: {
          actual_duration_minutes?: number | null
          balance_due?: number | null
          booking_number: string
          check_in_time?: string | null
          check_out_time?: string | null
          completion_confirmed_at?: string | null
          created_at?: string
          crew_size?: number | null
          customer_id: string
          deposit_amount?: number | null
          estimated_duration_hours?: number | null
          id?: string
          move_date: string
          move_request_id: string
          move_time?: string | null
          moving_company_id: string
          payment_method?: string | null
          payment_status?: string | null
          payout_completed_at?: string | null
          platform_commission_amount?: number | null
          platform_commission_rate?: number | null
          quote_id: string
          status?: string
          total_price: number
          updated_at?: string
        }
        Update: {
          actual_duration_minutes?: number | null
          balance_due?: number | null
          booking_number?: string
          check_in_time?: string | null
          check_out_time?: string | null
          completion_confirmed_at?: string | null
          created_at?: string
          crew_size?: number | null
          customer_id?: string
          deposit_amount?: number | null
          estimated_duration_hours?: number | null
          id?: string
          move_date?: string
          move_request_id?: string
          move_time?: string | null
          moving_company_id?: string
          payment_method?: string | null
          payment_status?: string | null
          payout_completed_at?: string | null
          platform_commission_amount?: number | null
          platform_commission_rate?: number | null
          quote_id?: string
          status?: string
          total_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_move_request_id_fkey"
            columns: ["move_request_id"]
            isOneToOne: false
            referencedRelation: "move_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_moving_company_id_fkey"
            columns: ["moving_company_id"]
            isOneToOne: false
            referencedRelation: "moving_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
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
      crew_members: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          hourly_rate: number | null
          id: string
          phone: string | null
          role: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name: string
          hourly_rate?: number | null
          id?: string
          phone?: string | null
          role?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          hourly_rate?: number | null
          id?: string
          phone?: string | null
          role?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      crm_communications: {
        Row: {
          body: string | null
          booking_id: string | null
          contact_id: string | null
          created_at: string
          delivered_at: string | null
          direction: string
          id: string
          moving_company_id: string
          opened_at: string | null
          sent_at: string | null
          subject: string | null
          type: string
        }
        Insert: {
          body?: string | null
          booking_id?: string | null
          contact_id?: string | null
          created_at?: string
          delivered_at?: string | null
          direction: string
          id?: string
          moving_company_id: string
          opened_at?: string | null
          sent_at?: string | null
          subject?: string | null
          type: string
        }
        Update: {
          body?: string | null
          booking_id?: string | null
          contact_id?: string | null
          created_at?: string
          delivered_at?: string | null
          direction?: string
          id?: string
          moving_company_id?: string
          opened_at?: string | null
          sent_at?: string | null
          subject?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_communications_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_communications_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_communications_moving_company_id_fkey"
            columns: ["moving_company_id"]
            isOneToOne: false
            referencedRelation: "moving_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_contacts: {
        Row: {
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          moving_company_id: string
          notes: string | null
          phone: string | null
          source: string | null
          stage: string | null
          tags: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          moving_company_id: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          stage?: string | null
          tags?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          moving_company_id?: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          stage?: string | null
          tags?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_contacts_moving_company_id_fkey"
            columns: ["moving_company_id"]
            isOneToOne: false
            referencedRelation: "moving_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_tasks: {
        Row: {
          assigned_to: string | null
          booking_id: string | null
          completed_at: string | null
          contact_id: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          moving_company_id: string
          priority: string | null
          status: string | null
          task_type: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          booking_id?: string | null
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          moving_company_id: string
          priority?: string | null
          status?: string | null
          task_type?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          booking_id?: string | null
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          moving_company_id?: string
          priority?: string | null
          status?: string | null
          task_type?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_tasks_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_tasks_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_tasks_moving_company_id_fkey"
            columns: ["moving_company_id"]
            isOneToOne: false
            referencedRelation: "moving_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          referral_code: string | null
          updated_at: string
          user_id: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          referral_code?: string | null
          updated_at?: string
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          referral_code?: string | null
          updated_at?: string
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      digital_agreements: {
        Row: {
          agreement_type: string
          created_at: string
          customer_email: string
          customer_name: string
          id: string
          ip_address: string | null
          job_id: string | null
          lead_id: string | null
          signature_url: string | null
          signed_at: string | null
        }
        Insert: {
          agreement_type: string
          created_at?: string
          customer_email: string
          customer_name: string
          id?: string
          ip_address?: string | null
          job_id?: string | null
          lead_id?: string | null
          signature_url?: string | null
          signed_at?: string | null
        }
        Update: {
          agreement_type?: string
          created_at?: string
          customer_email?: string
          customer_name?: string
          id?: string
          ip_address?: string | null
          job_id?: string | null
          lead_id?: string | null
          signature_url?: string | null
          signed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "digital_agreements_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "digital_agreements_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          against_id: string
          against_type: string
          amount_disputed: number | null
          booking_id: string
          category: string
          created_at: string
          description: string
          evidence: Json | null
          filed_by_id: string
          filed_by_type: string
          id: string
          resolution_amount: number | null
          resolution_notes: string | null
          resolution_type: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          against_id: string
          against_type: string
          amount_disputed?: number | null
          booking_id: string
          category: string
          created_at?: string
          description: string
          evidence?: Json | null
          filed_by_id: string
          filed_by_type: string
          id?: string
          resolution_amount?: number | null
          resolution_notes?: string | null
          resolution_type?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          against_id?: string
          against_type?: string
          amount_disputed?: number | null
          booking_id?: string
          category?: string
          created_at?: string
          description?: string
          evidence?: Json | null
          filed_by_id?: string
          filed_by_type?: string
          id?: string
          resolution_amount?: number | null
          resolution_notes?: string | null
          resolution_type?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "disputes_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment: {
        Row: {
          assigned_job_id: string | null
          created_at: string
          id: string
          name: string
          notes: string | null
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          assigned_job_id?: string | null
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Update: {
          assigned_job_id?: string | null
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_assigned_job_id_fkey"
            columns: ["assigned_job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
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
      job_checklists: {
        Row: {
          category: string
          completed: boolean
          completed_at: string | null
          completed_by: string | null
          created_at: string
          id: string
          item_text: string
          job_id: string
          sort_order: number | null
        }
        Insert: {
          category?: string
          completed?: boolean
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          id?: string
          item_text: string
          job_id: string
          sort_order?: number | null
        }
        Update: {
          category?: string
          completed?: boolean
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          id?: string
          item_text?: string
          job_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "job_checklists_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "crew_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_checklists_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_crew_assignments: {
        Row: {
          check_in_time: string | null
          check_out_time: string | null
          created_at: string
          crew_member_id: string
          hours_worked: number | null
          id: string
          job_id: string
          role: string | null
        }
        Insert: {
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string
          crew_member_id: string
          hours_worked?: number | null
          id?: string
          job_id: string
          role?: string | null
        }
        Update: {
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string
          crew_member_id?: string
          hours_worked?: number | null
          id?: string
          job_id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_crew_assignments_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: false
            referencedRelation: "crew_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_crew_assignments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_financials: {
        Row: {
          created_at: string
          equipment_cost: number
          fuel_cost: number
          id: string
          insurance_allocation: number
          job_id: string
          labor_cost: number
          margin_percentage: number | null
          net_profit: number | null
          revenue: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          equipment_cost?: number
          fuel_cost?: number
          id?: string
          insurance_allocation?: number
          job_id: string
          labor_cost?: number
          margin_percentage?: number | null
          net_profit?: number | null
          revenue?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          equipment_cost?: number
          fuel_cost?: number
          id?: string
          insurance_allocation?: number
          job_id?: string
          labor_cost?: number
          margin_percentage?: number | null
          net_profit?: number | null
          revenue?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_financials_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: true
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_photos: {
        Row: {
          created_at: string
          crew_member_id: string | null
          id: string
          job_id: string
          notes: string | null
          photo_type: string
          photo_url: string
        }
        Insert: {
          created_at?: string
          crew_member_id?: string | null
          id?: string
          job_id: string
          notes?: string | null
          photo_type?: string
          photo_url: string
        }
        Update: {
          created_at?: string
          crew_member_id?: string | null
          id?: string
          job_id?: string
          notes?: string | null
          photo_type?: string
          photo_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_photos_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: false
            referencedRelation: "crew_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_photos_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          actual_duration: number | null
          bedrooms: number | null
          created_at: string
          deposit_amount: number | null
          distance_miles: number | null
          estimated_duration: number | null
          id: string
          lead_id: string | null
          move_from_address: string | null
          move_to_address: string | null
          property_type: string | null
          scheduled_date: string | null
          scheduled_time: string | null
          special_instructions: string | null
          status: string
          total_price: number | null
          updated_at: string
        }
        Insert: {
          actual_duration?: number | null
          bedrooms?: number | null
          created_at?: string
          deposit_amount?: number | null
          distance_miles?: number | null
          estimated_duration?: number | null
          id?: string
          lead_id?: string | null
          move_from_address?: string | null
          move_to_address?: string | null
          property_type?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          special_instructions?: string | null
          status?: string
          total_price?: number | null
          updated_at?: string
        }
        Update: {
          actual_duration?: number | null
          bedrooms?: number | null
          created_at?: string
          deposit_amount?: number | null
          distance_miles?: number | null
          estimated_duration?: number | null
          id?: string
          lead_id?: string | null
          move_from_address?: string | null
          move_to_address?: string | null
          property_type?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          special_instructions?: string | null
          status?: string
          total_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_follow_ups: {
        Row: {
          created_at: string
          email_status: string
          error_message: string | null
          id: string
          lead_id: string
          scheduled_for: string
          sent_at: string | null
          touch_number: number
        }
        Insert: {
          created_at?: string
          email_status?: string
          error_message?: string | null
          id?: string
          lead_id: string
          scheduled_for: string
          sent_at?: string | null
          touch_number: number
        }
        Update: {
          created_at?: string
          email_status?: string
          error_message?: string | null
          id?: string
          lead_id?: string
          scheduled_for?: string
          sent_at?: string | null
          touch_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "lead_follow_ups_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
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
      move_requests: {
        Row: {
          created_at: string
          customer_id: string
          date_range_end: string | null
          date_range_start: string | null
          dest_city: string | null
          dest_elevator: boolean | null
          dest_floor: number | null
          dest_lat: number | null
          dest_lng: number | null
          dest_state: string | null
          dest_street: string | null
          dest_zip: string | null
          distance_miles: number | null
          estimated_drive_minutes: number | null
          estimated_volume_cuft: number | null
          estimated_weight_lbs: number | null
          expires_at: string | null
          flexible_dates: boolean | null
          id: string
          inventory_items: Json | null
          move_size: string
          move_type: string
          notes: string | null
          origin_city: string | null
          origin_elevator: boolean | null
          origin_floor: number | null
          origin_lat: number | null
          origin_lng: number | null
          origin_state: string | null
          origin_street: string | null
          origin_zip: string | null
          packing_required: boolean | null
          preferred_move_date: string | null
          specialty_items: Json | null
          status: string
          storage_duration_days: number | null
          storage_required: boolean | null
          unpacking_required: boolean | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          date_range_end?: string | null
          date_range_start?: string | null
          dest_city?: string | null
          dest_elevator?: boolean | null
          dest_floor?: number | null
          dest_lat?: number | null
          dest_lng?: number | null
          dest_state?: string | null
          dest_street?: string | null
          dest_zip?: string | null
          distance_miles?: number | null
          estimated_drive_minutes?: number | null
          estimated_volume_cuft?: number | null
          estimated_weight_lbs?: number | null
          expires_at?: string | null
          flexible_dates?: boolean | null
          id?: string
          inventory_items?: Json | null
          move_size: string
          move_type: string
          notes?: string | null
          origin_city?: string | null
          origin_elevator?: boolean | null
          origin_floor?: number | null
          origin_lat?: number | null
          origin_lng?: number | null
          origin_state?: string | null
          origin_street?: string | null
          origin_zip?: string | null
          packing_required?: boolean | null
          preferred_move_date?: string | null
          specialty_items?: Json | null
          status?: string
          storage_duration_days?: number | null
          storage_required?: boolean | null
          unpacking_required?: boolean | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          date_range_end?: string | null
          date_range_start?: string | null
          dest_city?: string | null
          dest_elevator?: boolean | null
          dest_floor?: number | null
          dest_lat?: number | null
          dest_lng?: number | null
          dest_state?: string | null
          dest_street?: string | null
          dest_zip?: string | null
          distance_miles?: number | null
          estimated_drive_minutes?: number | null
          estimated_volume_cuft?: number | null
          estimated_weight_lbs?: number | null
          expires_at?: string | null
          flexible_dates?: boolean | null
          id?: string
          inventory_items?: Json | null
          move_size?: string
          move_type?: string
          notes?: string | null
          origin_city?: string | null
          origin_elevator?: boolean | null
          origin_floor?: number | null
          origin_lat?: number | null
          origin_lng?: number | null
          origin_state?: string | null
          origin_street?: string | null
          origin_zip?: string | null
          packing_required?: boolean | null
          preferred_move_date?: string | null
          specialty_items?: Json | null
          status?: string
          storage_duration_days?: number | null
          storage_required?: boolean | null
          unpacking_required?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "move_requests_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      moving_companies: {
        Row: {
          acceptance_rate: number | null
          address_city: string | null
          address_lat: number | null
          address_lng: number | null
          address_state: string | null
          address_street: string | null
          address_zip: string | null
          average_rating: number | null
          base_rate_local: number | null
          base_rate_long_distance: number | null
          bbb_rating: string | null
          cancellation_rate: number | null
          company_name: string
          created_at: string
          description: string | null
          dot_number: string | null
          id: string
          insurance_expires_at: string | null
          insurance_policy: string | null
          insurance_verified: boolean | null
          legal_name: string | null
          logo_url: string | null
          mc_number: string | null
          minimum_charge: number | null
          on_time_rate: number | null
          onboarding_completed: boolean | null
          primary_email: string
          primary_phone: string
          service_radius_miles: number | null
          service_states: string[] | null
          service_zip_codes: string[] | null
          slug: string | null
          state_license: string | null
          status: string
          stripe_connect_account_id: string | null
          stripe_onboarding_complete: boolean | null
          total_moves_completed: number | null
          total_reviews: number | null
          updated_at: string
          verified_at: string | null
          website: string | null
          year_founded: number | null
        }
        Insert: {
          acceptance_rate?: number | null
          address_city?: string | null
          address_lat?: number | null
          address_lng?: number | null
          address_state?: string | null
          address_street?: string | null
          address_zip?: string | null
          average_rating?: number | null
          base_rate_local?: number | null
          base_rate_long_distance?: number | null
          bbb_rating?: string | null
          cancellation_rate?: number | null
          company_name: string
          created_at?: string
          description?: string | null
          dot_number?: string | null
          id?: string
          insurance_expires_at?: string | null
          insurance_policy?: string | null
          insurance_verified?: boolean | null
          legal_name?: string | null
          logo_url?: string | null
          mc_number?: string | null
          minimum_charge?: number | null
          on_time_rate?: number | null
          onboarding_completed?: boolean | null
          primary_email: string
          primary_phone: string
          service_radius_miles?: number | null
          service_states?: string[] | null
          service_zip_codes?: string[] | null
          slug?: string | null
          state_license?: string | null
          status?: string
          stripe_connect_account_id?: string | null
          stripe_onboarding_complete?: boolean | null
          total_moves_completed?: number | null
          total_reviews?: number | null
          updated_at?: string
          verified_at?: string | null
          website?: string | null
          year_founded?: number | null
        }
        Update: {
          acceptance_rate?: number | null
          address_city?: string | null
          address_lat?: number | null
          address_lng?: number | null
          address_state?: string | null
          address_street?: string | null
          address_zip?: string | null
          average_rating?: number | null
          base_rate_local?: number | null
          base_rate_long_distance?: number | null
          bbb_rating?: string | null
          cancellation_rate?: number | null
          company_name?: string
          created_at?: string
          description?: string | null
          dot_number?: string | null
          id?: string
          insurance_expires_at?: string | null
          insurance_policy?: string | null
          insurance_verified?: boolean | null
          legal_name?: string | null
          logo_url?: string | null
          mc_number?: string | null
          minimum_charge?: number | null
          on_time_rate?: number | null
          onboarding_completed?: boolean | null
          primary_email?: string
          primary_phone?: string
          service_radius_miles?: number | null
          service_states?: string[] | null
          service_zip_codes?: string[] | null
          slug?: string | null
          state_license?: string | null
          status?: string
          stripe_connect_account_id?: string | null
          stripe_onboarding_complete?: boolean | null
          total_moves_completed?: number | null
          total_reviews?: number | null
          updated_at?: string
          verified_at?: string | null
          website?: string | null
          year_founded?: number | null
        }
        Relationships: []
      }
      moving_company_users: {
        Row: {
          created_at: string
          id: string
          moving_company_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          moving_company_id: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          moving_company_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "moving_company_users_moving_company_id_fkey"
            columns: ["moving_company_id"]
            isOneToOne: false
            referencedRelation: "moving_companies"
            referencedColumns: ["id"]
          },
        ]
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
      quotes: {
        Row: {
          accepted_at: string | null
          available_dates: Json | null
          base_price: number
          cancellation_policy: string | null
          created_at: string
          crew_size: number | null
          deposit_required: number | null
          estimated_hours: number | null
          expires_at: string | null
          fuel_surcharge: number | null
          id: string
          move_request_id: string
          moving_company_id: string
          notes: string | null
          packing_price: number | null
          quote_type: string | null
          rejected_at: string | null
          specialty_items_price: number | null
          status: string
          storage_price: number | null
          total_price: number
          unpacking_price: number | null
          updated_at: string
          viewed_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          available_dates?: Json | null
          base_price: number
          cancellation_policy?: string | null
          created_at?: string
          crew_size?: number | null
          deposit_required?: number | null
          estimated_hours?: number | null
          expires_at?: string | null
          fuel_surcharge?: number | null
          id?: string
          move_request_id: string
          moving_company_id: string
          notes?: string | null
          packing_price?: number | null
          quote_type?: string | null
          rejected_at?: string | null
          specialty_items_price?: number | null
          status?: string
          storage_price?: number | null
          total_price: number
          unpacking_price?: number | null
          updated_at?: string
          viewed_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          available_dates?: Json | null
          base_price?: number
          cancellation_policy?: string | null
          created_at?: string
          crew_size?: number | null
          deposit_required?: number | null
          estimated_hours?: number | null
          expires_at?: string | null
          fuel_surcharge?: number | null
          id?: string
          move_request_id?: string
          moving_company_id?: string
          notes?: string | null
          packing_price?: number | null
          quote_type?: string | null
          rejected_at?: string | null
          specialty_items_price?: number | null
          status?: string
          storage_price?: number | null
          total_price?: number
          unpacking_price?: number | null
          updated_at?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_move_request_id_fkey"
            columns: ["move_request_id"]
            isOneToOne: false
            referencedRelation: "move_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_moving_company_id_fkey"
            columns: ["moving_company_id"]
            isOneToOne: false
            referencedRelation: "moving_companies"
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
      reviews: {
        Row: {
          booking_id: string
          care_of_items_rating: number | null
          communication_rating: number | null
          company_responded_at: string | null
          company_response: string | null
          created_at: string
          customer_id: string
          flagged_reason: string | null
          id: string
          moving_company_id: string
          overall_rating: number
          photos: Json | null
          professionalism_rating: number | null
          review_text: string | null
          status: string
          updated_at: string
          value_rating: number | null
        }
        Insert: {
          booking_id: string
          care_of_items_rating?: number | null
          communication_rating?: number | null
          company_responded_at?: string | null
          company_response?: string | null
          created_at?: string
          customer_id: string
          flagged_reason?: string | null
          id?: string
          moving_company_id: string
          overall_rating: number
          photos?: Json | null
          professionalism_rating?: number | null
          review_text?: string | null
          status?: string
          updated_at?: string
          value_rating?: number | null
        }
        Update: {
          booking_id?: string
          care_of_items_rating?: number | null
          communication_rating?: number | null
          company_responded_at?: string | null
          company_response?: string | null
          created_at?: string
          customer_id?: string
          flagged_reason?: string | null
          id?: string
          moving_company_id?: string
          overall_rating?: number
          photos?: Json | null
          professionalism_rating?: number | null
          review_text?: string | null
          status?: string
          updated_at?: string
          value_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_moving_company_id_fkey"
            columns: ["moving_company_id"]
            isOneToOne: false
            referencedRelation: "moving_companies"
            referencedColumns: ["id"]
          },
        ]
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
      get_user_company_id: { Args: { _user_id: string }; Returns: string }
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
      app_role: "admin" | "user" | "mover"
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
      app_role: ["admin", "user", "mover"],
    },
  },
} as const
