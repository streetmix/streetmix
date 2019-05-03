import SEGMENT_INFO from './info.json'
import { testSegmentLookup } from './segment-dict.js'

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

  'markings--lane-left': { id: 'markings--lane-left', originY: 96 },
  'markings--lane-right': { id: 'markings--lane-right', originY: 96 },
  'markings--center-lane-left': { id: 'markings--center-lane-left', originY: 96 },
  'markings--center-lane-right': { id: 'markings--center-lane-right', originY: 96 },
  'markings--parking-left': { id: 'markings--parking-left', originY: 96 },
  'markings--parking-right': { id: 'markings--parking-right', originY: 96 },
  'markings--streetcar-track-01': { id: 'markings--streetcar-track-01', originY: 96 }, // lighter (for dark backgrounds)
  'markings--streetcar-track-02': { id: 'markings--streetcar-track-02', originY: 96 }, // darker (for light backgrounds)
  'markings--stripes-diagonal': { id: 'markings--stripes-diagonal', originY: 113 },
  'ground--asphalt': { id: 'ground--asphalt' },
  'ground--asphalt-gray': { id: 'ground--asphalt-gray' },
  'ground--asphalt-green': { id: 'ground--asphalt-green' },
  'ground--asphalt-red': { id: 'ground--asphalt-red' },
  'ground--concrete': { id: 'ground--concrete' },
  'ground--concrete-raised': { id: 'ground--concrete-raised' },

  'parklet--yerba-buena-parklet-left-v02': { id: 'parklet--yerba-buena-parklet-left-v02' },
  'parklet--yerba-buena-parklet-right-v02': { id: 'parklet--yerba-buena-parklet-right-v02' },
  'bikes--bike-rack-parallel-left': { id: 'bikes--bike-rack-parallel-left' },
  'bikes--bike-rack-parallel-right': { id: 'bikes--bike-rack-parallel-right' },
  'bikes--bike-rack-perpendicular-left': { id: 'bikes--bike-rack-perpendicular-left' },
  'bikes--bike-rack-perpendicular-right': { id: 'bikes--bike-rack-perpendicular-right' },
  'furniture--bench-left': { id: 'furniture--bench-left' },
  'furniture--bench-center': { id: 'furniture--bench-center' },
  'furniture--bench-right': { id: 'furniture--bench-right' },
  'wayfinding--nyc-wayfinding-pylon-large': { id: 'wayfinding--nyc-wayfinding-pylon-large' },
  'wayfinding--nyc-wayfinding-pylon-medium': { id: 'wayfinding--nyc-wayfinding-pylon-medium' },
  'wayfinding--nyc-wayfinding-pylon-small': { id: 'wayfinding--nyc-wayfinding-pylon-small' },
  'lamps--lamp-modern-left': { id: 'lamps--lamp-modern-left', offsetX: -248 },
  'lamps--lamp-modern-both': { id: 'lamps--lamp-modern-both' },
  'lamps--lamp-modern-right': { id: 'lamps--lamp-modern-right', offsetX: -248 },
  'lamps--lamp-traditional-right': { id: 'lamps--lamp-traditional-right', offsetX: -36 },
  'lamps--lamp-traditional-center': { id: 'lamps--lamp-traditional-center' },
  'lamps--lamp-traditional-left': { id: 'lamps--lamp-traditional-left', offsetX: -36 },
  'lamps--pride-banner-right': { id: 'lamps--pride-banner-right', offsetX: -60, originY: -423 },
  'lamps--pride-banner-left': { id: 'lamps--pride-banner-left', offsetX: -60, originY: -423 },
  'trees--tree': { id: 'trees--tree' },
  'trees--palm-tree': { id: 'trees--palm-tree' },
  'dividers--planter-box': { id: 'dividers--planter-box' },
  'plants--bush': { id: 'plants--bush' },
  'plants--flowers': { id: 'plants--flowers' },
  'plants--grass': { id: 'plants--grass' },
  'dividers--bollard': { id: 'dividers--bollard' },
  'dividers--dome': { id: 'dividers--dome' },
  'bikes--biker-01-inbound': { id: 'bikes--biker-01-inbound' },
  'bikes--biker-01-outbound': { id: 'bikes--biker-01-outbound' },
  'bikes--biker-02-inbound': { id: 'bikes--biker-02-inbound' },
  'bikes--biker-02-outbound': { id: 'bikes--biker-02-outbound' },
  'vehicles--car-inbound': { id: 'vehicles--car-inbound' },
  'vehicles--car-outbound': { id: 'vehicles--car-outbound' },
  'vehicles--car-inbound-turn-signal-right': { id: 'vehicles--car-inbound-turn-signal-right' }, // left/right flipped on purpose (see relevant issue/discussion about swapping it back)
  'vehicles--car-inbound-turn-signal-left': { id: 'vehicles--car-inbound-turn-signal-left' }, // left/right flipped on purpose (see relevant issue/discussion about swapping it back)
  'vehicles--car-outbound-turn-signal-left': { id: 'vehicles--car-outbound-turn-signal-left' },
  'vehicles--car-outbound-turn-signal-right': { id: 'vehicles--car-outbound-turn-signal-right' },
  'vehicles--car-sideways-left': { id: 'vehicles--car-sideways-left' },
  'vehicles--car-sideways-right': { id: 'vehicles--car-sideways-right' },
  'vehicles--car-angled-front-left': { id: 'vehicles--car-angled-front-left' },
  'vehicles--car-angled-front-right': { id: 'vehicles--car-angled-front-right' },
  'vehicles--car-angled-rear-left': { id: 'vehicles--car-angled-rear-left' },
  'vehicles--car-angled-rear-right': { id: 'vehicles--car-angled-rear-right' },
  'transit--bus-inbound': { id: 'transit--bus-inbound' },
  'transit--bus-outbound': { id: 'transit--bus-outbound' },
  'transit--light-rail-inbound': { id: 'transit--light-rail-inbound' },
  'transit--light-rail-outbound': { id: 'transit--light-rail-outbound' },
  'secret--inception-train': { id: 'secret--inception-train' },
  'transit--streetcar-inbound': { id: 'transit--streetcar-inbound' },
  'transit--streetcar-outbound': { id: 'transit--streetcar-outbound' },
  'vehicles--truck-inbound': { id: 'vehicles--truck-inbound' },
  'vehicles--truck-outbound': { id: 'vehicles--truck-outbound' },
  'transit--transit-shelter-01-left': { id: 'transit--transit-shelter-01-left' },
  'transit--transit-shelter-01-right': { id: 'transit--transit-shelter-01-right' },
  'transit--transit-shelter-02-left': { id: 'transit--transit-shelter-02-left' },
  'transit--transit-shelter-02-right': { id: 'transit--transit-shelter-02-right' },
  'utilities--utility-pole-left': { id: 'utilities--utility-pole-left' },
  'utilities--utility-pole-right': { id: 'utilities--utility-pole-right' },
  'missing': { id: 'missing' },

  'vehicles--taxi-inbound-door-left': { id: 'vehicles--taxi-inbound-door-left' },
  'vehicles--taxi-inbound-door-right': { id: 'vehicles--taxi-inbound-door-right' },
  'vehicles--taxi-outbound-door-left': { id: 'vehicles--taxi-outbound-door-left' },
  'vehicles--taxi-outbound-door-right': { id: 'vehicles--taxi-outbound-door-right' },
  'vehicles--rideshare-inbound-door-left': { id: 'vehicles--rideshare-inbound-door-left' },
  'vehicles--rideshare-inbound-door-right': { id: 'vehicles--rideshare-inbound-door-right' },
  'vehicles--rideshare-outbound-door-left': { id: 'vehicles--rideshare-outbound-door-left' },
  'vehicles--rideshare-outbound-door-right': { id: 'vehicles--rideshare-outbound-door-right' },
  'bikes--bikeshare-left': { id: 'bikes--bikeshare-left' },
  'bikes--bikeshare-right': { id: 'bikes--bikeshare-right' },
  'vehicles--foodtruck-left': { id: 'vehicles--foodtruck-left' },
  'vehicles--foodtruck-right': { id: 'vehicles--foodtruck-right' },

  'curb--pickup-sign-left': { id: 'curb--pickup-sign-left' },
  'curb--pickup-sign-right': { id: 'curb--pickup-sign-right' },
  'curb--person-waiting-01-left': { id: 'curb--person-waiting-01-left' },
  'curb--person-waiting-01-right': { id: 'curb--person-waiting-01-right' },

  'scooters--scooter-inbound': { id: 'scooters--scooter-inbound' },
  'scooters--scooter-outbound': { id: 'scooters--scooter-outbound' },
  'scooters--scooter-left-rider': { id: 'scooters--scooter-left-rider' },
  'scooters--scooter-right-rider': { id: 'scooters--scooter-right-rider' },
  'scooters--scooter-left-docked': { id: 'scooters--scooter-left-docked' },
  'scooters--scooter-right-docked': { id: 'scooters--scooter-right-docked' },

  'people--people-01': { id: 'people--people-01' },
  'people--people-02': { id: 'people--people-02' },
  'people--people-03': { id: 'people--people-03' },
  'people--people-04': { id: 'people--people-04' },
  'people--people-05': { id: 'people--people-05' },
  'people--people-06': { id: 'people--people-06' },
  'people--people-07': { id: 'people--people-07' },
  'people--people-08': { id: 'people--people-08' },
  'people--people-09': { id: 'people--people-09' },
  'people--people-10': { id: 'people--people-10' },
  'people--people-11': { id: 'people--people-11' },
  'people--people-12': { id: 'people--people-12' },
  'people--people-13': { id: 'people--people-13' },
  'people--people-14': { id: 'people--people-14' },
  'people--people-15': { id: 'people--people-15' },
  'people--people-16': { id: 'people--people-16' },
  'people--people-17': { id: 'people--people-17' },
  'people--people-18': { id: 'people--people-18' },
  'people--people-19': { id: 'people--people-19' },
  'people--people-20': { id: 'people--people-20' },
  'people--people-21': { id: 'people--people-21' },
  'people--people-22': { id: 'people--people-22' },
  'people--people-23': { id: 'people--people-23' },
  'people--people-24': { id: 'people--people-24' },
  'people--people-25': { id: 'people--people-25' }, // Scooter
  'people--people-26': { id: 'people--people-26' },
  'people--people-27': { id: 'people--people-27' },
  'people--people-28': { id: 'people--people-28' },
  'people--people-29': { id: 'people--people-29' },
  'people--people-30': { id: 'people--people-30' },
  'people--people-31': { id: 'people--people-31' }
}

/**
 * Returns all segment data.
 *
 * @returns {Object}
 */
export function getAllSegmentInfo () {
  return SEGMENT_INFO
}

/**
 * Returns all segment data as an array.
 * Object keys are converted to an `id` property for each segment.
 *
 * @returns {Object}
 */
export function getAllSegmentInfoArray () {
  return Object.keys(SEGMENT_INFO).map(id => {
    const segment = { ...SEGMENT_INFO[id] }
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
  return SEGMENT_INFO[type] || SEGMENT_UNKNOWN
}

/**
 * Gets variant data for segment `type` and `variant`. Safer than reading
 * `type` directly from `SEGMENT_INFO`, or `variant` from the segment,
 * because this will return a placeholder if the variant is not found.
 *
 * @param {string} type
 * @param {string} variant
 * @returns {Object}
 */
export function getSegmentVariantInfo (type, variant) {
  const segment = getSegmentInfo(type)

  const segmentVariantInfo = (segment && segment.details && segment.details[variant]) || SEGMENT_UNKNOWN_VARIANT

  if (type === 'scooter' && !segmentVariantInfo.unknown) {
    return testSegmentLookup(type, variant, segmentVariantInfo)
  }

  return segmentVariantInfo
}

/**
 * Given a string id, returns its sprite definition
 *
 * Alternatively, provide an object containing an `id` property and any number
 * of properties to override the original definition.
 *
 * @param {string|Object} id
 * @return {Object}
 */
export function getSpriteDef (sprite) {
  let def
  if (typeof sprite === 'object' && sprite.id) {
    def = { ...SPRITE_DEFS[sprite.id], ...sprite }
  } else {
    // Clone the original to prevent downstream consumers from accidentally
    // modifying the reference
    def = { ...SPRITE_DEFS[sprite] }
  }
  return def
}
