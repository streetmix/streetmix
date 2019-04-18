import SEGMENT_INFO from './segment-info.json'
import SEGMENT_LOOKUP from './segment-lookup.json'

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

/**
 * Gets segment components data for segment `type` and `variantString` which includes
 * lanes, objects, and vehicles that make up the segment.
 *
 * @param {string} type
 * @param {string} variantString
 * @returns {object} - { lanesArray, objectsArray, vehiclesArray }
 */
function getSegmentComponents (type, variant) {
  return SEGMENT_LOOKUP[type] && SEGMENT_LOOKUP[type][variant]
}

/**
 * Gets segment info for segment of `type` and `variantString`. Returns an object in shape of
 * { characteristics, variants, rules } which describes that particular segment or the
 * `SEGMENT_UNKNOWN` placeholder if segment is not found.
 *
 * @param {string} type
 * @param {string} id
 * @returns {object} - { characteristics, rules, variants }
 */
function getSegmentInfo (type, id) {
  return (SEGMENT_INFO[type] && SEGMENT_INFO[type][id]) || SEGMENT_UNKNOWN
}

/**
 * Retrieves the segment pieces that make up the component (lane, object, or vehicle).
 *
 * @param {string} type
 * @param {Array} componentPieces
 * @returns {object} - { id: { characteristics, rules, variants } }
 */
function getComponentPiecesInfo (type, componentPieces) {
  const componentPiecesInfo = componentPieces.reduce((obj, item) => {
    const componentPieceInfo = getSegmentInfo(type, item.id)
    obj[item.id] = componentPieceInfo
    return obj
  }, {})

  return componentPiecesInfo
}

/**
 * Creates one object with all the graphic definitions to draw a segment.
 *
 * @param {object} graphics
 * @param {object} variantInfo
 * @returns {object}
 */
function mergeVariantGraphics (graphics, variantInfo) {
  const graphicsInfo = { ...graphics }

  Object.keys(variantInfo).forEach((key) => {
    const target = graphics[key]
    const source = variantInfo[key]

    if (graphicsInfo[key]) {
      graphicsInfo[key] = [...target, ...source]
    } else {
      graphicsInfo[key] = source
    }
  })

  return graphicsInfo
}

/**
 * Collects graphics definitions for each segment piece that makes up a component into an array.
 *
 * @param {Array} componentPieces - [ { id, variants } ]
 * @param {object} componentPiecesInfo - { id: { characteristics, rules, variants } }
 * @returns {object} - { graphics: [ { graphicsForComponentPiece1 }, { graphicsForComponentPiece2 }, ... ], rules: {} }
 */
function getComponentPiecesVariantInfo (componentPieces, componentPiecesInfo) {
  let componentRules = {}

  const componentPiecesVariantInfo = componentPieces.map((componentPiece) => {
    const { id, variants } = componentPiece

    const componentPieceVariantInfo = Object.entries(variants).reduce((graphics, variant) => {
      const [ variantType, variantKey ] = variant

      const componentPieceRules = { ...componentPiecesInfo[id] && componentPiecesInfo[id].rules }
      componentRules = Object.assign(componentRules, componentPieceRules)

      const componentPieceVariants = componentPiecesInfo[id] && componentPiecesInfo[id].variants
      const variantInfo = (componentPieceVariants[variantType] && componentPieceVariants[variantType][variantKey]) || SEGMENT_UNKNOWN_VARIANT

      return mergeVariantGraphics(graphics, variantInfo.graphics)
    }, {})

    return componentPieceVariantInfo
  })

  return { graphics: componentPiecesVariantInfo, rules: componentRules }
}

/**
 * Combines all graphics definitions from each segment piece that makes up a component into one graphics definition for the component.
 *
 * @param {Array} componentPiecesVariantInfo - [ { graphicsForComponentPiece1 }, { graphicsForComponentPiece2 }, ...]
 * @returns {object}
 */
function mergeComponentVariants (componentPiecesVariantInfo) {
  return componentPiecesVariantInfo.reduce((graphics, componentPieceVariantInfo) => {
    return mergeVariantGraphics(graphics, componentPieceVariantInfo)
  }, {})
}

function getSegmentVariantInfo (type, variant) {
  const segmentComponents = getSegmentComponents(type, variant)

  if (!segmentComponents) {
    return SEGMENT_UNKNOWN_VARIANT
  }

  let segmentRules = {}

  // 1) Go through each segment component (lanes, objects, vehicles).
  const segmentVariantInfoArray = Object.entries(segmentComponents).map((segmentComponent) => {
    const [ type, componentPieces ] = segmentComponent

    if (componentPieces.length) {
      // 2) For each segment component, retrieve information about each segment that makes up the component.
      const componentPiecesInfo = getComponentPiecesInfo(type, componentPieces)
      // 3) For each segment component, retrieve graphics information for each segment that makes up the component.
      const componentPiecesVariantInfo = getComponentPiecesVariantInfo(componentPieces, componentPiecesInfo)
      // 4) Combine graphics information from each segment that makes up the component into one object for the entire component.
      const componentVariantInfo = mergeComponentVariants(componentPiecesVariantInfo.graphics)

      segmentRules = Object.assign(segmentRules, componentPiecesVariantInfo.rules)
      return componentVariantInfo
    }
  })

  // 5) Combine graphics information from each segment component into one object for the whole segment.
  const segmentVariantInfo = segmentVariantInfoArray.reduce((graphics, variantInfo) => {
    return (variantInfo) ? mergeVariantGraphics(graphics, variantInfo) : graphics
  })

  // 6) Return graphics information for whole segment along with any rules that apply to the segment.
  return { graphics: segmentVariantInfo, ...segmentRules }
}

/**
 * Temporary helper method that compares the original segment variant info with the variant info returned
 * by the new data model. If the new variant info contains all the keys from the original variant info, then
 * the variant info is correct.
 *
 * @param {object} original
 * @param {object} test
 * @returns {boolean}
 */
function verifyCorrectness (original, test) {
  const filteredKeys = Object.keys(original).filter((key) => !(test[key]))
  const filteredGraphics = Object.entries(original.graphics).filter((item) => {
    const [ key, value ] = item
    return !(JSON.stringify(value) === JSON.stringify(test.graphics[key]))
  })

  return !(filteredKeys.length && filteredGraphics.length)
}

export function testSegmentLookup (type, variant, segmentVariantInfo) {
  const testSegmentVariantInfo = getSegmentVariantInfo(type, variant)

  if (verifyCorrectness(segmentVariantInfo, testSegmentVariantInfo)) {
    console.log(variant, testSegmentVariantInfo)
    return testSegmentVariantInfo
  } else {
    return segmentVariantInfo
  }
}
