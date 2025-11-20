import type { ColorModes } from '~/src/app/constants'
import type { SerializedError } from '@reduxjs/toolkit'
import type { StreetState, GeolocationData } from '@streetmix/types'

// TODO: Only use this for client-side types
// Shared types should move to @streetmix/types

export interface UserSettings {
  colorMode: ColorModes
  lastStreetCreatorId: string
  lastStreetId: string
  lastStreetNamespacedId: number
  locale: string
  newStreetPreference: number // Deprecated
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
    data: GeolocationData | null
    error: string | SerializedError | null
  }
}

export type ContentDirection = 'ltr' | 'rtl'

export interface SentimentVote {
  score: number
  data: StreetState
  streetId: string
}

export interface SentimentComment {
  id: string
  comment: string
}

type ToastComponent =
  | 'TOAST_UNDO'
  | 'TOAST_SIGN_IN'
  | 'TOAST_WEB_MONETIZATION'
  | 'TOAST_WEB_MONETIZATION_SUCCESS'
  | 'TOAST_NO_CONNECTION'

interface BaseToastItem {
  method?: 'success' | 'warning'
  title?: string
  action?: string
  duration?: number
  timestamp: number
}

// Toasts that specify component should not provide its own message
export interface ToastItemWithComponent extends BaseToastItem {
  component: ToastComponent
}

// Toasts that use a message should not specify a component name
export interface ToastItemWithMessage extends BaseToastItem {
  message: string
}

export type ToastItem = ToastItemWithComponent | ToastItemWithMessage

export interface FeatureFlagDefinition {
  label: string
  defaultValue: boolean
  enabled?: boolean
}

export interface FeatureFlagSetting extends FeatureFlagDefinition {
  value: boolean
  source: string
}

export type FeatureFlags = Record<string, FeatureFlagDefinition>
export type FeatureFlagSettings = Record<string, FeatureFlagSetting>

export interface DraggingState {
  isDragging: boolean
  segmentBeforeEl: number | null
  segmentAfterEl: number | null
  draggedSegment: number | null
  withinCanvas: boolean
}
