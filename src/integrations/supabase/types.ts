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
      cursos: {
        Row: {
          carga_horaria: number
          cidade: string | null
          created_at: string | null
          data_inicio: string
          data_termino: string
          descricao: string | null
          estado: string | null
          id: number
          meta_inscricoes: number
          modalidade: Database["public"]["Enums"]["modalidade"]
          nome: string
          professor_id: number | null
          status: Database["public"]["Enums"]["curso_status"]
          updated_at: string | null
          valor_total: number
        }
        Insert: {
          carga_horaria?: number
          cidade?: string | null
          created_at?: string | null
          data_inicio: string
          data_termino: string
          descricao?: string | null
          estado?: string | null
          id?: number
          meta_inscricoes?: number
          modalidade?: Database["public"]["Enums"]["modalidade"]
          nome: string
          professor_id?: number | null
          status?: Database["public"]["Enums"]["curso_status"]
          updated_at?: string | null
          valor_total?: number
        }
        Update: {
          carga_horaria?: number
          cidade?: string | null
          created_at?: string | null
          data_inicio?: string
          data_termino?: string
          descricao?: string | null
          estado?: string | null
          id?: number
          meta_inscricoes?: number
          modalidade?: Database["public"]["Enums"]["modalidade"]
          nome?: string
          professor_id?: number | null
          status?: Database["public"]["Enums"]["curso_status"]
          updated_at?: string | null
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "cursos_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          cargo: string | null
          created_at: string | null
          curso_id: number
          data_cadastro: string | null
          data_conversao: string | null
          email_cliente: string
          empresa: string | null
          id: number
          nome_cliente: string
          observacoes: string | null
          quantidade_inscricoes: number
          status: Database["public"]["Enums"]["lead_status"]
          telefone_cliente: string | null
          updated_at: string | null
          valor_negociado: number | null
          valor_proposta: number
          vendedora_id: number
        }
        Insert: {
          cargo?: string | null
          created_at?: string | null
          curso_id: number
          data_cadastro?: string | null
          data_conversao?: string | null
          email_cliente: string
          empresa?: string | null
          id?: number
          nome_cliente: string
          observacoes?: string | null
          quantidade_inscricoes?: number
          status?: Database["public"]["Enums"]["lead_status"]
          telefone_cliente?: string | null
          updated_at?: string | null
          valor_negociado?: number | null
          valor_proposta?: number
          vendedora_id: number
        }
        Update: {
          cargo?: string | null
          created_at?: string | null
          curso_id?: number
          data_cadastro?: string | null
          data_conversao?: string | null
          email_cliente?: string
          empresa?: string | null
          id?: number
          nome_cliente?: string
          observacoes?: string | null
          quantidade_inscricoes?: number
          status?: Database["public"]["Enums"]["lead_status"]
          telefone_cliente?: string | null
          updated_at?: string | null
          valor_negociado?: number | null
          valor_proposta?: number
          vendedora_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "leads_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "view_stats_cursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_vendedora_id_fkey"
            columns: ["vendedora_id"]
            isOneToOne: false
            referencedRelation: "vendedoras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_vendedora_id_fkey"
            columns: ["vendedora_id"]
            isOneToOne: false
            referencedRelation: "view_performance_vendedoras"
            referencedColumns: ["id"]
          },
        ]
      }
      metas_globais: {
        Row: {
          ano: number
          created_at: string | null
          id: number
          meta_faturamento: number
          meta_inscricoes: number
          updated_at: string | null
        }
        Insert: {
          ano: number
          created_at?: string | null
          id?: number
          meta_faturamento?: number
          meta_inscricoes?: number
          updated_at?: string | null
        }
        Update: {
          ano?: number
          created_at?: string | null
          id?: number
          meta_faturamento?: number
          meta_inscricoes?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      professores: {
        Row: {
          created_at: string | null
          email: string
          especialidade: string | null
          id: number
          nome: string
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          especialidade?: string | null
          id?: number
          nome: string
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          especialidade?: string | null
          id?: number
          nome?: string
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          id: string
          nome: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          nome?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          nome?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      taxas_comissao: {
        Row: {
          created_at: string | null
          id: number
          nome: string
          percentual: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          nome: string
          percentual?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          nome?: string
          percentual?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vendedoras: {
        Row: {
          ano: number
          created_at: string | null
          email: string
          id: number
          meta_anual: number
          meta_mensal: number
          nome: string
          telefone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ano?: number
          created_at?: string | null
          email: string
          id?: number
          meta_anual?: number
          meta_mensal?: number
          nome: string
          telefone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ano?: number
          created_at?: string | null
          email?: string
          id?: number
          meta_anual?: number
          meta_mensal?: number
          nome?: string
          telefone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      view_performance_vendedoras: {
        Row: {
          ano: number | null
          cursos_atendidos: number | null
          email: string | null
          faturamento_realizado: number | null
          id: number | null
          inscricoes_realizadas: number | null
          leads_convertidos: number | null
          meta_anual: number | null
          nome: string | null
          total_leads: number | null
        }
        Relationships: []
      }
      view_stats_cursos: {
        Row: {
          data_inicio: string | null
          data_termino: string | null
          faturamento_realizado: number | null
          id: number | null
          inscricoes_realizadas: number | null
          meta_inscricoes: number | null
          nome: string | null
          status: Database["public"]["Enums"]["curso_status"] | null
          total_leads: number | null
          valor_total: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calc_realizado_ano: {
        Args: { ano_param: number }
        Returns: number
      }
      get_faturamento_curso: {
        Args: { curso_id_param: number }
        Returns: number
      }
      get_inscricoes_curso: {
        Args: { curso_id_param: number }
        Returns: number
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "gerente" | "vendedora" | "visualizador"
      curso_status: "Planejado" | "Em Andamento" | "Concluído" | "Cancelado"
      lead_status: "Proposta Enviada" | "Inscrição Realizada" | "Não Convertido"
      modalidade: "Presencial" | "EAD" | "Híbrido"
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
      app_role: ["admin", "gerente", "vendedora", "visualizador"],
      curso_status: ["Planejado", "Em Andamento", "Concluído", "Cancelado"],
      lead_status: [
        "Proposta Enviada",
        "Inscrição Realizada",
        "Não Convertido",
      ],
      modalidade: ["Presencial", "EAD", "Híbrido"],
    },
  },
} as const
