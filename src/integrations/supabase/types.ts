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
      event_submissions: {
        Row: {
          data: Json
          genero_musical_id: string | null
          id: string
          master_context: string | null
          submitted_at: string | null
          ticketeira_id: string | null
          token: string | null
        }
        Insert: {
          data: Json
          genero_musical_id?: string | null
          id?: string
          master_context?: string | null
          submitted_at?: string | null
          ticketeira_id?: string | null
          token?: string | null
        }
        Update: {
          data?: Json
          genero_musical_id?: string | null
          id?: string
          master_context?: string | null
          submitted_at?: string | null
          ticketeira_id?: string | null
          token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_submissions_genero_musical_id_fkey"
            columns: ["genero_musical_id"]
            isOneToOne: false
            referencedRelation: "generos_musicais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_submissions_ticketeira_id_fkey"
            columns: ["ticketeira_id"]
            isOneToOne: false
            referencedRelation: "ticketeiras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_submissions_token_fkey"
            columns: ["token"]
            isOneToOne: false
            referencedRelation: "event_tokens"
            referencedColumns: ["token"]
          }
        ]
      }
      event_tokens: {
        Row: {
          client_name: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          token: string
          used: boolean | null
        }
        Insert: {
          client_name?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          token: string
          used?: boolean | null
        }
        Update: {
          client_name?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          token?: string
          used?: boolean | null
        }
        Relationships: []
      }
      generos_musicais: {
        Row: {
          created_at: string | null
          id: string
          nome: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          nome: string
        }
        Update: {
          created_at?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      ticketeiras: {
        Row: {
          created_at: string | null
          id: string
          nome: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          nome: string
        }
        Update: {
          created_at?: string | null
          id?: string
          nome?: string
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
