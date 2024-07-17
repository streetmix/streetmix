import type { ColorModes } from '~/src/app/constants'
import type { SerializedError } from '@reduxjs/toolkit'
import type { StreetData } from '@streetmix/types'

// TODO: Only use this for client-side types
// Shared types should move to @streetmix/types

// Helper type that can be combined with a component's props
// to allow pass-through of arbitrary props
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PassthroughProps = Record<string, any>

export interface UserSettings {
  colorMode: ColorModes
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

export interface UserSignInDetails {
  token: string
  refreshToken: string
  userId: string
  details: UserProfile
}

export interface UserState {
  signInData: UserSignInDetails | null
  signedIn: boolean
  isSubscriber: boolean
  isCoilPluginSubscriber: boolean
  geolocation: {
    attempted: boolean
    data: null
    error: string | SerializedError | null
  }
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
