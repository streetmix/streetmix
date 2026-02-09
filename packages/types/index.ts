import {
  SETTINGS_UNITS_IMPERIAL,
  SETTINGS_UNITS_METRIC,
} from '@streetmix/client/src/users/constants.js'

import type React from 'react'

// Utility type for making a single property (K) optional
// when a type (T) has defined K as required.
export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

// Utility type for simplifying a complex type into more readable object
// when hovering over it in an editor
// https://www.totaltypescript.com/concepts/the-prettify-helper
export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

export type UnitsSetting =
  | typeof SETTINGS_UNITS_METRIC
  | typeof SETTINGS_UNITS_IMPERIAL

export interface Segment {
  id: string
  type: string
  variantString: string
  width: number
  elevation: number
  // Tracks whether the user has manually modified the elevation value.
  // When true, elevation should not be automatically updated by
  // slice variant presets. A missing property is equivalent to false
  elevationChanged?: boolean
  slope: SlopeProperties
  variant: Record<string, string>
  warnings: boolean[]
  label?: string
}
export type SliceItem = Segment // Alias for future use
export type SliceItemForServerTransmission = Omit<
  SliceItem,
  'variant' | 'warnings'
>

export interface SlopeProperties {
  on: boolean
  values: number[]
}

// Usable for width and height measurements
export interface MeasurementValues {
  metric: number // in meters
  imperial: number // in feet
}

export interface StreetBoundary {
  id: string
  variant: string
  floors: number
  elevation: number
}

export interface GeolocationData {
  countryCode: string
}

// Subset of @types/leaflet's `LatLngExpression` type, which is not
// serializable. Don't use that one.
export interface LatLngObject {
  lat: number
  lng: number
}

export interface StreetLocation {
  latlng: LatLngObject
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

// This should match the object returned by /api/v1/streets
export interface StreetAPIResponse {
  id: string
  namespacedId: number
  name: string | null
  clientUpdatedAt: string // ISO date string
  data: {
    // Or StreetData ?
    street: StreetJson
  }
  createdAt: string // ISO date string
  updatedAt: string // ISO date string
  originalStreetId: string
  creatorId: string | null
  // This is injected by the server in addition to creatorId
  creator: {
    id: string | null
  }
}

export interface StreetJson {
  id: string
  namespacedId: number
  schemaVersion: number
  units: UnitsSetting
  width: number
  segments: SliceItemForServerTransmission[]
  leftBuildingHeight?: number // Deprecated
  rightBuildingHeight?: number // Deprecated
  leftBuildingVariant?: string // Deprecated
  rightBuildingVariant?: string // Deprecated
  boundary: {
    left: StreetBoundary
    right: StreetBoundary
  }
  skybox: string
  weather: WeatherEffect | null
  location: StreetLocation | null
  showAnalytics: boolean
  capacitySource?: string
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
  boundary: {
    left: StreetBoundary
    right: StreetBoundary
  }
  skybox: string
  weather: WeatherEffect | null
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

export type WeatherEffect = 'rain' | 'snow'

export type SlopeConstraints = 'off' | 'path' | 'berm'

export type UnlockCondition = 'SIGN_IN' | 'SUBSCRIBE'

export interface SliceDescription {
  key: string
  image: string
}

export interface SliceVariantComponentDefinition {
  id: string
  variants?: Record<string, string | string[]>
  offsetX?: number
}

// TODO: double check if same or different or can be combined with VariantInfo
export interface SliceVariantDetails {
  name?: string
  nameKey?: string
  rules?: {
    minWidth?: MeasurementValues
    maxWidth?: MeasurementValues
    dangerous?: boolean
    slope?: SlopeConstraints
  }
  defaultWidth?: MeasurementValues
  description?: SliceDescription
  components: {
    lanes?: SliceVariantComponentDefinition[]
    markings?: SliceVariantComponentDefinition[]
    components?: SliceVariantComponentDefinition[]
    effects?: SliceVariantComponentDefinition[]
  }
}

export interface SegmentLookup {
  name: string
  nameKey: string
  owner?: string
  zIndex?: number
  defaultWidth: MeasurementValues
  defaultVariant?: string
  defaultElevation?: number | MeasurementValues
  enableElevation?: boolean
  enableWithFlag?: string
  unlockWithFlag?: string
  unlockCondition?: UnlockCondition
  description?: SliceDescription
  rules?: {
    minWidth?: MeasurementValues
    maxWidth?: MeasurementValues
    slope?: SlopeConstraints
  }
  variants: string[]
  details: Record<string, SliceVariantDetails>
}

export interface SegmentDefinition extends SegmentLookup {
  id: string
}

export interface UnknownSegmentDefinition extends Partial<SegmentDefinition> {
  unknown: true
}

// Subset of / derived from SegmentDefinition
export interface VariantInfo {
  name?: string
  nameKey?: string
  description?: SliceDescription
  defaultWidth?: MeasurementValues
  minWidth?: MeasurementValues
  maxWidth?: MeasurementValues
  dangerous?: boolean
  slope?: SlopeConstraints
  elevation: number | MeasurementValues
  graphics: VariantGraphics
  offsetY?: number
}

// graphics definitions are allowed to be a string, a SpriteDefinition
// object, or an array containing those. they should all eventually be
// normalized to StringDefinition[]
export type VariantGraphicsDefinition =
  | string
  | SpriteDefinition
  | (string | SpriteDefinition)[]

export interface VariantGraphics {
  ground?: VariantGraphicsDefinition
  left?: VariantGraphicsDefinition
  right?: VariantGraphicsDefinition
  center?: VariantGraphicsDefinition
  repeat?: VariantGraphicsDefinition
  // `pool` and `sprites` are mutually exclusive
  scatter?: (
    | {
        pool: string
        sprites: never
      }
    | {
        sprites: (string | SpriteDefinition)[]
        pool: never
      }
  ) & {
    minSpacing: number
    maxSpacing: number
    padding: number
  }
  quirks?: {
    minWidth: number
  }
}

export interface UnknownVariantInfo extends Pick<
  VariantInfo,
  'name' | 'graphics'
> {
  unknown: true
}

export interface VariantInfoDimensions {
  left: number
  right: number
  center: number
}

export type CapacitySegments = Record<string, CapacitySegmentDefinition>

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
  typical_lane_width: MeasurementValues
  segments: CapacitySegments
}

export type CapacitySourceData = Record<
  string,
  CapacitySourceDefinition | CapacityBaseDefinition
>
export type CapacityData = Record<string, CapacitySourceDefinition>

export interface CapacitySegmentDefinition {
  minimum?: number
  average?: number
  potential?: number
  variants?: CapacitySegments
  inherits?: string // TODO: if present, excludes minimum/average/potential/variants
}

export type CapacityForDisplay = Required<
  Pick<CapacitySegmentDefinition, 'average' | 'potential'>
>

export type CSSGradientStop = string | [string, number?] // [CSS color string, opacity]
export type CSSGradientDeclaration = CSSGradientStop[]

export interface SkyboxObject {
  image: string // Illustration asset ID
  width: number // in pixels
  height: number // in pixels
  top: number // Percentage as decimal
  left: number // Percentage as decimal
}

export interface SkyboxDefinition {
  name: string
  enabled?: boolean
  iconImage?: string // Illustration asset ID
  backgroundColor?: string // CSS color string
  backgroundImage?: string // Illustration asset ID
  backgroundGradient?: CSSGradientDeclaration
  backgroundObjects?: SkyboxObject[]
  foregroundGradient?: CSSGradientDeclaration
  cloudOpacity?: number // Percentage as decimal
  invertUITextColor?: boolean
}

export interface SkyboxDefWithStyles extends SkyboxDefinition {
  id: string
  style: React.CSSProperties
  iconStyle: React.CSSProperties
}

export interface SpriteDefinition {
  id: string
  offsetX?: number | `${string}%`
  offsetY?: number | `${string}%`
  originY?: number
}

export type SectionType = 'boundary' | 'slice'
export type BoundaryPosition = 'left' | 'right'
export type SectionElementTypeAndPosition =
  | { readonly type: Extract<SectionType, 'slice'>; readonly position: number }
  | {
      readonly type: Extract<SectionType, 'boundary'>
      readonly position: BoundaryPosition
    }

interface BoundaryDefinitionBase {
  id: string
  label: string
  spriteId: string
  hasFloors: boolean
  sameOnBothSides?: boolean
  repeatHalf?: boolean
  alignAtBaseline?: boolean
  offsetY?: number
  variantsCount?: number
  overhangWidth?: number
  earthColor?: string // should be a valid CSS color string
}

// If boundary definition has floors, the following properties are
// required to also be present
interface BoundaryDefinitionWithFloors extends BoundaryDefinitionBase {
  hasFloors: true
  floorHeight: number
  roofHeight: number
  mainFloorHeight: number
}

export type BoundaryDefinition =
  | BoundaryDefinitionBase
  | BoundaryDefinitionWithFloors
