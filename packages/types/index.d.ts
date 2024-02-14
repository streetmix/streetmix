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
  units: number
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

export type UnitsSetting =
  | typeof SETTINGS_UNITS_METRIC
  | typeof SETTINGS_UNITS_IMPERIAL
