export interface Critique {
  ugly_score: number
  issues: string[]
  summary: string
  recommendation: string
}

export interface Business {
  place_id: string
  name: string
  address: string
  phone: string
  website: string
  rating: number
  reviews: number
  screenshot: string | null
  critique: Critique
}

export type ScanStatus = 'idle' | 'scanning' | 'done' | 'error'

export interface Progress {
  message: string
  current: number
  total: number
}
