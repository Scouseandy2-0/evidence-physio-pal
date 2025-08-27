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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      assessment_tools: {
        Row: {
          condition_ids: string[] | null
          created_at: string
          description: string | null
          id: string
          instructions: string | null
          interpretation_guide: Json | null
          name: string
          psychometric_properties: Json | null
          reference_values: Json | null
          scoring_method: string | null
          tool_type: string | null
          updated_at: string
        }
        Insert: {
          condition_ids?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          instructions?: string | null
          interpretation_guide?: Json | null
          name: string
          psychometric_properties?: Json | null
          reference_values?: Json | null
          scoring_method?: string | null
          tool_type?: string | null
          updated_at?: string
        }
        Update: {
          condition_ids?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          instructions?: string | null
          interpretation_guide?: Json | null
          name?: string
          psychometric_properties?: Json | null
          reference_values?: Json | null
          scoring_method?: string | null
          tool_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      conditions: {
        Row: {
          category: Database["public"]["Enums"]["condition_category"]
          created_at: string
          description: string | null
          icd_codes: string[] | null
          id: string
          keywords: string[] | null
          name: string
          prevalence_data: Json | null
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["condition_category"]
          created_at?: string
          description?: string | null
          icd_codes?: string[] | null
          id?: string
          keywords?: string[] | null
          name: string
          prevalence_data?: Json | null
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["condition_category"]
          created_at?: string
          description?: string | null
          icd_codes?: string[] | null
          id?: string
          keywords?: string[] | null
          name?: string
          prevalence_data?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      evidence: {
        Row: {
          abstract: string | null
          authors: string[] | null
          clinical_implications: string | null
          condition_ids: string[] | null
          created_at: string
          doi: string | null
          evidence_level: Database["public"]["Enums"]["evidence_level"] | null
          grade_assessment: Json | null
          id: string
          is_active: boolean | null
          journal: string | null
          key_findings: string | null
          pmid: string | null
          publication_date: string | null
          study_type: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          abstract?: string | null
          authors?: string[] | null
          clinical_implications?: string | null
          condition_ids?: string[] | null
          created_at?: string
          doi?: string | null
          evidence_level?: Database["public"]["Enums"]["evidence_level"] | null
          grade_assessment?: Json | null
          id?: string
          is_active?: boolean | null
          journal?: string | null
          key_findings?: string | null
          pmid?: string | null
          publication_date?: string | null
          study_type?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          abstract?: string | null
          authors?: string[] | null
          clinical_implications?: string | null
          condition_ids?: string[] | null
          created_at?: string
          doi?: string | null
          evidence_level?: Database["public"]["Enums"]["evidence_level"] | null
          grade_assessment?: Json | null
          id?: string
          is_active?: boolean | null
          journal?: string | null
          key_findings?: string | null
          pmid?: string | null
          publication_date?: string | null
          study_type?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          professional_title: string | null
          registration_number: string | null
          specialization: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          professional_title?: string | null
          registration_number?: string | null
          specialization?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          professional_title?: string | null
          registration_number?: string | null
          specialization?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      treatment_protocols: {
        Row: {
          condition_id: string | null
          contraindications: string[] | null
          created_at: string
          created_by: string | null
          description: string | null
          duration_weeks: number | null
          evidence_ids: string[] | null
          expected_outcomes: string | null
          frequency_per_week: number | null
          id: string
          is_validated: boolean | null
          name: string
          precautions: string[] | null
          protocol_steps: Json | null
          updated_at: string
        }
        Insert: {
          condition_id?: string | null
          contraindications?: string[] | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_weeks?: number | null
          evidence_ids?: string[] | null
          expected_outcomes?: string | null
          frequency_per_week?: number | null
          id?: string
          is_validated?: boolean | null
          name: string
          precautions?: string[] | null
          protocol_steps?: Json | null
          updated_at?: string
        }
        Update: {
          condition_id?: string | null
          contraindications?: string[] | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_weeks?: number | null
          evidence_ids?: string[] | null
          expected_outcomes?: string | null
          frequency_per_week?: number | null
          id?: string
          is_validated?: boolean | null
          name?: string
          precautions?: string[] | null
          protocol_steps?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "treatment_protocols_condition_id_fkey"
            columns: ["condition_id"]
            isOneToOne: false
            referencedRelation: "conditions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatment_protocols_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string
          display_preferences: Json | null
          id: string
          notification_settings: Json | null
          preferred_conditions: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_preferences?: Json | null
          id?: string
          notification_settings?: Json | null
          preferred_conditions?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_preferences?: Json | null
          id?: string
          notification_settings?: Json | null
          preferred_conditions?: string[] | null
          updated_at?: string
          user_id?: string
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
      condition_category: "msk" | "neurological" | "respiratory"
      evidence_level: "A" | "B" | "C" | "D"
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
      condition_category: ["msk", "neurological", "respiratory"],
      evidence_level: ["A", "B", "C", "D"],
    },
  },
} as const
