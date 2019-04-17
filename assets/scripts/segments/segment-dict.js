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

const SEGMENT_COMPONENTS_UNKNOWN = {
  unknown: true,
  lanes: [],
  objects: [],
  vehicles: []
}

/**
 * Gets segment components data for segment `type` and `variantString`. Safer than reading
 * `type` and `variantString` directly from `SEGMENT_LOOKUP`, because this will return the
 * `SEGMENT_COMPONENTS_UNKNOWN` placeholder if the segment components data is not found.
 *
 * @param {string} type
 * @param {string} variantString
 * @returns {Object} - { lanesArray, objectsArray, vehiclesArray }
 */
function getSegmentComponents (type, variant) {
  return (SEGMENT_LOOKUP[type] && SEGMENT_LOOKUP[type][variant]) || SEGMENT_COMPONENTS_UNKNOWN
}

/**
 * Gets segment info for segment of `type` and `variantString`. Returns an object in shape of
 * { characteristics, variants, rules } which describes that particular segment or the
 * `SEGMENT_UNKNOWN` placeholder if segment is not found.
 *
 * @param {string} type
 * @param {string} id
 * @returns {Object} - { characteristics, rules, variants }
 */
function getSegmentInfo (type, id) {
  return (SEGMENT_INFO[type] && SEGMENT_INFO[type][id]) || SEGMENT_UNKNOWN
}

/**
 *
 * @param {string} type
 * @param {Array} componentPieces
 * @returns {Object} - { id: { characteristics, rules, variants } }
 */
function getComponentPiecesInfo (type, componentPieces) {
  const componentPiecesInfo = componentPieces.reduce((obj, item) => {
    const componentPieceInfo = getSegmentInfo(type, item.id)
    obj[item.id] = componentPieceInfo
    return obj
  }, {})

  return componentPiecesInfo
}

function appendVariantSprites (target, source) {
  let newGraphicsInfo

  if (Array.isArray(target) && Array.isArray(source)) {
    newGraphicsInfo = target.concat(source)
  } else if (Array.isArray(target)) {
    newGraphicsInfo = target.push(source)
  } else if (Array.isArray(source)) {
    newGraphicsInfo = [...target].concat(source)
  } else {
    newGraphicsInfo = [...target, ...source]
  }

  return newGraphicsInfo
}

function mergeVariantGraphics (graphics, variantInfo) {
  const graphicsInfo = { ...graphics }

  Object.keys(variantInfo).forEach((key) => {
    if (graphicsInfo[key]) {
      graphicsInfo[key] = appendVariantSprites(graphicsInfo[key], variantInfo[key])
    } else {
      graphicsInfo[key] = variantInfo[key]
    }
  })

  return graphicsInfo
}

/**
 *
 * @param {Array} componentPieces - [ { id, variants } ]
 * @param {Object} componentPiecesInfo - { id: { characteristics, rules, variants } }
 * @returns {Object} - { graphics: [ { graphicsForComponentPiece1 }, { graphicsForComponentPiece2 }, ... ], rules: {} }
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

function mergeComponentVariants (componentPiecesVariantInfo) {
  return componentPiecesVariantInfo.reduce((graphics, componentPieceVariantInfo) => {
    return mergeVariantGraphics(graphics, componentPieceVariantInfo)
  }, {})
}

function getSegmentVariantInfo (type, variant) {
  const segmentComponents = getSegmentComponents(type, variant)

  if (segmentComponents.unknown) {
    return SEGMENT_UNKNOWN_VARIANT
  }

  let segmentRules = {}

  const segmentVariantInfoArray = Object.entries(segmentComponents).map((segmentComponent) => {
    const [ type, componentPieces ] = segmentComponent

    if (componentPieces.length) {
      const componentPiecesInfo = getComponentPiecesInfo(type, componentPieces)
      const componentPiecesVariantInfo = getComponentPiecesVariantInfo(componentPieces, componentPiecesInfo)
      const componentVariantInfo = mergeComponentVariants(componentPiecesVariantInfo.graphics)

      segmentRules = Object.assign(segmentRules, componentPiecesVariantInfo.rules)
      return componentVariantInfo
    }
  })

  const segmentVariantInfo = segmentVariantInfoArray.reduce((graphics, variantInfo) => {
    return (variantInfo) ? mergeVariantGraphics(graphics, variantInfo) : graphics
  })

  return { graphics: segmentVariantInfo, ...segmentRules }
}

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
    console.log(testSegmentVariantInfo)
    return testSegmentVariantInfo
  } else {
    return segmentVariantInfo
  }
}
