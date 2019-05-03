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
  'markings--straight-inbound-light': { id: 'markings--straight-inbound-light', offsetY: 11.12 }, // translucent version of arrow
  'markings--straight-outbound-light': { id: 'markings--straight-outbound-light', offsetY: 11.12 },
  'markings--straight-inbound': { id: 'markings--straight-inbound', offsetY: 11.12 },
  'markings--straight-outbound': { id: 'markings--straight-outbound', offsetY: 11.12 },
  'markings--left-inbound': { id: 'markings--left-inbound', offsetY: 11.12 },
  'markings--left-outbound': { id: 'markings--left-outbound', offsetY: 11.12 },
  'markings--left-straight-inbound': { id: 'markings--left-straight-inbound', offsetY: 11.12 },
  'markings--left-straight-outbound': { id: 'markings--left-straight-outbound', offsetY: 11.12 },
  'markings--right-inbound': { id: 'markings--right-inbound', offsetY: 11.12 },
  'markings--right-outbound': { id: 'markings--right-outbound', offsetY: 11.12 },
  'markings--right-straight-inbound': { id: 'markings--right-straight-inbound', offsetY: 11.12 },
  'markings--right-straight-outbound': { id: 'markings--right-straight-outbound', offsetY: 11.12 },
  'markings--both-inbound': { id: 'markings--both-inbound', offsetY: 11.12 },
  'markings--both-outbound': { id: 'markings--both-outbound', offsetY: 11.12 },
  'markings--shared-inbound': { id: 'markings--shared-inbound', offsetY: 11.12 },
  'markings--shared-outbound': { id: 'markings--shared-outbound', offsetY: 11.12 },
  'markings--sharrow-inbound': { id: 'markings--sharrow-inbound', offsetY: 11.12 },
  'markings--sharrow-outbound': { id: 'markings--sharrow-outbound', offsetY: 11.12 },

  'markings--lane-left': { id: 'markings--lane-left', offsetY: 11.28 },
  'markings--lane-right': { id: 'markings--lane-right', offsetY: 11.28 },
  'markings--center-lane-left': { id: 'markings--center-lane-left', offsetY: 11.28 },
  'markings--center-lane-right': { id: 'markings--center-lane-right', offsetY: 11.28 },
  'markings--parking-left': { id: 'markings--parking-left', offsetY: 11.28 },
  'markings--parking-right': { id: 'markings--parking-right', offsetY: 11.28 },
  'markings--streetcar-track-01': { id: 'markings--streetcar-track-01', offsetY: 11.28 }, // lighter (for dark backgrounds)
  'markings--streetcar-track-02': { id: 'markings--streetcar-track-02', offsetY: 11.28 }, // darker (for light backgrounds)
  'markings--stripes-diagonal': { id: 'markings--stripes-diagonal', offsetY: 11.28 },
  'ground--asphalt': { id: 'ground--asphalt', offsetY: 11.25 },
  'ground--asphalt-gray': { id: 'ground--asphalt-gray', offsetY: 11.25 },
  'ground--asphalt-green': { id: 'ground--asphalt-green', offsetY: 11.25 },
  'ground--asphalt-red': { id: 'ground--asphalt-red', offsetY: 11.25 },
  'ground--concrete': { id: 'ground--concrete', offsetY: 10.65 },
  'ground--concrete-raised': { id: 'ground--concrete-raised', offsetY: 6 + 2.2 },

  'parklet--yerba-buena-parklet-left-v02': { id: 'parklet--yerba-buena-parklet-left-v02', offsetY: 3.4 },
  'parklet--yerba-buena-parklet-right-v02': { id: 'parklet--yerba-buena-parklet-right-v02', offsetY: 3.4 },
  'bikes--bike-rack-parallel-left': { id: 'bikes--bike-rack-parallel-left', offsetY: 4.75 },
  'bikes--bike-rack-parallel-right': { id: 'bikes--bike-rack-parallel-right', offsetY: 4.75 },
  'bikes--bike-rack-perpendicular-left': { id: 'bikes--bike-rack-perpendicular-left', offsetY: 4.75 },
  'bikes--bike-rack-perpendicular-right': { id: 'bikes--bike-rack-perpendicular-right', offsetY: 4.75 },
  'furniture--bench-left': { id: 'furniture--bench-left', offsetY: 4.75 },
  'furniture--bench-center': { id: 'furniture--bench-center', offsetY: 4.75 },
  'furniture--bench-right': { id: 'furniture--bench-right', offsetY: 4.75 },
  'wayfinding--nyc-wayfinding-pylon-large': { id: 'wayfinding--nyc-wayfinding-pylon-large', offsetY: -0.3 },
  'wayfinding--nyc-wayfinding-pylon-medium': { id: 'wayfinding--nyc-wayfinding-pylon-medium', offsetY: -0.3 },
  'wayfinding--nyc-wayfinding-pylon-small': { id: 'wayfinding--nyc-wayfinding-pylon-small', offsetY: -0.3 },
  'lamps--lamp-modern-left': { id: 'lamps--lamp-modern-left', offsetX: -248, offsetY: -20.25 },
  'lamps--lamp-modern-both': { id: 'lamps--lamp-modern-both', offsetY: -20.25 },
  'lamps--lamp-modern-right': { id: 'lamps--lamp-modern-right', offsetX: -248, offsetY: -20.25 },
  'lamps--lamp-traditional-right': { id: 'lamps--lamp-traditional-right', offsetX: -36, offsetY: -4.25 },
  'lamps--lamp-traditional-center': { id: 'lamps--lamp-traditional-center', offsetY: -4.25 },
  'lamps--lamp-traditional-left': { id: 'lamps--lamp-traditional-left', offsetX: -36, offsetY: -4.25 },
  'lamps--pride-banner-right': { id: 'lamps--pride-banner-right', offsetX: -60, offsetY: -13 },
  'lamps--pride-banner-left': { id: 'lamps--pride-banner-left', offsetX: -60, offsetY: -13 },
  'trees--tree': { id: 'trees--tree', offsetY: -10.3 },
  'trees--palm-tree': { id: 'trees--palm-tree', offsetY: -20.25 },
  'dividers--planter-box': { id: 'dividers--planter-box', offsetY: 4.25 },
  'plants--bush': { id: 'plants--bush', offsetY: 5.7 },
  'plants--flowers': { id: 'plants--flowers', offsetY: 5.5 },
  'plants--grass': { id: 'plants--grass', offsetY: 9.7 },
  'dividers--bollard': { id: 'dividers--bollard', offsetY: 4.25 },
  'dividers--dome': { id: 'dividers--dome', offsetY: 4.25 },
  'bikes--biker-01-inbound': { id: 'bikes--biker-01-inbound', offsetY: 3.28 },
  'bikes--biker-01-outbound': { id: 'bikes--biker-01-outbound', offsetY: 3.28 },
  'bikes--biker-02-inbound': { id: 'bikes--biker-02-inbound', offsetY: 3.28 },
  'bikes--biker-02-outbound': { id: 'bikes--biker-02-outbound', offsetY: 3.28 },
  'vehicles--car-inbound': { id: 'vehicles--car-inbound', offsetY: -3.7 },
  'vehicles--car-outbound': { id: 'vehicles--car-outbound', offsetY: -3.7 },
  'vehicles--car-inbound-turn-signal-right': { id: 'vehicles--car-inbound-turn-signal-right', offsetY: -3.7 }, // left/right flipped on purpose (see relevant issue/discussion about swapping it back)
  'vehicles--car-inbound-turn-signal-left': { id: 'vehicles--car-inbound-turn-signal-left', offsetY: -3.7 }, // left/right flipped on purpose (see relevant issue/discussion about swapping it back)
  'vehicles--car-outbound-turn-signal-left': { id: 'vehicles--car-outbound-turn-signal-left', offsetY: -3.7 },
  'vehicles--car-outbound-turn-signal-right': { id: 'vehicles--car-outbound-turn-signal-right', offsetY: -3.7 },
  'vehicles--car-sideways-left': { id: 'vehicles--car-sideways-left', offsetY: 5.35 },
  'vehicles--car-sideways-right': { id: 'vehicles--car-sideways-right', offsetY: 5.35 },
  'vehicles--car-angled-front-left': { id: 'vehicles--car-angled-front-left', offsetY: 5.35 },
  'vehicles--car-angled-front-right': { id: 'vehicles--car-angled-front-right', offsetY: 5.35 },
  'vehicles--car-angled-rear-left': { id: 'vehicles--car-angled-rear-left', offsetY: 5.35 },
  'vehicles--car-angled-rear-right': { id: 'vehicles--car-angled-rear-right', offsetY: 5.35 },
  'transit--bus-inbound': { id: 'transit--bus-inbound', offsetY: 0.35 },
  'transit--bus-outbound': { id: 'transit--bus-outbound', offsetY: 0.35 },
  'transit--light-rail-inbound': { id: 'transit--light-rail-inbound', offsetY: -5.75 },
  'transit--light-rail-outbound': { id: 'transit--light-rail-outbound', offsetY: -5.75 },
  'secret--inception-train': { id: 'secret--inception-train', offsetY: -4.7 },
  'transit--streetcar-inbound': { id: 'transit--streetcar-inbound', offsetY: -6.75 },
  'transit--streetcar-outbound': { id: 'transit--streetcar-outbound', offsetY: -6.75 },
  'vehicles--truck-inbound': { id: 'vehicles--truck-inbound', offsetY: -0.75 },
  'vehicles--truck-outbound': { id: 'vehicles--truck-outbound', offsetY: -0.75 },
  'transit--transit-shelter-01-left': { id: 'transit--transit-shelter-01-left', offsetY: -1.3 },
  'transit--transit-shelter-01-right': { id: 'transit--transit-shelter-01-right', offsetY: -1.3 },
  'transit--transit-shelter-02-left': { id: 'transit--transit-shelter-02-left', offsetY: -3.8 },
  'transit--transit-shelter-02-right': { id: 'transit--transit-shelter-02-right', offsetY: -3.8 },
  'utilities--utility-pole-left': { id: 'utilities--utility-pole-left', offsetY: -20.25 },
  'utilities--utility-pole-right': { id: 'utilities--utility-pole-right', offsetY: -20.25 },
  'missing': { id: 'missing', offsetY: 10.5 },

  'vehicles--taxi-inbound-door-left': { id: 'vehicles--taxi-inbound-door-left', offsetY: -3.7 },
  'vehicles--taxi-inbound-door-right': { id: 'vehicles--taxi-inbound-door-right', offsetY: -3.7 },
  'vehicles--taxi-outbound-door-left': { id: 'vehicles--taxi-outbound-door-left', offsetY: -3.7 },
  'vehicles--taxi-outbound-door-right': { id: 'vehicles--taxi-outbound-door-right', offsetY: -3.7 },
  'vehicles--rideshare-inbound-door-left': { id: 'vehicles--rideshare-inbound-door-left', offsetY: -3.7 },
  'vehicles--rideshare-inbound-door-right': { id: 'vehicles--rideshare-inbound-door-right', offsetY: -3.7 },
  'vehicles--rideshare-outbound-door-left': { id: 'vehicles--rideshare-outbound-door-left', offsetY: -3.7 },
  'vehicles--rideshare-outbound-door-right': { id: 'vehicles--rideshare-outbound-door-right', offsetY: -3.7 },
  'bikes--bikeshare-left': { id: 'bikes--bikeshare-left', offsetY: 4.25 },
  'bikes--bikeshare-right': { id: 'bikes--bikeshare-right', offsetY: 4.25 },
  'vehicles--foodtruck-left': { id: 'vehicles--foodtruck-left', offsetY: -3.7 },
  'vehicles--foodtruck-right': { id: 'vehicles--foodtruck-right', offsetY: -3.7 },

  'curb--pickup-sign-left': { id: 'curb--pickup-sign-left', offsetY: -4.3 },
  'curb--pickup-sign-right': { id: 'curb--pickup-sign-right', offsetY: -4.3 },
  'curb--person-waiting-01-left': { id: 'curb--person-waiting-01-left', offsetY: -4.3 },
  'curb--person-waiting-01-right': { id: 'curb--person-waiting-01-right', offsetY: -4.3 },

  'scooters--scooter-inbound': { id: 'scooters--scooter-inbound', offsetY: 3.28 },
  'scooters--scooter-outbound': { id: 'scooters--scooter-outbound', offsetY: 3.28 },
  'scooters--scooter-left-rider': { id: 'scooters--scooter-left-rider', offsetY: 3.28 },
  'scooters--scooter-right-rider': { id: 'scooters--scooter-right-rider', offsetY: 3.28 },
  'scooters--scooter-left-docked': { id: 'scooters--scooter-left-docked', offsetY: 3.28 },
  'scooters--scooter-right-docked': { id: 'scooters--scooter-right-docked', offsetY: 3.28 },

  'people--people-01': { id: 'people--people-01', offsetY: 3.7 },
  'people--people-02': { id: 'people--people-02', offsetY: 3.7 },
  'people--people-03': { id: 'people--people-03', offsetY: 3.7 },
  'people--people-04': { id: 'people--people-04', offsetY: 3.7 },
  'people--people-05': { id: 'people--people-05', offsetY: 3.7 },
  'people--people-06': { id: 'people--people-06', offsetY: 3.7 },
  'people--people-07': { id: 'people--people-07', offsetY: 3.7 },
  'people--people-08': { id: 'people--people-08', offsetY: 3.7 },
  'people--people-09': { id: 'people--people-09', offsetY: 3.7 },
  'people--people-10': { id: 'people--people-10', offsetY: 3.7 },
  'people--people-11': { id: 'people--people-11', offsetY: 3.7 },
  'people--people-12': { id: 'people--people-12', offsetY: 3.7 },
  'people--people-13': { id: 'people--people-13', offsetY: 3.7 },
  'people--people-14': { id: 'people--people-14', offsetY: 3.7 },
  'people--people-15': { id: 'people--people-15', offsetY: 3.7 },
  'people--people-16': { id: 'people--people-16', offsetY: 3.7 },
  'people--people-17': { id: 'people--people-17', offsetY: 3.7 },
  'people--people-18': { id: 'people--people-18', offsetY: 3.7 },
  'people--people-19': { id: 'people--people-19', offsetY: 3.7 },
  'people--people-20': { id: 'people--people-20', offsetY: 3.7 },
  'people--people-21': { id: 'people--people-21', offsetY: 3.7 },
  'people--people-22': { id: 'people--people-22', offsetY: 3.7 },
  'people--people-23': { id: 'people--people-23', offsetY: 3.7 },
  'people--people-24': { id: 'people--people-24', offsetY: 3.7 },
  'people--people-25': { id: 'people--people-25', offsetY: 3.5 }, // Scooter
  'people--people-26': { id: 'people--people-26', offsetY: 3.7 },
  'people--people-27': { id: 'people--people-27', offsetY: 3.7 },
  'people--people-28': { id: 'people--people-28', offsetY: 3.7 },
  'people--people-29': { id: 'people--people-29', offsetY: 3.7 },
  'people--people-30': { id: 'people--people-30', offsetY: 3.7 },
  'people--people-31': { id: 'people--people-31', offsetY: 3.7 }
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
