import SEGMENT_LOOKUP from './segment-lookup.json'
import {
  getSegmentLookup,
  applySegmentInfoOverridesAndRules,
  getSegmentComponentInfo,
  getSegmentSprites,
  COMPONENT_GROUPS
} from './segment-dict'

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
  FLEX: 'flex'
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
 * SPRITE_DEFS will be deprecated!
 *
 * These definitions used to hold all the rendering information for each sprite (e.g. width/height.)
 * Properties that are intrinsic to the sprite, like dimensions, are now determined and cached when
 * the sprite loads (because can read that directly from the sprite, as opposed to the way we used to
 * need to define it because the sprites were laid out on a tilesheet).
 *
 * Currently the only remaining SPRITE_DEFS include originY and originX values which define a
 * custom origin point in case it's not the default values. TODO: figure out another way to do
 * this.
 */
const SPRITE_DEFS = {
  'markings--straight-inbound-light': { id: 'markings--straight-inbound-light', originY: 96 }, // translucent version of arrow
  'markings--straight-outbound-light': { id: 'markings--straight-outbound-light', originY: 96 },
  'markings--straight-inbound': { id: 'markings--straight-inbound', originY: 96 },
  'markings--straight-outbound': { id: 'markings--straight-outbound', originY: 96 },
  'markings--left-inbound': { id: 'markings--left-inbound', originY: 96 },
  'markings--left-outbound': { id: 'markings--left-outbound', originY: 96 },
  'markings--left-straight-inbound': { id: 'markings--left-straight-inbound', originY: 96 },
  'markings--left-straight-outbound': { id: 'markings--left-straight-outbound', originY: 96 },
  'markings--right-inbound': { id: 'markings--right-inbound', originY: 96 },
  'markings--right-outbound': { id: 'markings--right-outbound', originY: 96 },
  'markings--right-straight-inbound': { id: 'markings--right-straight-inbound', originY: 96 },
  'markings--right-straight-outbound': { id: 'markings--right-straight-outbound', originY: 96 },
  'markings--both-inbound': { id: 'markings--both-inbound', originY: 96 },
  'markings--both-outbound': { id: 'markings--both-outbound', originY: 96 },
  'markings--shared-inbound': { id: 'markings--shared-inbound', originY: 96 },
  'markings--shared-outbound': { id: 'markings--shared-outbound', originY: 96 },
  'markings--sharrow-inbound': { id: 'markings--sharrow-inbound', originY: 96 },
  'markings--sharrow-outbound': { id: 'markings--sharrow-outbound', originY: 96 },

  'markings--lane-left': { id: 'markings--lane-left', originY: 102 },
  'markings--lane-right': { id: 'markings--lane-right', originY: 102 },
  'markings--lane-left-half': { id: 'markings--lane-left-half', originY: 102 },
  'markings--lane-right-half': { id: 'markings--lane-right-half', originY: 102 },
  'markings--lane-horiz': { id: 'markings--lane-horiz', originY: 102 },
  'markings--center-lane-left': { id: 'markings--center-lane-left', originY: 102 },
  'markings--center-lane-right': { id: 'markings--center-lane-right', originY: 102 },
  'markings--parking-left': { id: 'markings--parking-left', originY: 96 },
  'markings--parking-right': { id: 'markings--parking-right', originY: 96 },
  'markings--streetcar-track-01': { id: 'markings--streetcar-track-01', originY: 96 }, // lighter (for dark backgrounds)
  'markings--streetcar-track-02': { id: 'markings--streetcar-track-02', originY: 96 }, // darker (for light backgrounds)
  'markings--stripes-diagonal': { id: 'markings--stripes-diagonal', originY: 113 },

  'lamps--lamp-modern-left': { id: 'lamps--lamp-modern-left', offsetX: -248 },
  'lamps--lamp-modern-both': { id: 'lamps--lamp-modern-both' },
  'lamps--lamp-modern-right': { id: 'lamps--lamp-modern-right', offsetX: -248 },
  'lamps--lamp-traditional-right': { id: 'lamps--lamp-traditional-right', offsetX: -36 },
  'lamps--lamp-traditional-center': { id: 'lamps--lamp-traditional-center' },
  'lamps--lamp-traditional-left': { id: 'lamps--lamp-traditional-left', offsetX: -36 },
  'lamps--pride-banner-right': { id: 'lamps--pride-banner-right', offsetX: -60, originY: -423 },
  'lamps--pride-banner-left': { id: 'lamps--pride-banner-left', offsetX: -60, originY: -423 },

  'missing': { id: 'missing' },

  'people--people-01': { id: 'people--people-01', originY: 10 },
  'people--people-02': { id: 'people--people-02', originY: 10 },
  'people--people-03': { id: 'people--people-03', originY: 10 },
  'people--people-04': { id: 'people--people-04', originY: 10 },
  'people--people-05': { id: 'people--people-05', originY: 10 },
  'people--people-06': { id: 'people--people-06', originY: 10 },
  'people--people-07': { id: 'people--people-07', originY: 10 },
  'people--people-08': { id: 'people--people-08', originY: 10 },
  'people--people-09': { id: 'people--people-09', originY: 10 },
  'people--people-10': { id: 'people--people-10', originY: 10 },
  'people--people-11': { id: 'people--people-11', originY: 10 },
  'people--people-12': { id: 'people--people-12', originY: 10 },
  'people--people-13': { id: 'people--people-13', originY: 10 },
  'people--people-14': { id: 'people--people-14', originY: 10 },
  'people--people-15': { id: 'people--people-15', originY: 10 },
  'people--people-16': { id: 'people--people-16', originY: 10 },
  'people--people-17': { id: 'people--people-17', originY: 10 },
  'people--people-18': { id: 'people--people-18', originY: 10 },
  'people--people-19': { id: 'people--people-19', originY: 10 },
  'people--people-20': { id: 'people--people-20', originY: 10 },
  'people--people-21': { id: 'people--people-21', originY: 10 },
  'people--people-22': { id: 'people--people-22', originY: 10 },
  'people--people-23': { id: 'people--people-23', originY: 10 },
  'people--people-24': { id: 'people--people-24', originY: 10 },
  'people--people-25': { id: 'people--people-25', originY: 10 }, // Scooter
  'people--people-26': { id: 'people--people-26', originY: 10 },
  'people--people-27': { id: 'people--people-27', originY: 10 },
  'people--people-28': { id: 'people--people-28', originY: 10 },
  'people--people-29': { id: 'people--people-29', originY: 10 },
  'people--people-30': { id: 'people--people-30', originY: 10 },
  'people--people-31': { id: 'people--people-31', originY: 10 }
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
 * @returns {Object}
 */
export function getAllSegmentInfoArray () {
  return Object.keys(SEGMENT_LOOKUP).map(id => {
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
 * @returns {Object}
 */
export function getSegmentInfo (type) {
  return SEGMENT_LOOKUP[type] || SEGMENT_UNKNOWN
}

/**
 * Maps the old segment data model to the new segment data model and returns the graphic sprites necessary
 * to draw the segment as well as any rules to follow, e.g. `minWidth` based on the `type` and `variant`.
 *
 * @param {string} type
 * @param {string} variant
 * @returns {object} variantInfo - returns an object in the shape of { graphics, ...rules }
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
  const lane = getSegmentComponentInfo(COMPONENT_GROUPS.LANES, components.lanes[0].id)
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
