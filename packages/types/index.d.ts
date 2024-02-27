import type {
  SETTINGS_UNITS_IMPERIAL,
  SETTINGS_UNITS_METRIC
} from '../../assets/scripts/users/constants'

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
  schemaVersion: number
  showAnalytics: boolean
  width: number
  id: string
  namespacedId: number
  units: UnitsSetting
  location: StreetLocation | null
  userUpdated: boolean
  skybox: string
  leftBuildingHeight: number
  rightBuildingHeight: number
  leftBuildingVariant: string
  rightBuildingVariant: string
  segments: Segment[]
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
  defaultWidth: number
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
    minWidth?: number
  }
  variants: string[]
  details: object
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
