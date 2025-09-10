import type {
  SETTINGS_UNITS_IMPERIAL,
  SETTINGS_UNITS_METRIC
} from '@streetmix/client/src/users/constants'

// Utility type for making a single property (K) optional
// when a type (T) has defined K as required.
export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

export type UnitsSetting =
  | typeof SETTINGS_UNITS_METRIC
  | typeof SETTINGS_UNITS_IMPERIAL

export interface Segment {
  id: string
  type: string
  variantString: string
  width: number
  elevation: number
  slope?: boolean
  variant: Record<string, string>
  warnings: boolean[]
  label?: string
}
export type SliceItem = Segment // Alias for future use

// Usable for width and height measurements
export interface MeasurementDefinition {
  metric: number // in meters
  imperial: number // in feet
}

// Alias for existing usage in widths
export type WidthDefinition = MeasurementDefinition

export interface SliceItemTemplate {
  type: string
  variant: Record<string, string>
  width: WidthDefinition | number
  elevation?: number
  label?: string
}

export interface StreetBoundary {
  id: string
  variant: string
  floors: number
  elevation: number
}

// Subset of @types/leaflet's `LatLngExpression` type, which is not
// serializable. Don't use that one.
export interface LatLngObject {
  lat: number
  lng: number
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

export interface StreetTemplate {
  width: number
  boundary: {
    left: StreetBoundary
    right: StreetBoundary
  }
  slices: SliceItemTemplate[]
}

export interface StreetJson {
  id: string
  namespacedId: number
  schemaVersion: number
  units: UnitsSetting
  width: number
  segments: Segment[]
  leftBuildingHeight?: number // Deprecated
  rightBuildingHeight?: number // Deprecated
  leftBuildingVariant?: string // Deprecated
  rightBuildingVariant?: string // Deprecated
  boundary: {
    left: StreetBoundary
    right: StreetBoundary
  }
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
  name: string | null
  clientUpdatedAt: string // ISO date string
  data: StreetData
  createdAt: string // ISO date string
  updatedAt: string // ISO date string
  originalStreetId: string
  creatorId: string | null
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
    minWidth?: WidthDefinition
    maxWidth?: WidthDefinition
    dangerous?: boolean
  }
  defaultWidth?: WidthDefinition
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
  defaultWidth: WidthDefinition
  defaultVariant?: string
  defaultElevation?: number | MeasurementDefinition
  enableElevation?: boolean
  enableWithFlag?: string
  unlockWithFlag?: string
  unlockCondition?: UnlockCondition
  description?: SliceDescription
  rules?: {
    minWidth?: WidthDefinition
    maxWidth?: WidthDefinition
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
  defaultWidth?: WidthDefinition
  minWidth?: WidthDefinition
  maxWidth?: WidthDefinition
  elevation: number | MeasurementDefinition
  graphics: Record<string, unknown> // TODO
}

export interface UnknownVariantInfo extends Partial<VariantInfo> {
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
  typical_lane_width: WidthDefinition
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

export interface StreetImageOptions {
  locale: string
  transparentSky: boolean
  elementLabels: boolean // formerly 'segmentLabels'
  streetName: boolean
  watermark: boolean
  scale: number // formerly `dpi`
}

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
  offsetX?: number
  originY?: number
}

export type SectionType = 'boundary' | 'slice'
export type BoundaryPosition = 'left' | 'right'
export type SectionElementTypeAndPosition =
  | { type: Extract<SectionType, 'slice'>; position: number }
  | { type: Extract<SectionType, 'boundary'>; position: BoundaryPosition }

interface BoundaryDefinitionBase {
  id: string
  label: string
  spriteId: string
  hasFloors: false
  sameOnBothSides?: boolean
  repeatHalf?: boolean
  alignAtBaseline?: boolean
  variantsCount?: number
  overhangWidth?: number
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
