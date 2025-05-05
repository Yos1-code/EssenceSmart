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
      products: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string
          price: number
          category: string
          subcategory: string | null
          image_url: string
          model_3d_url: string | null
          stock: number
          featured: boolean
          discount_percent: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description: string
          price: number
          category: string
          subcategory?: string | null
          image_url: string
          model_3d_url?: string | null
          stock: number
          featured?: boolean
          discount_percent?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string
          price?: number
          category?: string
          subcategory?: string | null
          image_url?: string
          model_3d_url?: string | null
          stock?: number
          featured?: boolean
          discount_percent?: number | null
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          full_name: string | null
          avatar_url: string | null
          is_admin: boolean
        }
        Insert: {
          id: string
          created_at?: string
          full_name?: string | null
          avatar_url?: string | null
          is_admin?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          full_name?: string | null
          avatar_url?: string | null
          is_admin?: boolean
        }
      }
      product_likes: {
        Row: {
          id: string
          created_at: string
          user_id: string
          product_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          product_id: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          product_id?: string
        }
      }
      cart_items: {
        Row: {
          id: string
          created_at: string
          user_id: string
          product_id: string
          quantity: number
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          product_id: string
          quantity: number
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          product_id?: string
          quantity?: number
        }
      }
      orders: {
        Row: {
          id: string
          created_at: string
          user_id: string
          total: number
          status: string
          payment_method: string
          shipping_address: Json
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          total: number
          status: string
          payment_method: string
          shipping_address: Json
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          total?: number
          status?: string
          payment_method?: string
          shipping_address?: Json
        }
      }
      order_items: {
        Row: {
          id: string
          created_at: string
          order_id: string
          product_id: string
          quantity: number
          price: number
        }
        Insert: {
          id?: string
          created_at?: string
          order_id: string
          product_id: string
          quantity: number
          price: number
        }
        Update: {
          id?: string
          created_at?: string
          order_id?: string
          product_id?: string
          quantity?: number
          price?: number
        }
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