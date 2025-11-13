import { unique } from '@streetmix/utils'

import SEGMENT_COMPONENTS from './components.json' with { type: 'json' }
import SEGMENT_LOOKUP from './segment-lookup.json' with { type: 'json' }
import { SEGMENT_UNKNOWN, SEGMENT_UNKNOWN_VARIANT } from './info.js'

export const COMPONENT_GROUPS = {
  LANES: 'lanes',
  MARKINGS: 'markings',
  OBJECTS: 'objects',
  VEHICLES: 'vehicles',
  EFFECTS: 'effects'
}

/**
 * Retrieves the necessary information required to map the old segment data
 * model to the new segment data model for the specific segment using the
 * segment's `type` and `variant`.
 *
 * @param {string} type
 * @param {string} variant
 * @returns {object|boolean} segmentLookup - returns an object in the shape of:
 *   { details, components: { lanes, objects, vehicles } } or `false` if not found.
 */
export function getSegmentLookup (type, variant) {
  return SEGMENT_LOOKUP[type]?.details?.[variant]
}

/**
 * Retrieves the specified segment component information from the new segment
 * data model using the component group and the segment component's id.
 *
 * @param {string} group - component group, one of values "lanes", "vehicles"
 *    or "objects"
 * @param {string} id - name of segment component, e.g. "scooter"
 * @returns {object} segmentInfo
 */
export function getSegmentComponentInfo (group, id) {
  return SEGMENT_COMPONENTS[group]?.[id] ?? SEGMENT_UNKNOWN
}

/**
 * Retrieves the information for all items that make up a particular component
 * group by looking up the component group and item id in `SEGMENT_COMPONENTS`.
 *
 * @param {string} group - component group name (i.e. `markings`, `lanes`,
 *    `objects`, or `vehicles`)
 * @param {Array} groupItems - items that make up the component group in shape
 *    of [{ id, variants }]
 * @returns {object} componentGroupInfo - returns object in shape of { id:
 *    { characteristics, rules, variants } }
 */
function getComponentGroupInfo (group, groupItems) {
  return groupItems.reduce((obj, item) => {
    obj[item.id] = getSegmentComponentInfo(group, item.id)
    return obj
  }, {})
}

/**
 * Allows for customizable positioning of sprites based on offsetX and offsetY.
 * If a sprite has an offset, return a graphics object in shape of { id,
 * offsetX, offsetY }. If no offset, return the original graphics object.
 *
 * @param {object} graphics
 * @param {number|undefined} offsetX
 * @param {number|undefined} offsetY
 * @returns {object} graphicsWithOffsets
 */
function applyOffsetsIfAnyToSprites (graphics, offsetX, offsetY) {
  if (!offsetX && !offsetY) return graphics

  return Object.entries(graphics).reduce((graphicsWithOffsets, [key, id]) => {
    graphicsWithOffsets[key] = { id, offsetX, offsetY }
    return graphicsWithOffsets
  }, {})
}

/**
 * Retrieves all graphics definitions for the component group based on each
 * `variant` specified for each component group item.
 *
 * @param {Array} groupItems - items that make up the component group in shape
 *    of [ { id, variants } ]
 * @param {object} componentGroupInfo - definition of each item from
 *    `SEGMENT_COMPONENTS` in shape of: { id: { characteristics, rules,
 *     variants } }
 * @returns {Array} componentGroupVariants - returns array of graphic
 *    definitions in shape of [ { graphics } ]
 */
function getComponentGroupVariants (groupItems, componentGroupInfo) {
  return groupItems.reduce((array, item) => {
    const { id, offsetX, offsetY, variants } = item
    // groupItemVariants - all variants possible for the particular group item
    const groupItemVariants =
      componentGroupInfo[id] && componentGroupInfo[id].variants

    if (groupItemVariants && variants) {
      Object.entries(variants).forEach(([variantName, variantKey]) => {
        // variantInfo - graphics definition for specific variants defined by
        // group item
        let variantInfo =
          groupItemVariants[variantName] ?? SEGMENT_UNKNOWN_VARIANT

        const variantKeys = Array.isArray(variantKey)
          ? variantKey
          : [variantKey]
        variantKeys.forEach((key) => {
          variantInfo = variantInfo?.[key] ?? SEGMENT_UNKNOWN_VARIANT
        })

        const graphics = applyOffsetsIfAnyToSprites(
          variantInfo.graphics,
          offsetX,
          offsetY
        )
        array.push(graphics)
      })
    }

    return array
  }, [])
}

/**
 * A segment may contain multiple graphics for the same graphics type ('left',
 * 'right', 'repeat', 'center'). When encountering a new graphic for the same
 * graphics type, this function creates a new array that contains both the new
 * graphic as well as the existing graphics.
 *
 * @param {Array|string} target
 * @param {Array|string} source
 * @returns {Array} graphicsInfo
 */
function appendVariantSprites (target, source) {
  const targetArray = Array.isArray(target) ? target : [target]
  const sourceArray = Array.isArray(source) ? source : [source]

  const graphicsInfo = targetArray.concat(sourceArray)
  return unique(graphicsInfo)
}

/**
 * Merges the array of graphic definition objects needed to render the segment
 * into a single object.
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
 * Due to segments now being broken into components in the new segment data
 * model, `SEGMENT_LOOKUP` will now include any rules and/or segment
 * information for a segment of a specific `type` and `variant`. Rules applied
 * to a segment should be included in the returned `variantInfo` object as well
 * as rules for a specific `variant`. This function returns a `variantInfo`
 * object with information specific to the `variant` of the segment and any
 * rules the segment has to follow.
 *
 * @param {Object} details - details for segment `type` and of a specific
 *    `variant`
 * @param {Object} segmentRules - rules applied to the segment `type`
 * @returns {Object} variantInfo - object with any rules or segment info
 *    overrides
 */
export function applySegmentInfoOverridesAndRules (details, segmentRules) {
  const { rules, ...segmentInfoOverrides } = details
  return Object.assign({}, segmentRules, rules, segmentInfoOverrides)
}

/**
 * Based on the list of `lanes`, `markings`, `objects`, and/or `vehicles`
 * components that makes up the segment `type` and `variant`, this function
 * creates a graphics object with all the sprite definitions needed to
 * render the segment.
 *
 * @param {Object} components - all segment components that make up the segment
 *   `type` and `variant`
 * @returns {Object} sprites - all sprite definitions necessary to render the
 *    segment
 */
export function getSegmentSprites (components) {
  // 1) Loop through each component group that makes up the segment.
  const sprites = Object.entries(components).reduce(
    (graphicsArray, componentGroup) => {
      const [group, groupItems] = componentGroup

      // 2) For each component group, look up the segment information for every
      // item that makes up the component group.
      // componentGroupInfo = [ { characteristics, rules, variants } ]
      const componentGroupInfo = getComponentGroupInfo(group, groupItems)

      // The "markings" component group does not have any variants, so we do
      // not have to go through the variants in order to get the sprite
      // definitions.
      if (group === COMPONENT_GROUPS.MARKINGS) {
        Object.values(componentGroupInfo).forEach((groupItem) => {
          graphicsArray.push(groupItem.graphics)
        })
      } else {
        // componentGroupVariants = [ { graphics } ]
        // 3) For each component group, look up the segment variant graphics
        // for every item that makes up the component group.
        const componentGroupVariants = getComponentGroupVariants(
          groupItems,
          componentGroupInfo
        )

        if (componentGroupVariants.length) {
          // 4) Combine the variant graphics for each component group into one
          // array
          componentGroupVariants.forEach((groupItemVariants) => {
            graphicsArray.push(groupItemVariants)
          })
        }
      }

      return graphicsArray
    },
    []
  )

  // 5) Combine the variant graphics into one graphics definition object.
  return mergeVariantGraphics(sprites)
}
