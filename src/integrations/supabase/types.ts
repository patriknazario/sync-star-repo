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
          cidade: string
          created_at: string | null
          data_inicio: string
          data_termino: string
          descricao: string | null
          estado: string
          id: string
          professor_id: string | null
          status: Database["public"]["Enums"]["curso_status"] | null
          tema: string
          updated_at: string | null
          valor_inscricao: number
        }
        Insert: {
          carga_horaria: number
          cidade: string
          created_at?: string | null
          data_inicio: string
          data_termino: string
          descricao?: string | null
          estado: string
          id?: string
          professor_id?: string | null
          status?: Database["public"]["Enums"]["curso_status"] | null
          tema: string
          updated_at?: string | null
          valor_inscricao: number
        }
        Update: {
          carga_horaria?: number
          cidade?: string
          created_at?: string | null
          data_inicio?: string
          data_termino?: string
          descricao?: string | null
          estado?: string
          id?: string
          professor_id?: string | null
          status?: Database["public"]["Enums"]["curso_status"] | null
          tema?: string
          updated_at?: string | null
          valor_inscricao?: number
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
          cidade: string
          created_at: string | null
          curso_id: string
          data_cadastro: string | null
          data_conversao: string | null
          email: string | null
          estado: string
          id: string
          motivo_perda: Database["public"]["Enums"]["motivo_perda"] | null
          nome_responsavel: string
          observacoes: string | null
          orgao: string
          quantidade_inscricoes: number | null
          setor: string | null
          status: Database["public"]["Enums"]["lead_status"] | null
          telefone: string | null
          updated_at: string | null
          valor_negociado: number | null
          valor_proposta: number
          vendedora_id: string
        }
        Insert: {
          cidade: string
          created_at?: string | null
          curso_id: string
          data_cadastro?: string | null
          data_conversao?: string | null
          email?: string | null
          estado: string
          id?: string
          motivo_perda?: Database["public"]["Enums"]["motivo_perda"] | null
          nome_responsavel: string
          observacoes?: string | null
          orgao: string
          quantidade_inscricoes?: number | null
          setor?: string | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          telefone?: string | null
          updated_at?: string | null
          valor_negociado?: number | null
          valor_proposta: number
          vendedora_id: string
        }
        Update: {
          cidade?: string
          created_at?: string | null
          curso_id?: string
          data_cadastro?: string | null
          data_conversao?: string | null
          email?: string | null
          estado?: string
          id?: string
          motivo_perda?: Database["public"]["Enums"]["motivo_perda"] | null
          nome_responsavel?: string
          observacoes?: string | null
          orgao?: string
          quantidade_inscricoes?: number | null
          setor?: string | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          telefone?: string | null
          updated_at?: string | null
          valor_negociado?: number | null
          valor_proposta?: number
          vendedora_id?: string
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
          descricao: string | null
          id: string
          updated_at: string | null
          valor: number
        }
        Insert: {
          ano: number
          created_at?: string | null
          descricao?: string | null
          id?: string
          updated_at?: string | null
          valor: number
        }
        Update: {
          ano?: number
          created_at?: string | null
          descricao?: string | null
          id?: string
          updated_at?: string | null
          valor?: number
        }
        Relationships: []
      }
      professores: {
        Row: {
          areas: string[] | null
          bio: string | null
          created_at: string | null
          email: string
          foto: string | null
          id: string
          nome: string
          redes_sociais: Json | null
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          areas?: string[] | null
          bio?: string | null
          created_at?: string | null
          email: string
          foto?: string | null
          id?: string
          nome: string
          redes_sociais?: Json | null
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          areas?: string[] | null
          bio?: string | null
          created_at?: string | null
          email?: string
          foto?: string | null
          id?: string
          nome?: string
          redes_sociais?: Json | null
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          nome: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          nome: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          nome?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      taxas_comissao: {
        Row: {
          created_at: string | null
          curso_id: string | null
          id: string
          taxa: number
          tipo: Database["public"]["Enums"]["taxa_tipo"]
          updated_at: string | null
          vendedora_id: string | null
        }
        Insert: {
          created_at?: string | null
          curso_id?: string | null
          id?: string
          taxa: number
          tipo: Database["public"]["Enums"]["taxa_tipo"]
          updated_at?: string | null
          vendedora_id?: string | null
        }
        Update: {
          created_at?: string | null
          curso_id?: string | null
          id?: string
          taxa?: number
          tipo?: Database["public"]["Enums"]["taxa_tipo"]
          updated_at?: string | null
          vendedora_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "taxas_comissao_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "taxas_comissao_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "view_stats_cursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "taxas_comissao_vendedora_id_fkey"
            columns: ["vendedora_id"]
            isOneToOne: false
            referencedRelation: "vendedoras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "taxas_comissao_vendedora_id_fkey"
            columns: ["vendedora_id"]
            isOneToOne: false
            referencedRelation: "view_performance_vendedoras"
            referencedColumns: ["id"]
          },
        ]
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
          created_at: string | null
          email: string
          id: string
          meta_anual: number | null
          meta_mensal: number | null
          nome: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          meta_anual?: number | null
          meta_mensal?: number | null
          nome: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          meta_anual?: number | null
          meta_mensal?: number | null
          nome?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      view_performance_vendedoras: {
        Row: {
          email: string | null
          faturamento_total: number | null
          id: string | null
          leads_convertidos: number | null
          meta_anual: number | null
          meta_mensal: number | null
          nome: string | null
          taxa_conversao: number | null
          total_inscricoes: number | null
          total_leads: number | null
        }
        Relationships: []
      }
      view_stats_cursos: {
        Row: {
          cidade: string | null
          data_inicio: string | null
          data_termino: string | null
          estado: string | null
          faturamento: number | null
          id: string | null
          inscricoes: number | null
          professor_nome: string | null
          status: Database["public"]["Enums"]["curso_status"] | null
          tema: string | null
          total_leads: number | null
          valor_inscricao: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calc_realizado_ano: {
        Args: { _ano: number }
        Returns: number
      }
      get_faturamento_curso: {
        Args: { _curso_id: string }
        Returns: number
      }
      get_inscricoes_curso: {
        Args: { _curso_id: string }
        Returns: number
      }
      get_taxa_comissao: {
        Args: { _curso_id: string; _vendedora_id: string }
        Returns: number
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "vendedora" | "gerente" | "visualizador"
      curso_status:
        | "Planejado"
        | "Inscrições Abertas"
        | "Em Andamento"
        | "Concluído"
        | "Cancelado"
      lead_status:
        | "Proposta Enviada"
        | "Inscrição Realizada"
        | "Proposta Declinada"
      motivo_perda: "Preço" | "Data do curso incompatível" | "Sem orçamento"
      taxa_tipo: "Padrão" | "Específica"
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
      app_role: ["admin", "vendedora", "gerente", "visualizador"],
      curso_status: [
        "Planejado",
        "Inscrições Abertas",
        "Em Andamento",
        "Concluído",
        "Cancelado",
      ],
      lead_status: [
        "Proposta Enviada",
        "Inscrição Realizada",
        "Proposta Declinada",
      ],
      motivo_perda: ["Preço", "Data do curso incompatível", "Sem orçamento"],
      taxa_tipo: ["Padrão", "Específica"],
    },
  },
} as const
