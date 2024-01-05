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
  variant: Record<string, string>
  warnings: Array<boolean | null>
}

export interface StreetClass {
  schemaVersion: number
  showAnalytics: boolean
  width: number
  id: string
  namespacedId: number
  units: number
  location: StreetLocation | null
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

export interface StreetLocation {
  lntlng: LatLngObject
  wofId: string
  label: string
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

export interface Environs {
  name: string
  enabled: boolean
  iconImage: string // Illustration asset ID
  backgroundColor: string // CSS color string
  backgroundImage: string // Illustration asset ID
  backgroundGradient: Array<[string, number?]> // [CSS color string, opacity]
  backgroundObjects: Array<{
    image: string // Illustration asset ID
    width: number // in pixels
    height: number // in pixels
    top: number // Percentage as decimal
    left: number // Percentage as decimal
  }>
  foregroundGradient: Array<[string, number?]> // [CSS color string, opacity]
  cloudOpacity: number // Percentage as decimal
  invertUITextColor: boolean
}
