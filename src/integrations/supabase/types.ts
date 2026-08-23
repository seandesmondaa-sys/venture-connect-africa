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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      assessments: {
        Row: {
          business_quality_score: number | null
          capital_assessment: string | null
          category_scores: Json
          confidence: string | null
          confidence_reason: string | null
          created_at: string
          executive_summary: string | null
          highlights: Json
          id: string
          investment_readiness_score: number | null
          missing_information: Json
          model: string | null
          opportunity_id: string
          recommendation: string | null
          recommended_actions: Json
          risks: Json
          verification_items: Json
          weaknesses: Json
        }
        Insert: {
          business_quality_score?: number | null
          capital_assessment?: string | null
          category_scores?: Json
          confidence?: string | null
          confidence_reason?: string | null
          created_at?: string
          executive_summary?: string | null
          highlights?: Json
          id?: string
          investment_readiness_score?: number | null
          missing_information?: Json
          model?: string | null
          opportunity_id: string
          recommendation?: string | null
          recommended_actions?: Json
          risks?: Json
          verification_items?: Json
          weaknesses?: Json
        }
        Update: {
          business_quality_score?: number | null
          capital_assessment?: string | null
          category_scores?: Json
          confidence?: string | null
          confidence_reason?: string | null
          created_at?: string
          executive_summary?: string | null
          highlights?: Json
          id?: string
          investment_readiness_score?: number | null
          missing_information?: Json
          model?: string | null
          opportunity_id?: string
          recommendation?: string | null
          recommended_actions?: Json
          risks?: Json
          verification_items?: Json
          weaknesses?: Json
        }
        Relationships: [
          {
            foreignKeyName: "assessments_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_events: {
        Row: {
          action: string
          actor: string
          created_at: string
          detail: Json
          entity_id: string
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          actor?: string
          created_at?: string
          detail?: Json
          entity_id: string
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          actor?: string
          created_at?: string
          detail?: Json
          entity_id?: string
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      entity_notes: {
        Row: {
          author: string | null
          body: string
          created_at: string
          entity_id: string
          entity_type: string
          id: string
        }
        Insert: {
          author?: string | null
          body: string
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
        }
        Update: {
          author?: string | null
          body?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      extracted_fields: {
        Row: {
          created_at: string
          document_id: string | null
          field_key: string
          field_label: string
          id: string
          opportunity_id: string
          source_note: string | null
          status: Database["public"]["Enums"]["field_status"]
          value: string | null
          verified: boolean
        }
        Insert: {
          created_at?: string
          document_id?: string | null
          field_key: string
          field_label: string
          id?: string
          opportunity_id: string
          source_note?: string | null
          status?: Database["public"]["Enums"]["field_status"]
          value?: string | null
          verified?: boolean
        }
        Update: {
          created_at?: string
          document_id?: string | null
          field_key?: string
          field_label?: string
          id?: string
          opportunity_id?: string
          source_note?: string | null
          status?: Database["public"]["Enums"]["field_status"]
          value?: string | null
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "extracted_fields_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "opportunity_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extracted_fields_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      follow_up_questions: {
        Row: {
          answer: string | null
          answered_at: string | null
          created_at: string
          field_key: string | null
          id: string
          opportunity_id: string
          question: string
          rationale: string | null
        }
        Insert: {
          answer?: string | null
          answered_at?: string | null
          created_at?: string
          field_key?: string | null
          id?: string
          opportunity_id: string
          question: string
          rationale?: string | null
        }
        Update: {
          answer?: string | null
          answered_at?: string | null
          created_at?: string
          field_key?: string | null
          id?: string
          opportunity_id?: string
          question?: string
          rationale?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "follow_up_questions_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      investor_matches: {
        Row: {
          created_at: string
          explanation: string | null
          fit_score: number
          id: string
          investor_id: string
          issues: Json
          opportunity_id: string
          recommendation: string | null
          status: string
          strong_matches: Json
        }
        Insert: {
          created_at?: string
          explanation?: string | null
          fit_score?: number
          id?: string
          investor_id: string
          issues?: Json
          opportunity_id: string
          recommendation?: string | null
          status?: string
          strong_matches?: Json
        }
        Update: {
          created_at?: string
          explanation?: string | null
          fit_score?: number
          id?: string
          investor_id?: string
          issues?: Json
          opportunity_id?: string
          recommendation?: string | null
          status?: string
          strong_matches?: Json
        }
        Relationships: [
          {
            foreignKeyName: "investor_matches_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investor_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investor_matches_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      investor_submissions: {
        Row: {
          check_size_max: number
          check_size_min: number
          contact_email: string
          countries: string[]
          deal_priorities: string[]
          decision_process: string | null
          due_diligence_process: string | null
          geographies_avoid: string | null
          geographies_focus: string[]
          id: string
          instruments: string[]
          investment_horizon: string | null
          investor_name: string
          investor_type: string | null
          preferred_contact: string | null
          process_notes: string | null
          required_documents: string | null
          screening_process: string | null
          sector_notes: string | null
          sectors: string[]
          stages: string[]
          submitted_at: string
          website: string | null
        }
        Insert: {
          check_size_max?: number
          check_size_min?: number
          contact_email: string
          countries?: string[]
          deal_priorities?: string[]
          decision_process?: string | null
          due_diligence_process?: string | null
          geographies_avoid?: string | null
          geographies_focus?: string[]
          id?: string
          instruments?: string[]
          investment_horizon?: string | null
          investor_name: string
          investor_type?: string | null
          preferred_contact?: string | null
          process_notes?: string | null
          required_documents?: string | null
          screening_process?: string | null
          sector_notes?: string | null
          sectors?: string[]
          stages?: string[]
          submitted_at?: string
          website?: string | null
        }
        Update: {
          check_size_max?: number
          check_size_min?: number
          contact_email?: string
          countries?: string[]
          deal_priorities?: string[]
          decision_process?: string | null
          due_diligence_process?: string | null
          geographies_avoid?: string | null
          geographies_focus?: string[]
          id?: string
          instruments?: string[]
          investment_horizon?: string | null
          investor_name?: string
          investor_type?: string | null
          preferred_contact?: string | null
          process_notes?: string | null
          required_documents?: string | null
          screening_process?: string | null
          sector_notes?: string | null
          sectors?: string[]
          stages?: string[]
          submitted_at?: string
          website?: string | null
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          business_description: string | null
          business_model: string | null
          business_quality_score: number | null
          capital_required: number | null
          category_scores: Json
          company_name: string
          competition: string | null
          contact_email: string | null
          contact_name: string | null
          country: string | null
          existing_funding: string | null
          financials: string | null
          growth_plans: string | null
          id: string
          instrument: string | null
          investment_readiness_score: number | null
          market: string | null
          owner_user_id: string | null
          problem: string | null
          region: string | null
          revenue_summary: string | null
          risks: string | null
          score_confidence: string | null
          sector: string | null
          solution: string | null
          stage: string | null
          status: Database["public"]["Enums"]["opportunity_status"]
          submission_method: string
          submitted_at: string
          team: string | null
          traction: string | null
          updated_at: string
          use_of_funds: string | null
          website: string | null
        }
        Insert: {
          business_description?: string | null
          business_model?: string | null
          business_quality_score?: number | null
          capital_required?: number | null
          category_scores?: Json
          company_name: string
          competition?: string | null
          contact_email?: string | null
          contact_name?: string | null
          country?: string | null
          existing_funding?: string | null
          financials?: string | null
          growth_plans?: string | null
          id?: string
          instrument?: string | null
          investment_readiness_score?: number | null
          market?: string | null
          owner_user_id?: string | null
          problem?: string | null
          region?: string | null
          revenue_summary?: string | null
          risks?: string | null
          score_confidence?: string | null
          sector?: string | null
          solution?: string | null
          stage?: string | null
          status?: Database["public"]["Enums"]["opportunity_status"]
          submission_method?: string
          submitted_at?: string
          team?: string | null
          traction?: string | null
          updated_at?: string
          use_of_funds?: string | null
          website?: string | null
        }
        Update: {
          business_description?: string | null
          business_model?: string | null
          business_quality_score?: number | null
          capital_required?: number | null
          category_scores?: Json
          company_name?: string
          competition?: string | null
          contact_email?: string | null
          contact_name?: string | null
          country?: string | null
          existing_funding?: string | null
          financials?: string | null
          growth_plans?: string | null
          id?: string
          instrument?: string | null
          investment_readiness_score?: number | null
          market?: string | null
          owner_user_id?: string | null
          problem?: string | null
          region?: string | null
          revenue_summary?: string | null
          risks?: string | null
          score_confidence?: string | null
          sector?: string | null
          solution?: string | null
          stage?: string | null
          status?: Database["public"]["Enums"]["opportunity_status"]
          submission_method?: string
          submitted_at?: string
          team?: string | null
          traction?: string | null
          updated_at?: string
          use_of_funds?: string | null
          website?: string | null
        }
        Relationships: []
      }
      opportunity_documents: {
        Row: {
          doc_type: string
          file_name: string
          id: string
          mime_type: string | null
          opportunity_id: string
          size_bytes: number | null
          storage_path: string | null
          uploaded_at: string
        }
        Insert: {
          doc_type?: string
          file_name: string
          id?: string
          mime_type?: string | null
          opportunity_id: string
          size_bytes?: number | null
          storage_path?: string | null
          uploaded_at?: string
        }
        Update: {
          doc_type?: string
          file_name?: string
          id?: string
          mime_type?: string | null
          opportunity_id?: string
          size_bytes?: number | null
          storage_path?: string | null
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_documents_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      scoring_config: {
        Row: {
          id: string
          key: string
          updated_at: string
          weights: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          weights?: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          weights?: Json
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "team" | "member"
      field_status: "CONFIRMED" | "INFERRED" | "MISSING" | "NEEDS_VERIFICATION"
      opportunity_status:
        | "submitted"
        | "ai_screening"
        | "information_required"
        | "investment_ready"
        | "auxilium_review"
        | "investor_matching"
        | "investor_interest"
        | "due_diligence"
        | "investment_committee"
        | "term_sheet"
        | "closed"
        | "portfolio"
        | "rejected"
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
      app_role: ["admin", "team", "member"],
      field_status: ["CONFIRMED", "INFERRED", "MISSING", "NEEDS_VERIFICATION"],
      opportunity_status: [
        "submitted",
        "ai_screening",
        "information_required",
        "investment_ready",
        "auxilium_review",
        "investor_matching",
        "investor_interest",
        "due_diligence",
        "investment_committee",
        "term_sheet",
        "closed",
        "portfolio",
        "rejected",
      ],
    },
  },
} as const
