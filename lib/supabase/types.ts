export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; child_name: string | null; child_birth_date: string | null; created_at: string }
        Insert: { id: string; child_name?: string | null; child_birth_date?: string | null; created_at?: string }
        Update: { child_name?: string | null; child_birth_date?: string | null }
      }
      food_entries: {
        Row: { id: string; user_id: string; date: string; time: string | null; food_name: string; category: string | null; is_new_product: boolean; notes: string | null; created_at: string }
        Insert: { id?: string; user_id: string; date: string; time?: string | null; food_name: string; category?: string | null; is_new_product?: boolean; notes?: string | null; created_at?: string }
        Update: { user_id?: string; date?: string; time?: string | null; food_name?: string; category?: string | null; is_new_product?: boolean; notes?: string | null }
      }
      contact_entries: {
        Row: { id: string; user_id: string; date: string; time: string | null; contact_type: string; contact_name: string; body_area: string | null; notes: string | null; created_at: string }
        Insert: { id?: string; user_id: string; date: string; time?: string | null; contact_type: string; contact_name: string; body_area?: string | null; notes?: string | null; created_at?: string }
        Update: { user_id?: string; date?: string; time?: string | null; contact_type?: string; contact_name?: string; body_area?: string | null; notes?: string | null }
      }
      skin_entries: {
        Row: { id: string; user_id: string; date: string; time: string | null; severity: number; body_areas: string[]; symptoms: string[]; photo_url: string | null; notes: string | null; created_at: string }
        Insert: { id?: string; user_id: string; date: string; time?: string | null; severity: number; body_areas?: string[]; symptoms?: string[]; photo_url?: string | null; notes?: string | null; created_at?: string }
        Update: { user_id?: string; date?: string; time?: string | null; severity?: number; body_areas?: string[]; symptoms?: string[]; photo_url?: string | null; notes?: string | null }
      }
      medications: {
        Row: { id: string; user_id: string; date: string; time: string | null; med_type: string | null; med_name: string; body_area: string | null; notes: string | null; created_at: string }
        Insert: { id?: string; user_id: string; date: string; time?: string | null; med_type?: string | null; med_name: string; body_area?: string | null; notes?: string | null; created_at?: string }
        Update: { user_id?: string; date?: string; time?: string | null; med_type?: string | null; med_name?: string; body_area?: string | null; notes?: string | null }
      }
      environment_entries: {
        Row: { id: string; user_id: string; date: string; temperature: number | null; humidity: number | null; weather: string | null; notes: string | null; created_at: string }
        Insert: { id?: string; user_id: string; date: string; temperature?: number | null; humidity?: number | null; weather?: string | null; notes?: string | null; created_at?: string }
        Update: { user_id?: string; date?: string; temperature?: number | null; humidity?: number | null; weather?: string | null; notes?: string | null }
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type FoodEntry = Database['public']['Tables']['food_entries']['Row']
export type ContactEntry = Database['public']['Tables']['contact_entries']['Row']
export type SkinEntry = Database['public']['Tables']['skin_entries']['Row']
export type Medication = Database['public']['Tables']['medications']['Row']
export type EnvironmentEntry = Database['public']['Tables']['environment_entries']['Row']
