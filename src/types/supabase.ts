export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      agencies: {
        Row: {
          id: string
          name: string
          code: string
          address: string | null
          phone: string | null
          email: string | null
        }
        Insert: {
          id?: string
          name: string
          code: string
          address?: string | null
          phone?: string | null
          email?: string | null
        }
        Update: {
          id?: string
          name?: string
          code?: string
          address?: string | null
          phone?: string | null
          email?: string | null
        }
      }
      clients: {
        Row: {
          id: string
          name: string
          address: string | null
          postal_code: string | null
          city: string | null
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          postal_code?: string | null
          city?: string | null
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          postal_code?: string | null
          city?: string | null
        }
      }
      client_orders: {
        Row: {
          id: string
          mission_number: string
          mission_type: 'PLA' | 'INT' | 'VAC'
          client_name: string
          project_name: string | null
          start_date: string
          end_date: string
          required_skills: Json
          required_certifications: Json
          status: 'pending' | 'cancelled_client' | 'cancelled_consultant' | 'completed'
          assigned_consultant_id: string | null
          contract_reason: string | null
          cancellation_reason: string | null
          comments: string | null
          is_temporary: boolean
          qualification: string
          created_by: string | null
          agency_code: string | null
          created_at: string
        }
        Insert: {
          id?: string
          mission_number: string
          mission_type: 'PLA' | 'INT' | 'VAC'
          client_name: string
          project_name?: string | null
          start_date: string
          end_date: string
          required_skills?: Json
          required_certifications?: Json
          status?: 'pending' | 'cancelled_client' | 'cancelled_consultant' | 'completed'
          assigned_consultant_id?: string | null
          contract_reason?: string | null
          cancellation_reason?: string | null
          comments?: string | null
          is_temporary?: boolean
          qualification: string
          created_by?: string | null
          agency_code?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          mission_number?: string
          mission_type?: 'PLA' | 'INT' | 'VAC'
          client_name?: string
          project_name?: string | null
          start_date?: string
          end_date?: string
          required_skills?: Json
          required_certifications?: Json
          status?: 'pending' | 'cancelled_client' | 'cancelled_consultant' | 'completed'
          assigned_consultant_id?: string | null
          contract_reason?: string | null
          cancellation_reason?: string | null
          comments?: string | null
          is_temporary?: boolean
          qualification?: string
          created_by?: string | null
          agency_code?: string | null
          created_at?: string
        }
      }
      consultants: {
        Row: {
          id: string
          name: string
          surname: string
          role: string
          skills: Json
          certifications: Json
          hourly_rate: number | null
          preferred_locations: Json
          agency_code: string | null
          availability: Json
        }
        Insert: {
          id?: string
          name: string
          surname: string
          role: string
          skills?: Json
          certifications?: Json
          hourly_rate?: number | null
          preferred_locations?: Json
          agency_code?: string | null
          availability?: Json
        }
        Update: {
          id?: string
          name?: string
          surname?: string
          role?: string
          skills?: Json
          certifications?: Json
          hourly_rate?: number | null
          preferred_locations?: Json
          agency_code?: string | null
          availability?: Json
        }
      }
      roles: {
        Row: {
          id: string
          qualification: string
          acronym: string
        }
        Insert: {
          id?: string
          qualification: string
          acronym: string
        }
        Update: {
          id?: string
          qualification?: string
          acronym?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          agency_id: string | null
          role: 'admin' | 'manager' | 'user'
          active: boolean
          last_login: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name: string
          last_name: string
          agency_id?: string | null
          role?: 'admin' | 'manager' | 'user'
          active?: boolean
          last_login?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          agency_id?: string | null
          role?: 'admin' | 'manager' | 'user'
          active?: boolean
          last_login?: string | null
          created_at?: string
        }
      }
    }
  }
}