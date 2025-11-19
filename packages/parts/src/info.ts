import SEGMENT_LOOKUP_SOURCE from './segment-lookup.json' with { type: 'json' }
import SPRITE_DEFS from './sprite_defs.json' with { type: 'json' }
import {
  // getSegmentLookup,
  applySegmentInfoOverridesAndRules,
  getSegmentComponentInfo,
  getSegmentSprites,
  COMPONENT_GROUPS,
} from './segment-dict.js'

import type {
  SegmentLookup,
  SegmentDefinition,
  VariantInfo,
  UnknownSegmentDefinition,
  UnknownVariantInfo,
  SliceVariantDetails,
  SpriteDefinition,
} from '@streetmix/types'

// Re-assign to a variable and assign type
// TODO: Use something like zod to help with this
const SEGMENT_LOOKUP: Record<string, SegmentDefinition> =
  createAllSegmentDefinitions(
    SEGMENT_LOOKUP_SOURCE as Record<string, SegmentLookup>
  )

/**
 * Defines the meta-category of each segment, similar to "typechecking"
 * in programming parlance. Segment owners or "types" can be used
 * in visualizations and data to calculate how much space is taken
 * up by different modes or uses.
 */
export const SegmentTypes = {
  NONE: 'none',
  CAR: 'car',
  BIKE: 'bike',
  PEDESTRIAN: 'pedestrian',
  TRANSIT: 'transit',
  NATURE: 'nature',
  FLEX: 'flex',
  UTILITY: 'utility',
}

/**
 * The placeholder object for unknown segments, to be used for rendering
 * in place of bad data, experimental data, missing data, etc.
 *
 * Placeholder objects have a property `unknown` set to `true` so that
 * receivers of this object can tell the difference between a placeholder
 * and normal segment / variant data.
 */
export const SEGMENT_UNKNOWN: UnknownSegmentDefinition = {
  unknown: true,
  id: 'unknown',
  name: 'Unknown',
  owner: 'NONE',
  zIndex: 1,
  variants: [],
  details: {},
}

export const SEGMENT_UNKNOWN_VARIANT: UnknownVariantInfo = {
  unknown: true,
  name: 'Unknown',
  graphics: {
    center: 'missing',
  },
}

function createAllSegmentDefinitions(source: Record<string, SegmentLookup>) {
  const obj: Record<string, SegmentDefinition> = {}
  for (const key in source) {
    obj[key] = createSegmentDefinition([key, source[key]])
  }
  return obj
}

function createSegmentDefinition([key, obj]: [
  key: string,
  obj: SegmentLookup,
]) {
  const segment: SegmentDefinition = {
    id: key,
    ...obj,
  }
  return segment
}

/**
 * Returns all segment data as an array.
 * Object keys are converted to an `id` property for each segment.
 */
export function getAllSegmentInfo() {
  return Object.entries(
    SEGMENT_LOOKUP_SOURCE as Record<string, SegmentLookup>
  ).map(createSegmentDefinition)
}

/**
 * Gets segment data for segment `type`. Safer than reading `type` directly
 * from `SEGMENT_LOOKUP`, because this will return the `SEGMENT_UNKNOWN`
 * placeholder if the type is not found. The unknown segment placeholder
 * allows means bad data, experimental segments, etc. won't break rendering.
 */
export function getSegmentInfo(
  type: string
): SegmentDefinition | UnknownSegmentDefinition {
  return SEGMENT_LOOKUP[type] ?? SEGMENT_UNKNOWN
}

/**
 * Retrieves the necessary information required to map the old segment data
 * model to the new segment data model for the specific segment using the
 * segment's `type` and `variant`.
 */
// NOTE: ported from segment-dict.js so we can more easily assign types to it here
function getSegmentLookup(
  type: string,
  variant: string
): SliceVariantDetails | undefined {
  // Returns `undefined` if not found.
  return getSegmentInfo(type).details?.[variant]
}

/**
 * Maps the old segment data model to the new segment data model and returns
 * the graphic sprites necessary to render the segment as well as any rules
 * to follow, e.g. `minWidth` based on the `type` and `variant`.
 */
export function getSegmentVariantInfo(
  type: string,
  variant: string
): VariantInfo | UnknownVariantInfo {
  const segmentLookup = getSegmentLookup(type, variant)
  const { rules } = getSegmentInfo(type)

  if (segmentLookup?.components === undefined) {
    return SEGMENT_UNKNOWN_VARIANT
  }

  const { components, ...details } = segmentLookup
  const variantInfo = applySegmentInfoOverridesAndRules(details, rules)
  variantInfo.graphics = getSegmentSprites(components)

  // Assuming a segment has one "lane" component, a segment's elevation can be
  // found using the id of the first item in the "lane" component group.
  const lane = getSegmentComponentInfo(
    COMPONENT_GROUPS.LANES,
    components.lanes?.[0].id
  )
  variantInfo.elevation = lane.elevation

  return variantInfo
}

/**
 * Given a string id, returns its sprite definition
 *
 * Alternatively, provide an object containing an `id` property and any number
 * of properties to override the original definition.
 */
export function getSpriteDef(
  sprite: string | SpriteDefinition
): SpriteDefinition {
  let def

  if (typeof sprite === 'object') {
    def = {
      ...SPRITE_DEFS[sprite.id as keyof typeof SPRITE_DEFS],
      ...sprite,
    }
  } else {
    // Clone the original to prevent downstream consumers from accidentally
    // modifying the reference. If there is no original sprite def, return a
    // minimal placeholder object with just its ID.
    def = {
      ...(SPRITE_DEFS[sprite as keyof typeof SPRITE_DEFS] ?? { id: sprite }),
    }
  }

  return def
}
