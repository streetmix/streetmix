import SEGMENT_LOOKUP from './segment-lookup.json'
import {
  getSegmentLookup,
  applySegmentInfoOverridesAndRules,
  getSegmentComponentInfo,
  getSegmentSprites,
  COMPONENT_GROUPS
} from './segment-dict'
import SPRITE_DEFS from './sprite-defs.json'

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
  UTILITY: 'utility'
}

/**
 * The placeholder object for unknown segments, to be used for rendering
 * in place of bad data, experimental data, missing data, etc.
 *
 * Placeholder objects have a property `unknown` set to `true` so that
 * receivers of this object can tell the difference between a placeholder
 * and normal segment / variant data.
 */
export const SEGMENT_UNKNOWN = {
  unknown: true,
  name: 'Unknown',
  owner: 'NONE',
  zIndex: 1,
  variants: [],
  details: {}
}

export const SEGMENT_UNKNOWN_VARIANT = {
  unknown: true,
  name: 'Unknown',
  graphics: {
    center: 'missing'
  }
}

/**
 * Returns all segment data.
 *
 * @returns {Object}
 */
export function getAllSegmentInfo () {
  return SEGMENT_LOOKUP
}

/**
 * Returns all segment data as an array.
 * Object keys are converted to an `id` property for each segment.
 *
 * @returns {SegmentDefinition[]}
 */
export function getAllSegmentInfoArray () {
  return Object.keys(SEGMENT_LOOKUP).map((id) => {
    const segment = { ...SEGMENT_LOOKUP[id] }
    segment.id = id
    return segment
  })
}

/**
 * Gets segment data for segment `type`. Safer than reading `type` directly
 * from `SEGMENT_INFO`, because this will return the `SEGMENT_UNKNOWN`
 * placeholder if the type is not found. The unknown segment placeholder
 * allows means bad data, experimental segments, etc. won't break rendering.
 *
 * @param {string} type
 * @returns {SegmentDefinition}
 */
export function getSegmentInfo (type) {
  return SEGMENT_LOOKUP[type] || SEGMENT_UNKNOWN
}

/**
 * Maps the old segment data model to the new segment data model and returns
 * the graphic sprites necessary to render the segment as well as any rules
 * to follow, e.g. `minWidth` based on the `type` and `variant`.
 *
 * @param {string} type
 * @param {string} variant
 * @returns {SegmentDefinition} variantInfo - returns an object in the shape of { graphics, ...rules }
 */
export function getSegmentVariantInfo (type, variant) {
  const segmentLookup = getSegmentLookup(type, variant)
  const { rules } = getSegmentInfo(type)

  if (!segmentLookup || !segmentLookup.components) {
    return SEGMENT_UNKNOWN_VARIANT
  }

  const { components, ...details } = segmentLookup
  const variantInfo = applySegmentInfoOverridesAndRules(details, rules)
  variantInfo.graphics = getSegmentSprites(components)

  // Assuming a segment has one "lane" component, a segment's elevation can be found using the id
  // of the first item in the "lane" component group.
  const lane = getSegmentComponentInfo(
    COMPONENT_GROUPS.LANES,
    components.lanes[0].id
  )
  variantInfo.elevation = lane.elevation

  return variantInfo
}

/**
 * Given a string id, returns its sprite definition
 *
 * Alternatively, provide an object containing an `id` property and any number
 * of properties to override the original definition.
 *
 * If the sprite is NOT defined in SPRITE_DEFS (which we increasingly no longer
 * need to do because of changes in our segment / component definition structure),
 * return a minimal placeholder object.
 *
 * @param {string|Object} id
 * @return {Object}
 */
export function getSpriteDef (sprite) {
  let def
  if (typeof sprite === 'object' && sprite.id) {
    def = { ...(SPRITE_DEFS[sprite.id] || { id: sprite.id }), ...sprite }
  } else {
    // Clone the original to prevent downstream consumers from accidentally
    // modifying the reference
    def = { ...(SPRITE_DEFS[sprite] || { id: sprite }) }
  }
  return def
}
