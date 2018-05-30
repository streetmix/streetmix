import SEGMENT_INFO from './info.json'

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
const SEGMENT_UNKNOWN = {
  unknown: true,
  name: 'Unknown',
  owner: 'NONE',
  zIndex: 1,
  variants: [],
  details: {}
}

const SEGMENT_UNKNOWN_VARIANT = {
  unknown: true,
  name: 'Unknown',
  graphics: {
    center: 'missing'
  }
}

const SPRITE_DEFS = {
  'markings--straight-inbound-light': { id: 'markings--straight-inbound-light', width: 4, offsetY: 11.12 }, // translucent version of arrow
  'markings--straight-outbound-light': { id: 'markings--straight-outbound-light', width: 4, offsetY: 11.12 },
  'markings--straight-inbound': { id: 'markings--straight-inbound', width: 4, offsetY: 11.12 },
  'markings--straight-outbound': { id: 'markings--straight-outbound', width: 4, offsetY: 11.12 },
  'markings--left-inbound': { id: 'markings--left-inbound', width: 4, offsetY: 11.12 },
  'markings--left-outbound': { id: 'markings--left-outbound', width: 4, offsetY: 11.12 },
  'markings--left-straight-inbound': { id: 'markings--left-straight-inbound', width: 4, offsetY: 11.12 },
  'markings--left-straight-outbound': { id: 'markings--left-straight-outbound', width: 4, offsetY: 11.12 },
  'markings--right-inbound': { id: 'markings--right-inbound', width: 4, offsetY: 11.12 },
  'markings--right-outbound': { id: 'markings--right-outbound', width: 4, offsetY: 11.12 },
  'markings--right-straight-inbound': { id: 'markings--right-straight-inbound', width: 4, offsetY: 11.12 },
  'markings--right-straight-outbound': { id: 'markings--right-straight-outbound', width: 4, offsetY: 11.12 },
  'markings--both-inbound': { id: 'markings--both-inbound', width: 4, offsetY: 11.12 },
  'markings--both-outbound': { id: 'markings--both-outbound', width: 4, offsetY: 11.12 },
  'markings--shared-inbound': { id: 'markings--shared-inbound', width: 4, offsetY: 11.12 },
  'markings--shared-outbound': { id: 'markings--shared-outbound', width: 4, offsetY: 11.12 },
  'markings--sharrow-inbound': { id: 'markings--sharrow-inbound', width: 4, offsetY: 11.12 },
  'markings--sharrow-outbound': { id: 'markings--sharrow-outbound', width: 4, offsetY: 11.12 },

  'markings--lane-left': { id: 'markings--lane-left', width: 2, offsetY: 11.28 },
  'markings--lane-right': { id: 'markings--lane-right', width: 2, offsetY: 11.28 },
  'markings--center-lane-left': { id: 'markings--center-lane-left', width: 2, offsetY: 11.28 },
  'markings--center-lane-right': { id: 'markings--center-lane-right', width: 2, offsetY: 11.28 },
  'markings--parking-left': { id: 'markings--parking-left', width: 2, offsetY: 11.28 },
  'markings--parking-right': { id: 'markings--parking-right', width: 2, offsetY: 11.28 },
  'markings--streetcar-track-01': { id: 'markings--streetcar-track-01', width: 5, offsetY: 11.28 }, // lighter (for dark backgrounds)
  'markings--streetcar-track-02': { id: 'markings--streetcar-track-02', width: 5, offsetY: 11.28 }, // darker (for light backgrounds)
  'markings--stripes-diagonal': { id: 'markings--stripes-diagonal', width: 5, offsetY: 11.28 },
  'ground--asphalt': { id: 'ground--asphalt', width: 10, offsetY: 11.25 },
  'ground--asphalt-gray': { id: 'ground--asphalt-gray', width: 10, offsetY: 11.25 },
  'ground--asphalt-green': { id: 'ground--asphalt-green', width: 10, offsetY: 11.25 },
  'ground--asphalt-red': { id: 'ground--asphalt-red', width: 10, offsetY: 11.25 },
  'ground--concrete': { id: 'ground--concrete', width: 10, offsetY: 10.65 },
  'ground--concrete-raised': { id: 'ground--concrete-raised', width: 10, offsetY: 6 + 2.2 },

  'parklet--yerba-buena-parklet-left-v02': { id: 'parklet--yerba-buena-parklet-left-v02', width: 8, offsetY: 3.4 },
  'parklet--yerba-buena-parklet-right-v02': { id: 'parklet--yerba-buena-parklet-right-v02', width: 8, offsetY: 3.4 },
  'bikes--bike-rack-parallel-left': { id: 'bikes--bike-rack-parallel-left', width: 3, offsetY: 4.75 },
  'bikes--bike-rack-parallel-right': { id: 'bikes--bike-rack-parallel-right', width: 3, offsetY: 4.75 },
  'bikes--bike-rack-perpendicular-left': { id: 'bikes--bike-rack-perpendicular-left', width: 6, offsetY: 4.75 },
  'bikes--bike-rack-perpendicular-right': { id: 'bikes--bike-rack-perpendicular-right', width: 6, offsetY: 4.75 },
  'furniture--bench-left': { id: 'furniture--bench-left', width: 3, offsetY: 4.75 },
  'furniture--bench-center': { id: 'furniture--bench-center', width: 3, offsetY: 4.75 },
  'furniture--bench-right': { id: 'furniture--bench-right', width: 3, offsetY: 4.75 },
  'wayfinding--nyc-wayfinding-pylon-large': { id: 'wayfinding--nyc-wayfinding-pylon-large', width: 4, offsetY: -0.3 },
  'wayfinding--nyc-wayfinding-pylon-medium': { id: 'wayfinding--nyc-wayfinding-pylon-medium', width: 3, offsetY: -0.3 },
  'wayfinding--nyc-wayfinding-pylon-small': { id: 'wayfinding--nyc-wayfinding-pylon-small', width: 2, offsetY: -0.3 },
  'lamps--lamp-modern-left': { id: 'lamps--lamp-modern-left', width: 12, offsetX: -10.3, offsetY: -20.25 },
  'lamps--lamp-modern-both': { id: 'lamps--lamp-modern-both', width: 16, offsetY: -20.25 },
  'lamps--lamp-modern-right': { id: 'lamps--lamp-modern-right', width: 12, offsetX: -10.3, offsetY: -20.25 },
  'lamps--lamp-traditional-right': { id: 'lamps--lamp-traditional-right', width: 4, offsetX: -1.5, offsetY: -4.25 },
  'lamps--lamp-traditional-center': { id: 'lamps--lamp-traditional-center', width: 4, offsetY: -4.25 },
  'lamps--lamp-traditional-left': { id: 'lamps--lamp-traditional-left', width: 4, offsetX: -1.5, offsetY: -4.25 },
  'lamps--pride-banner-right': { id: 'lamps--pride-banner-right', width: 4, offsetX: -2.5, offsetY: -13 },
  'lamps--pride-banner-left': { id: 'lamps--pride-banner-left', width: 4, offsetX: -2.5, offsetY: -13 },
  'trees--tree': { id: 'trees--tree', width: 9, offsetY: -10.3 },
  'trees--palm-tree': { id: 'trees--palm-tree', offsetX: 0, offsetY: -20.25, width: 14 },
  'dividers--planter-box': { id: 'dividers--planter-box', width: 4, offsetY: 4.25 },
  'plants--bush': { id: 'plants--bush', width: 4, offsetY: 5.7 },
  'plants--flowers': { id: 'plants--flowers', width: 4, offsetY: 5.5 },
  'plants--grass': { id: 'plants--grass', width: 4, offsetY: 9.7 },
  'dividers--bollard': { id: 'dividers--bollard', width: 1, offsetY: 4.25 },
  'dividers--dome': { id: 'dividers--dome', width: 1, offsetY: 4.25 },
  'bikes--biker-01-inbound': { id: 'bikes--biker-01-inbound', width: 3, offsetY: 3.28 },
  'bikes--biker-01-outbound': { id: 'bikes--biker-01-outbound', width: 3, offsetY: 3.28 },
  'bikes--biker-02-inbound': { id: 'bikes--biker-02-inbound', width: 3, offsetY: 3.28 },
  'bikes--biker-02-outbound': { id: 'bikes--biker-02-outbound', width: 3, offsetY: 3.28 },
  'vehicles--car-inbound': { id: 'vehicles--car-inbound', width: 6, offsetY: -3.7 },
  'vehicles--car-outbound': { id: 'vehicles--car-outbound', width: 6, offsetY: -3.7 },
  'vehicles--car-inbound-turn-signal-right': { id: 'vehicles--car-inbound-turn-signal-right', width: 8, offsetY: -3.7 }, // left/right flipped on purpose (see relevant issue/discussion about swapping it back)
  'vehicles--car-inbound-turn-signal-left': { id: 'vehicles--car-inbound-turn-signal-left', width: 8, offsetY: -3.7 }, // left/right flipped on purpose (see relevant issue/discussion about swapping it back)
  'vehicles--car-outbound-turn-signal-left': { id: 'vehicles--car-outbound-turn-signal-left', width: 8, offsetY: -3.7 },
  'vehicles--car-outbound-turn-signal-right': { id: 'vehicles--car-outbound-turn-signal-right', width: 8, offsetY: -3.7 },
  'vehicles--car-sideways-left': { id: 'vehicles--car-sideways-left', width: 14, offsetY: 5.35 },
  'vehicles--car-sideways-right': { id: 'vehicles--car-sideways-right', width: 14, offsetY: 5.35 },
  'vehicles--car-angled-front-left': { id: 'vehicles--car-angled-front-left', width: 14, offsetY: 5.35 },
  'vehicles--car-angled-front-right': { id: 'vehicles--car-angled-front-right', width: 14, offsetY: 5.35 },
  'vehicles--car-angled-rear-left': { id: 'vehicles--car-angled-rear-left', width: 14, offsetY: 5.35 },
  'vehicles--car-angled-rear-right': { id: 'vehicles--car-angled-rear-right', width: 14, offsetY: 5.35 },
  'transit--bus-inbound': { id: 'transit--bus-inbound', width: 12, offsetY: 0.35 },
  'transit--bus-outbound': { id: 'transit--bus-outbound', width: 12, offsetY: 0.35 },
  'transit--light-rail-inbound': { id: 'transit--light-rail-inbound', width: 10, offsetY: -5.75 },
  'transit--light-rail-outbound': { id: 'transit--light-rail-outbound', width: 10, offsetY: -5.75 },
  'secret--inception-train': { id: 'secret--inception-train', width: 14, offsetY: -4.7 },
  'transit--streetcar-inbound': { id: 'transit--streetcar-inbound', width: 12, offsetY: -6.75 },
  'transit--streetcar-outbound': { id: 'transit--streetcar-outbound', width: 12, offsetY: -6.75 },
  'vehicles--truck-inbound': { id: 'vehicles--truck-inbound', width: 10, offsetY: -0.75 },
  'vehicles--truck-outbound': { id: 'vehicles--truck-outbound', width: 9, offsetY: -0.75 },
  'transit--transit-shelter-01-left': { id: 'transit--transit-shelter-01-left', width: 9, offsetY: -1.3 },
  'transit--transit-shelter-01-right': { id: 'transit--transit-shelter-01-right', width: 9, offsetY: -1.3 },
  'transit--transit-shelter-02-left': { id: 'transit--transit-shelter-02-left', width: 9, offsetY: -3.8 },
  'transit--transit-shelter-02-right': { id: 'transit--transit-shelter-02-right', width: 9, offsetY: -3.8 },
  'missing': { id: 'missing', width: 4, offsetY: 10.5 },

  // test stuff
  'vehicles--taxi-inbound-door-left': { id: 'vehicles--taxi-inbound-door-left', width: 12, offsetY: -3.7 },
  'vehicles--taxi-inbound-door-right': { id: 'vehicles--taxi-inbound-door-right', width: 12, offsetY: -3.7 },
  'vehicles--taxi-outbound-door-left': { id: 'vehicles--taxi-outbound-door-left', width: 12, offsetY: -3.7 },
  'vehicles--taxi-outbound-door-right': { id: 'vehicles--taxi-outbound-door-right', width: 12, offsetY: -3.7 },
  'vehicles--rideshare-inbound-door-left': { id: 'vehicles--rideshare-inbound-door-left', width: 12, offsetY: -3.7 },
  'vehicles--rideshare-inbound-door-right': { id: 'vehicles--rideshare-inbound-door-right', width: 12, offsetY: -3.7 },
  'vehicles--rideshare-outbound-door-left': { id: 'vehicles--rideshare-outbound-door-left', width: 12, offsetY: -3.7 },
  'vehicles--rideshare-outbound-door-right': { id: 'vehicles--rideshare-outbound-door-right', width: 12, offsetY: -3.7 },
  'bikes--bikeshare-left': { id: 'bikes--bikeshare-left', width: 7, offsetY: -3.7 },
  'bikes--bikeshare-right': { id: 'bikes--bikeshare-right', width: 7, offsetY: -3.7 },
  'vehicles--foodtruck-left': { id: 'vehicles--foodtruck-left', width: 15, offsetY: -3.7 },
  'vehicles--foodtruck-right': { id: 'vehicles--foodtruck-right', width: 15, offsetY: -3.7 },

  'curb--sign1': { id: 'curb--sign1', width: 2, offsetY: -4.3 },
  'curb--sign2': { id: 'curb--sign2', width: 2, offsetY: -4.3 },
  'curb--sign3': { id: 'curb--sign3', width: 2, offsetY: -4.3 },
  'curb--sign4': { id: 'curb--sign4', width: 2, offsetY: -4.3 },
  'curb--pylon1': { id: 'curb--pylon1', width: 2, offsetY: -4.3 },
  'curb--pylon2': { id: 'curb--pylon2', width: 2, offsetY: -4.3 },
  'curb--pylon3': { id: 'curb--pylon3', width: 2, offsetY: -4.3 },
  'curb--pylon4': { id: 'curb--pylon4', width: 2, offsetY: -4.3 },
  'curb--person-left': { id: 'curb--person-left', width: 4, offsetY: -4.3 },
  'curb--person-right': { id: 'curb--person-right', width: 4, offsetY: -4.3 }
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
  return (segment && segment.details && segment.details[variant]) || SEGMENT_UNKNOWN_VARIANT
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
    def = {...SPRITE_DEFS[sprite.id], ...sprite}
  } else {
    // Clone the original to prevent downstream consumers from accidentally
    // modifying the reference
    def = {...SPRITE_DEFS[sprite]}
  }
  return def
}
