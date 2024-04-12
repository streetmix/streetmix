import type {
  SETTINGS_UNITS_IMPERIAL,
  SETTINGS_UNITS_METRIC
} from '@streetmix/client/src/users/constants'

export interface Segment {
  id: string
  type: string
  variantString: string
  width: number
  elevation: number
  variant: Record<string, string>
  warnings: Array<boolean | null>
}

export interface StreetJson {
  id: string
  namespacedId: number
  schemaVersion: number
  units: UnitsSetting
  width: number
  segments: Segment[]
  leftBuildingHeight: number
  rightBuildingHeight: number
  leftBuildingVariant: string
  rightBuildingVariant: string
  skybox: string
  location: StreetLocation | null
  showAnalytics: boolean
  userUpdated: boolean
  editCount: number
}

// Properties added to StreetJson by client
export interface StreetJsonExtra extends StreetJson {
  occupiedWidth: number
  remainingWidth: number
}

export interface StreetData {
  street: StreetJson
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
  hierarchy: {
    country?: string
    locality?: string
    neighbourhood?: string
    region?: string
    street?: string
  }
}

// TODO: many of these values were "optional" but it might be worthwhile to
// convert most of them to values that cannot be "undefined" to make it easier
// to work with as more TypeScript is adopted.
// ALSO: This is a "flattened" data format compared to what's returned from
// server, and this is confusing, so we should standardize state to reflect
// server payload, if possible!
export interface StreetState extends StreetJsonExtra {
  id: string // UUID
  namespacedId: number
  schemaVersion: number
  units: UnitsSetting
  width: number
  name: string | null
  segments: Segment[]
  leftBuildingHeight: number
  rightBuildingHeight: number
  leftBuildingVariant: string
  rightBuildingVariant: string
  skybox: string
  location: StreetLocation | null
  showAnalytics: boolean
  capacitySource?: string
  remainingWidth: number
  creatorId: string | null
  originalStreetId?: string | null // UUID, if set
  updatedAt?: string // Datetime string
  clientUpdatedAt?: string // Datetime string
  userUpdated: boolean
  editCount: number
  immediateRemoval: boolean
}

export interface LatLngObject {
  lat: number
  lng: number
}

// TODO: May be incomplete. Update with segment-lookup.json values
export interface SegmentDefinition {
  id: string
  name: string
  nameKey: string
  owner: string
  zIndex: number
  defaultWidth: WidthDefinition
  defaultVariant: string
  defaultElevation?: number
  enableElevation?: boolean
  enableWithFlag?: string
  unlockWithFlag?: string
  unlockCondition?: string
  description?: {
    key: string
    image: string
  }
  rules?: {
    minWidth?: WidthDefinition
    maxWidth?: WidthDefinition
  }
  variants: string[]
  details: object
}

export interface WidthDefinition {
  metric: number // in meters
  imperial: number // in feet
}

export type UnitsSetting =
  | typeof SETTINGS_UNITS_METRIC
  | typeof SETTINGS_UNITS_IMPERIAL

export type LocaleLevel = 1 | 2 | 3 | 4

export interface LocaleDefinition {
  label: string
  name: string
  value: string
  key: string
  level: LocaleLevel
}

export interface VariantInfoDimensions {
  left: number
  right: number
  center: number
}

export type CapacitySourceData = Record<
string,
CapacitySourceDefinition | CapacityBaseDefinition
>
export type CapacityData = Record<string, CapacitySourceDefinition>

export interface CapacityBaseDefinition {
  id: string
  __comment?: string
  segments: CapacitySegments
}

export interface CapacitySourceDefinition {
  id: string
  source_title: string
  source_author: string
  source_url?: string // URL
  typical_lane_width: WidthDefinition
  segments: CapacitySegments
}

export type CapacitySegments = Record<string, CapacitySegmentDefinition>

export interface CapacitySegmentDefinition {
  minimum?: number
  average?: number
  potential?: number
  variants?: CapacitySegments
  inherits?: string // TODO: if present, excludes minimum/average/potential/variants
}
