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

export interface Segment {
  id: string
  type: string
  variantString: string
  width: number
  elevation: number
}

export interface StreetClass {
  schemaVersion: number
  showAnalytics: boolean
  width: number
  id: string
  namespacedId: number
  units: number
  location: null
  userUpdated: boolean
  environment: string
  leftBuildingHeight: number
  rightBuildingHeight: number
  leftBuildingVariant: string
  rightBuildingVariant: string
  segments: Segment[]
  editCount: number
}

export interface StreetData {
  street: StreetClass
}

export interface Street {
  id: string
  namespacedId: number
  name: null
  clientUpdatedAt: Date
  data: StreetData
  createdAt: Date
  updatedAt: Date
  originalStreetId: string
  creatorId: string
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

export interface LatLngObject {
  lat: number
  lng: number
}

export interface ToastItem {
  mode?: string
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

export interface FeatureFlags extends Record<string, FeatureFlagDefinition> {}
