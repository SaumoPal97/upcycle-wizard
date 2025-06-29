export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          title: string
          quiz_data: any
          guide_json: any
          public: boolean
          created_at: string
          cover_image_url: string | null
          style: string | null
          room: string | null
          difficulty: string | null
          estimated_time: string | null
          budget: number | null
          likes_count: number
          environmental_score: number | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          quiz_data: any
          guide_json: any
          public?: boolean
          created_at?: string
          cover_image_url?: string | null
          style?: string | null
          room?: string | null
          difficulty?: string | null
          estimated_time?: string | null
          budget?: number | null
          likes_count?: number
          environmental_score?: number | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          quiz_data?: any
          guide_json?: any
          public?: boolean
          created_at?: string
          cover_image_url?: string | null
          style?: string | null
          room?: string | null
          difficulty?: string | null
          estimated_time?: string | null
          budget?: number | null
          likes_count?: number
          environmental_score?: number | null
        }
      }
      steps: {
        Row: {
          id: string
          project_id: string
          step_number: number
          title: string
          description: string
          image_url: string | null
          tools_needed: string[]
          materials_needed: string[]
          estimated_time: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          step_number: number
          title: string
          description: string
          image_url?: string | null
          tools_needed?: string[]
          materials_needed?: string[]
          estimated_time?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          step_number?: number
          title?: string
          description?: string
          image_url?: string | null
          tools_needed?: string[]
          materials_needed?: string[]
          estimated_time?: string | null
          created_at?: string
        }
      }
      likes: {
        Row: {
          id: string
          user_id: string
          project_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          user_id: string
          project_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string
          content?: string
          created_at?: string
        }
      }
      feedback: {
        Row: {
          id: string
          user_id: string
          project_id: string
          rating: number
          feedback_text: string | null
          completed_image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id: string
          rating: number
          feedback_text?: string | null
          completed_image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string
          rating?: number
          feedback_text?: string | null
          completed_image_url?: string | null
          created_at?: string
        }
      }
    }
  }
}

export interface QuizData {
  photos: string[]
  furnitureType: string
  size: string
  materials: string[]
  condition: string
  rooms: string[]
  style: string
  colorVibe: string
  customColor?: string
  addons: string[]
  recyclables: string[]
  customRecyclables?: string
  tools: string[]
  budget: number | null
}

export interface GuideStep {
  title: string
  description: string
  tools_needed: string[]
  materials_needed: string[]
  image_url?: string
  estimated_time?: string
  image_prompt?: string
}

export interface GuideData {
  title: string
  overview: string
  steps: GuideStep[]
  materials_list: string[]
  recyclables_used: string[]
  estimated_time: string
  difficulty: string
  environmental_score: number
}