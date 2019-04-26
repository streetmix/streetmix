import SEGMENT_COMPONENTS from './components.json'
import SEGMENT_LOOKUP from './segment-lookup.json'
import { SEGMENT_UNKNOWN, SEGMENT_UNKNOWN_VARIANT } from './info'
import { uniq } from 'lodash'

/**
 * Retrieves the necessary information required to map the old segment data model to the
 * new segment data model for the specific segment using the segment's `type` and `variant`.
 *
 * @param {string} type
 * @param {string} variant
 * @returns {object|boolean} segmentLookup - returns an object in the shape of: { lanes, objects, vehicles } or `false` if not found.
 */
function getSegmentLookup (type, variant) {
  return SEGMENT_LOOKUP[type] && SEGMENT_LOOKUP[type][variant]
}

/**
 * Retrieves the specified segment information from the new segment data model using the
 * component group and the segment id.
 *
 * @param {string} group - component group, one of values "lanes", "vehicles" or "objects"
 * @param {string} id - name of segment component, e.g. "scooter"
 * @returns {object} segmentInfo
 */
function getSegmentInfo (group, id) {
  return (SEGMENT_COMPONENTS[group] && SEGMENT_COMPONENTS[group][id]) || SEGMENT_UNKNOWN
}

/**
 * Retrieves the information for all items that make up a particular component group by
 * looking up the component group and item id in `SEGMENT_COMPONENTS`.
 *
 * @param {string} group - component group name (i.e. `lanes`, `objects`, or `vehicles`)
 * @param {Array} groupItems - items that make up the component group in shape of [{ id, variants }]
 * @returns {object} componentGroupInfo - returns object in shape of { id: { characteristics, rules, variants } }
 */
function getComponentGroupInfo (group, groupItems) {
  return groupItems.reduce((obj, item) => {
    obj[item.id] = getSegmentInfo(group, item.id)
    return obj
  }, {})
}

/**
 * Retrieves all graphics definitions for the component group based on each `variant`
 * specified for each component group item.
 *
 * @param {Array} groupItems - items that make up the component group in shape of [ { id, variants } ]
 * @param {object} componentGroupInfo - definition of each item from `SEGMENT_COMPONENTS` in shape of { id: { characteristics, rules, variants } }
 * @returns {Array} componentGroupVariants - returns array of graphic definitions in shape of [ { graphics } ]
 */
function getComponentGroupVariants (groupItems, componentGroupInfo) {
  return groupItems.reduce((array, item) => {
    const { id, variants } = item
    // groupItemVariants - all variants possible for the particular group item
    const groupItemVariants = componentGroupInfo[id] && componentGroupInfo[id].variants

    if (groupItemVariants) {
      Object.entries(variants).forEach(([variantName, variantKey]) => {
        // variantInfo - graphics definition for specific variants defined by group item
        const variantInfo = (groupItemVariants[variantName] && groupItemVariants[variantName][variantKey]) || SEGMENT_UNKNOWN_VARIANT
        array.push(variantInfo.graphics)
      })
    }

    return array
  }, [])
}

/**
 * A segment may contain multiple graphics for the same graphics type ('left', 'right', 'repeat', 'center').
 * When encountering a new graphic for the same graphics type, this function creates a new array that
 * contains both the new graphic as well as the existing graphics.
 *
 * @param {Array|string} target
 * @param {Array|string} source
 * @returns {Array} graphicsInfo
 */
function appendVariantSprites (target, source) {
  const targetArray = Array.isArray(target) ? target : [target]
  const sourceArray = Array.isArray(source) ? source : [source]

  const graphicsInfo = targetArray.concat(sourceArray)
  return uniq(graphicsInfo)
}

/**
 * Merges the array of graphic definition objects needed to draw the segment into a single object.
 *
 * @param {Array} variantGraphics
 * @returns {object} graphics
 */
function mergeVariantGraphics (variantGraphics) {
  return variantGraphics.reduce((graphics, variantInfo) => {
    Object.keys(variantInfo).forEach((key) => {
      const target = graphics[key]
      const source = variantInfo[key]

      if (target) {
        graphics[key] = appendVariantSprites(target, source)
      } else {
        graphics[key] = source
      }
    })

    return graphics
  }, {})
}

/**
 * Collects all rules associated with any items that make up the component group into a single object.
 *
 * @param {Array} groupItems - items that make up the component group in shape of [{ id, variants }]
 * @param {object} componentGroupInfo - definition of each item from `SEGMENT_COMPONENTS` in shape of { id: { characteristics, rules, variants } }
 * @returns {object} componentGroupRules
 */
function getComponentGroupRules (groupItems, componentGroupInfo) {
  const componentGroupRules = groupItems.reduce((obj, item) => {
    const { id, variants } = item

    let groupItemRules = {}

    if (componentGroupInfo[id] && componentGroupInfo[id].rules) {
      groupItemRules = { ...componentGroupInfo[id].rules }
    }

    const groupItemVariants = componentGroupInfo[id] && componentGroupInfo[id].variants

    Object.keys(variants).forEach((variantName) => {
      if (groupItemVariants[variantName] && groupItemVariants[variantName].rules) {
        groupItemRules = { ...groupItemRules, ...groupItemVariants[variantName].rules }
      }
    })

    return { ...obj, ...groupItemRules }
  }, {})

  return Object.keys(componentGroupRules).length && componentGroupRules
}

/**
 * Maps the old segment data model to the new segment data model and returns the graphic sprites necessary
 * to draw the segment as well as any rules to follow, e.g. `minWidth` based on the `type` and `variant`.
 *
 * @param {string} type
 * @param {string} variant
 * @returns {object} variantInfo - returns an object in the shape of { graphics, ...rules }
 */
function getSegmentVariantInfo (type, variant) {
  const segmentLookup = getSegmentLookup(type, variant)

  if (!segmentLookup) {
    return SEGMENT_UNKNOWN_VARIANT
  }

  // 1) Loop through each component group that makes up the segment.
  const variantInfo = Object.entries(segmentLookup).reduce((variantInfo, componentGroup) => {
    const [ group, groupItems ] = componentGroup
    // 2) For each component group, look up the segment information for every item that makes up the component group.
    // componentGroupInfo = [ { characteristics, rules, variants } ]
    const componentGroupInfo = getComponentGroupInfo(group, groupItems)

    // componentGroupVariants = [ { graphics } ]
    // 3) For each component group, look up the segment variant graphics for every item that makes up the component group.
    const componentGroupVariants = getComponentGroupVariants(groupItems, componentGroupInfo)

    if (componentGroupVariants.length) {
      // 4) Combine the variant graphics for each component group into one array
      componentGroupVariants.forEach((groupItemVariants) => { variantInfo.graphics.push(groupItemVariants) })
    }

    // 5) For each component group, look up any rules associated with each of the items that make up the component group.
    const componentGroupRules = getComponentGroupRules(groupItems, componentGroupInfo)
    if (componentGroupRules) {
      return Object.assign(variantInfo, componentGroupRules)
    }

    return variantInfo
  }, { graphics: [] })

  // 6) Combine the variant graphics into one graphics definition object.
  variantInfo.graphics = mergeVariantGraphics(variantInfo.graphics)
  return variantInfo
}

/**
 * Temporary helper method that compares the original segment variant info with the variant info returned
 * by the new data model. If the new variant info contains all the keys from the original variant info, then
 * the variant info is correct.
 *
 * TODO - migrate helper method to become a test suite
 *
 * @param {object} originalVariantInfo
 * @param {object} newVariantInfo
 * @returns {boolean} correct
 */
function verifyCorrectness (originalVariantInfo, newVariantInfo) {
  const filteredKeys = Object.keys(originalVariantInfo).filter(key => !newVariantInfo[key])
  const filteredGraphics = Object.entries(originalVariantInfo.graphics).filter((item) => {
    const [ key, value ] = item
    const originalGraphics = Array.isArray(value) ? value.sort() : value
    const newGraphics = Array.isArray(newVariantInfo.graphics[key]) ? newVariantInfo.graphics[key].sort() : newVariantInfo.graphics[key]
    return !(JSON.stringify(originalGraphics) === JSON.stringify(newGraphics))
  })

  return (filteredKeys.length === 0 && filteredGraphics.length === 0)
}

/**
 * Tests the mapping of the old segment data model to the new segment data model and
 * returns the correct `variantInfo` needed to draw the segment.
 *
 * @param {string} type
 * @param {string} variant
 * @param {object} segmentVariantInfo
 * @returns {object} variantInfo
 */
export function testSegmentLookup (type, variant, segmentVariantInfo) {
  const newVariantInfo = getSegmentVariantInfo(type, variant)

  if (verifyCorrectness(segmentVariantInfo, newVariantInfo)) {
    console.log(variant, newVariantInfo)
    return newVariantInfo
  } else {
    return segmentVariantInfo
  }
}
