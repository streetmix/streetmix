import type { StreetData } from '@streetmix/types'

// TODO: Only use this for client-side types
// Shared types should move to @streetmix/types

export interface UserSettings {
  colorMode: string
  lastStreetCreatorId: string
  lastStreetId: string
  lastStreetNamespacedId: number
  locale: string
  newStreetPreference: number
  saveAsImageSegmentNamesAndWidths: boolean
  saveAsImageStreetName: boolean
  saveAsImageTransparentSky: boolean
  saveAsImageWatermark: boolean
  units: number
}

export interface UserSettingsData {
  data: UserSettings
}

export interface UserProfile {
  id: string
  displayName: string
  profileImageUrl: string
  flags: object // TODO: be more specific
  roles: string[]
  data: UserSettings
}

export interface SentimentVote {
  score: number
  data: StreetData
  streetId: string
}

export interface SentimentComment {
  id: string
  comment: string
}

export interface ToastItem {
  mode?: 'success' | 'warning'
  component?: string
  title?: string
  message: string
  action?: string
  duration?: number
  timestamp: number
}

export interface FeatureFlagDefinition {
  label: string
  defaultValue: boolean
  enabled?: boolean
}

export type FeatureFlags = Record<string, FeatureFlagDefinition>
