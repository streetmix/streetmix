import SEGMENT_COMPONENTS from './components.json'
import SEGMENT_LOOKUP from './segment-lookup.json'
import { SEGMENT_UNKNOWN, SEGMENT_UNKNOWN_VARIANT } from './info'
import { uniq, differenceWith, isEqual, isEqualWith } from 'lodash'

const COMPONENT_GROUPS = {
  LANES: 'lanes',
  MARKINGS: 'markings',
  OBJECTS: 'objects',
  VEHICLES: 'vehicles'
}

/**
 * Retrieves the necessary information required to map the old segment data model to the
 * new segment data model for the specific segment using the segment's `type` and `variant`.
 *
 * @param {string} type
 * @param {string} variant
 * @returns {object|boolean} segmentLookup - returns an object in the shape of:
 *   { details, components: { lanes, objects, vehicles } } or `false` if not found.
 */
function getSegmentLookup (type, variant) {
  return SEGMENT_LOOKUP[type] && SEGMENT_LOOKUP[type].details && SEGMENT_LOOKUP[type].details[variant]
}

/**
 * Retrieves the specified segment component information from the new segment data model using the
 * component group and the segment component's id.
 *
 * @param {string} group - component group, one of values "lanes", "vehicles" or "objects"
 * @param {string} id - name of segment component, e.g. "scooter"
 * @returns {object} segmentInfo
 */
function getSegmentComponentInfo (group, id) {
  return (SEGMENT_COMPONENTS[group] && SEGMENT_COMPONENTS[group][id]) || SEGMENT_UNKNOWN
}

/**
 * Retrieves the information for all items that make up a particular component group by
 * looking up the component group and item id in `SEGMENT_COMPONENTS`.
 *
 * @param {string} group - component group name (i.e. `markings`, `lanes`, `objects`, or `vehicles`)
 * @param {Array} groupItems - items that make up the component group in shape of [{ id, variants }]
 * @returns {object} componentGroupInfo - returns object in shape of { id: { characteristics, rules, variants } }
 */
function getComponentGroupInfo (group, groupItems) {
  return groupItems.reduce((obj, item) => {
    obj[item.id] = getSegmentComponentInfo(group, item.id)
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

    if (groupItemVariants && variants) {
      Object.entries(variants).forEach(([variantName, variantKey]) => {
        // variantInfo - graphics definition for specific variants defined by group item
        let variantInfo = groupItemVariants[variantName] || SEGMENT_UNKNOWN_VARIANT

        const variantKeys = Array.isArray(variantKey) ? variantKey : [ variantKey ]
        variantKeys.forEach((key) => {
          variantInfo = (variantInfo && variantInfo[key]) || SEGMENT_UNKNOWN_VARIANT
        })

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
    if (variantInfo) {
      Object.keys(variantInfo).forEach((key) => {
        const target = graphics[key]
        const source = variantInfo[key]

        if (target) {
          graphics[key] = appendVariantSprites(target, source)
        } else {
          graphics[key] = source
        }
      })
    }

    return graphics
  }, {})
}

/**
 * Gets segment data for segment `type`. Safer than reading `type` directly
 * from `SEGMENT_INFO`, because this will return the `SEGMENT_UNKNOWN`
 * placeholder if the type is not found. The unknown segment placeholder
 * allows means bad data, experimental segments, etc. won't break rendering.
 *
 * @param {string} type
 * @returns {Object} segmentInfo
 */
function getSegmentInfo (type) {
  const { details, ...segmentInfo } = SEGMENT_LOOKUP[type] || {}
  return segmentInfo || SEGMENT_UNKNOWN
}

/**
 * Due to segments now being broken into components in the new segment data model, `SEGMENT_LOOKUP` will now
 * include any rules and/or segment information for a segment of a specific `type` and `variant`. Rules applied
 * to a segment should be included in the returned `variantInfo` object as well as rules for a specific `variant`.
 * This function returns an updated version of the `variantInfo` such that `variantInfo` now also includes any
 * information specific to the `variant` of the segment and any rules the segment has to follow along with the
 * graphics information necessary to draw the segment.
 *
 * @param {Object} details - details for segment `type` and of a specific `variant`
 * @param {string} type
 * @param {Object} variantInfo - current variantInfo state, in shape of { graphics, elevation }
 * @returns {Object} variantInfo - updated variantInfo state with any rules or segment info overrides included
 */
function applySegmentInfoOverridesAndRules (details, type, variantInfo) {
  const { rules, ...segmentInfoOverrides } = details
  const segmentInfo = getSegmentInfo(type)

  return Object.assign(variantInfo, segmentInfo.rules, rules, segmentInfoOverrides)
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

  if (!segmentLookup || !segmentLookup.components) {
    return SEGMENT_UNKNOWN_VARIANT
  }

  const { components, ...details } = segmentLookup

  // 1) Loop through each component group that makes up the segment.
  let variantInfo = Object.entries(components).reduce((variantInfo, componentGroup) => {
    const [ group, groupItems ] = componentGroup

    // 2) For each component group, look up the segment information for every item that makes up the component group.
    // componentGroupInfo = [ { characteristics, rules, variants } ]
    const componentGroupInfo = getComponentGroupInfo(group, groupItems)

    // The "markings" component group does not have any variants, so we do not have to go through the variants in order
    // to get the sprite definitions.
    if (group === COMPONENT_GROUPS.MARKINGS) {
      Object.values(componentGroupInfo).forEach((groupItem) => { variantInfo.graphics.push(groupItem.graphics) })
    } else {
      // componentGroupVariants = [ { graphics } ]
      // 3) For each component group, look up the segment variant graphics for every item that makes up the component group.
      const componentGroupVariants = getComponentGroupVariants(groupItems, componentGroupInfo)

      if (componentGroupVariants.length) {
        // 4) Combine the variant graphics for each component group into one array
        componentGroupVariants.forEach((groupItemVariants) => { variantInfo.graphics.push(groupItemVariants) })
      }
    }

    return variantInfo
  }, { graphics: [] })

  // 5) Combine the variant graphics into one graphics definition object.
  variantInfo.graphics = mergeVariantGraphics(variantInfo.graphics)

  // Assuming a segment has one "lane" component, a segment's elevation can be found using the id
  // of the first item in the "lane" component group.
  // 6) Set the segment's elevation level based on the "lane" component.
  const lane = getSegmentComponentInfo(COMPONENT_GROUPS.LANES, components.lanes[0].id)
  variantInfo.elevation = lane.elevation

  // 7) Get any additional segment info specific to the variant and any segment rules.
  variantInfo = applySegmentInfoOverridesAndRules(details, type, variantInfo)
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
  const checkArrayEquality = (origValue, testValue) => {
    if (Array.isArray(origValue) && Array.isArray(testValue)) {
      return !differenceWith(origValue, testValue, isEqual).length
    }
  }

  return isEqualWith(originalVariantInfo, newVariantInfo, checkArrayEquality)
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
  // If segment lookup value not defined yet, return original variantInfo.
  if (!getSegmentLookup(type, variant)) {
    return segmentVariantInfo
  }

  const newVariantInfo = getSegmentVariantInfo(type, variant)

  if (verifyCorrectness(segmentVariantInfo, newVariantInfo)) {
    return newVariantInfo
  } else {
    console.log(`Incorrectly mapped segment of type "${type}" and variant "${variant}".`)
    console.log(segmentVariantInfo, newVariantInfo)
    return segmentVariantInfo
  }
}
