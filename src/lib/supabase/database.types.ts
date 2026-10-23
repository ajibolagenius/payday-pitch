
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "public": {
          Tables: {
            "debt": {
                  Row: {
                    "cleared_at": string | null,"created_at": string,"currency": string,"id": number,"name": string,"principal_minor": number,"target_date": string | null,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "cleared_at"?: string | null,"created_at"?: string,"currency": string,"id"?: never,"name": string,"principal_minor": number,"target_date"?: string | null,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "cleared_at"?: string | null,"created_at"?: string,"currency"?: string,"id"?: never,"name"?: string,"principal_minor"?: number,"target_date"?: string | null,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"fixed_cost": {
                  Row: {
                    "amount_minor": number,"created_at": string,"currency": string,"id": number,"name": string,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "amount_minor": number,"created_at"?: string,"currency": string,"id"?: never,"name": string,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "amount_minor"?: number,"created_at"?: string,"currency"?: string,"id"?: never,"name"?: string,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"formation_position": {
                  Row: {
                    "basis_points": number,"id": number,"label": string,"role": string,"shape_id": number,"spot_index": number
                  }
                  ComputedFields: never
                  Insert: {
                    "basis_points": number,"id"?: never,"label": string,"role": string,"shape_id": number,"spot_index": number
                  }
                  Update: {
                    "basis_points"?: number,"id"?: never,"label"?: string,"role"?: string,"shape_id"?: number,"spot_index"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "formation_position_shape_id_fkey"
      columns: ["shape_id"]
isOneToOne: false
      referencedRelation: "formation_shape"
      referencedColumns: ["id"]
    }
                  ]
                },"formation_shape": {
                  Row: {
                    "deprecated": boolean,"id": number,"name": string,"sort": number,"style": string,"when_to_play": string
                  }
                  ComputedFields: never
                  Insert: {
                    "deprecated"?: boolean,"id"?: never,"name": string,"sort": number,"style": string,"when_to_play": string
                  }
                  Update: {
                    "deprecated"?: boolean,"id"?: never,"name"?: string,"sort"?: number,"style"?: string,"when_to_play"?: string
                  }
                  Relationships: [
                    
                  ]
                },"goal": {
                  Row: {
                    "completed_at": string | null,"created_at": string,"currency": string,"id": number,"name": string,"target_minor": number,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "completed_at"?: string | null,"created_at"?: string,"currency": string,"id"?: never,"name": string,"target_minor": number,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "completed_at"?: string | null,"created_at"?: string,"currency"?: string,"id"?: never,"name"?: string,"target_minor"?: number,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"income_stream": {
                  Row: {
                    "amount_minor": number,"created_at": string,"currency": string,"id": number,"name": string,"payday_day": number,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "amount_minor": number,"created_at"?: string,"currency": string,"id"?: never,"name": string,"payday_day": number,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "amount_minor"?: number,"created_at"?: string,"currency"?: string,"id"?: never,"name"?: string,"payday_day"?: number,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"match": {
                  Row: {
                    "created_at": string,"currency": string,"id": number,"library_id": number | null,"library_name": string | null,"period": string,"shape_name": string,"source_kind": string,"status": string,"tactic_id": number | null,"tactic_version_id": number | null,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"currency": string,"id"?: never,"library_id"?: number | null,"library_name"?: string | null,"period": string,"shape_name": string,"source_kind": string,"status"?: string,"tactic_id"?: number | null,"tactic_version_id"?: number | null,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"currency"?: string,"id"?: never,"library_id"?: number | null,"library_name"?: string | null,"period"?: string,"shape_name"?: string,"source_kind"?: string,"status"?: string,"tactic_id"?: number | null,"tactic_version_id"?: number | null,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "match_library_id_fkey"
      columns: ["library_id"]
isOneToOne: false
      referencedRelation: "formation_shape"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "match_tactic_id_fkey"
      columns: ["tactic_id"]
isOneToOne: false
      referencedRelation: "user_tactic"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "match_tactic_version_id_fkey"
      columns: ["tactic_version_id"]
isOneToOne: false
      referencedRelation: "user_tactic_version"
      referencedColumns: ["id"]
    }
                  ]
                },"match_line": {
                  Row: {
                    "actual_minor": number | null,"basis_points": number,"currency": string,"debt_id": number | null,"debt_name": string | null,"goal_id": number | null,"goal_name": string | null,"id": number,"label": string,"match_id": number,"planned_minor": number,"role": string,"spot_index": number
                  }
                  ComputedFields: never
                  Insert: {
                    "actual_minor"?: number | null,"basis_points": number,"currency": string,"debt_id"?: number | null,"debt_name"?: string | null,"goal_id"?: number | null,"goal_name"?: string | null,"id"?: never,"label": string,"match_id": number,"planned_minor": number,"role": string,"spot_index": number
                  }
                  Update: {
                    "actual_minor"?: number | null,"basis_points"?: number,"currency"?: string,"debt_id"?: number | null,"debt_name"?: string | null,"goal_id"?: number | null,"goal_name"?: string | null,"id"?: never,"label"?: string,"match_id"?: number,"planned_minor"?: number,"role"?: string,"spot_index"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "match_line_debt_id_fkey"
      columns: ["debt_id"]
isOneToOne: false
      referencedRelation: "debt"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "match_line_goal_id_fkey"
      columns: ["goal_id"]
isOneToOne: false
      referencedRelation: "goal"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "match_line_match_id_fkey"
      columns: ["match_id"]
isOneToOne: false
      referencedRelation: "match"
      referencedColumns: ["id"]
    }
                  ]
                },"profile": {
                  Row: {
                    "created_at": string,"default_currency": string,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"default_currency"?: string,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"default_currency"?: string,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"user_tactic": {
                  Row: {
                    "created_at": string,"id": number,"name": string,"shape_name": string | null,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: never,"name": string,"shape_name"?: string | null,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: never,"name"?: string,"shape_name"?: string | null,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"user_tactic_version": {
                  Row: {
                    "created_at": string,"id": number,"is_current": boolean,"split": NonNullable<Json>,"tactic_id": number
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: never,"is_current"?: boolean,"split": NonNullable<Json>,"tactic_id": number
                  }
                  Update: {
                    "created_at"?: string,"id"?: never,"is_current"?: boolean,"split"?: NonNullable<Json>,"tactic_id"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "user_tactic_version_tactic_id_fkey"
      columns: ["tactic_id"]
isOneToOne: false
      referencedRelation: "user_tactic"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            "debt_progress": {
                  Row: {
                    "debt_id": number | null,"paid_minor": number | null
                  }
                  ComputedFields: never
                  Relationships: [
                    {
      foreignKeyName: "match_line_debt_id_fkey"
      columns: ["debt_id"]
isOneToOne: false
      referencedRelation: "debt"
      referencedColumns: ["id"]
    }
                  ]
                },"goal_progress": {
                  Row: {
                    "goal_id": number | null,"saved_minor": number | null
                  }
                  ComputedFields: never
                  Relationships: [
                    {
      foreignKeyName: "match_line_goal_id_fkey"
      columns: ["goal_id"]
isOneToOne: false
      referencedRelation: "goal"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Functions: {
            "play_match":
{ Args: { "p_lines": Json,"p_shape_id": number }; Returns: Json
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

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "public": {
          Enums: {
            
          }
        }
} as const
