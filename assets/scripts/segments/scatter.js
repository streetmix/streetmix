import seedrandom from 'seedrandom'
import { images } from '../app/load_resources'
import { maxBy } from '../util/maxBy'
import { drawSegmentImage } from './view'
import { getSpriteDef } from './info'
import { TILE_SIZE, TILE_SIZE_ACTUAL } from './constants'

const DEFAULT_SELECTION_WEIGHT = 50
const DEFAULT_SCATTER_SPACING_MIN = 0
const DEFAULT_SCATTER_SPACING_MAX = 1 // in meters

/**
 * Given a pool of entities, with defined widths, get the maximum width value
 * This number is used during rendering to adjust sprites for center alignment
 *
 * @param {Array} pool - of objects to draw from
 * @returns {Number} - maximum street width in meters
 */
function getSpriteMaxWidth (pool) {
  return maxBy(pool, (s) => s.width).width
}

/**
 * Using the random generator function, perform a weighted random selection
 * from a pool of entities, then clone and return the object for that entity.
 *
 * @param {Array} pool - of entities to draw from. See the heredoc for
 *    getRandomObjects() for the expected data structure of entities.
 * @param {Function} randomGenerator - random generator function created
 *    from randSeed. Do not recreate random generator function within a loop,
 *    because that is not performant.
 */
function pickRandomEntityFromPool (pool, randomGenerator) {
  const totalWeight = pool.reduce((sum, entity) => {
    return sum + (entity.weight || DEFAULT_SELECTION_WEIGHT)
  }, 0)
  const randomNumber = Math.floor(randomGenerator() * totalWeight)

  let pickedEntityIndex
  let searchWeight = 0

  for (let i = 0; i < pool.length; i++) {
    const entity = pool[i]
    searchWeight += entity.weight || DEFAULT_SELECTION_WEIGHT

    if (randomNumber < searchWeight) {
      pickedEntityIndex = i
      break
    }
  }

  // Clone the entity and return it
  return Object.assign({}, pool[pickedEntityIndex])
}

/**
 * Given a pool of entities, and a few parameters, draw continuously from that
 * pool until it has fully populated the given segment width. Because it uses
 * segment width to know when to stop drawing, this function also does double
 * duty by setting distances between objects.
 *
 * This function is exported for unit testing only.
 *
 * @param {Array} pool - of entities to draw from
 *   Each entity is an object type with the following properties:
 *     - id {string} - a unique identifier. For drawing segments, this `id`
 *       corresponds to the sprite's "filename", but that association is not
 *       particularly meaningful for picking objects.
 *     - name {string} - (optional) human readable name of the entity
 *     - width {number} - the width that this entity occupies
 *     - weight {number} - (optional) affects the rarity of this entity. The
 *       higher the value, the higher the chance of it being selected, relative
 *       to others. The default weight value is 50. Lower numbers are rarer, higher
 *       numbers are more common.
 *     - disallowFirst {boolean} - (optional) if true, prevent this entity from
 *       being selected first in a list (reserved for unique or special entities
 *       that should not be the only object displayed if we only have space for
 *       one object.)
 * @param {Number} width - of segment to populate, in meters
 * @param {Number} randSeed - ensures a consistent sequence of objects across renders
 * @param {Number} minSpacing - minimum spacing between each object, in meters (controls density)
 * @param {Number} maxSpacing - maximt spacing between each object, in meters (controls density)
 * @param {Number} maxSpriteWidth - maximum sprite width in the pool (via `getSpriteMaxWidth()`)
 * @param {Number} spacingAdjustment - additional value to adjust spacing, in meters
 * @param {Number} padding - buffer zone at segment sides to avoid drawing in
 */
export function getRandomObjects (
  pool,
  maxWidth,
  randSeed = 9123984, // self defined randSeed if one is not provided
  minSpacing,
  maxSpacing,
  maxSpriteWidth,
  spacingAdjustment = 0,
  padding = 0
) {
  const randomGenerator = seedrandom(randSeed)

  const objects = []
  let runningWidth = 0
  let previousEntityId = null
  let currentEntityId = null
  let lastWidth = 0

  // Pick (draw) objects from the pool until we have at least one object, and
  // until we hit the maximum width given. `padding` is used to so that
  // we don't render objects too closely to the edge of a segment.
  while (objects.length === 0 || runningWidth < maxWidth - padding * 2) {
    let object

    // Special choosing logic only for larger pools.
    if (pool.length >= 4) {
      do {
        object = pickRandomEntityFromPool(pool, randomGenerator)
        currentEntityId = object.id
      } while (
        // Don't pick the same object twice in a row, and avoid picking
        // certain objects as the first object in a list. This is because
        // some objects are "special" and look strange when on their own,
        // but can diversify when included in a list.
        currentEntityId === previousEntityId ||
        (objects.length === 0 && object.disallowFirst === true)
      )
    } else {
      object = pickRandomEntityFromPool(pool, randomGenerator)
      currentEntityId = object.id
    }

    previousEntityId = currentEntityId
    object.left = runningWidth

    // Calculate the amount of space to allocate to this object,
    // creating space for placing the next object (if any).
    // First, take into account the object's defined sprite width.
    // Then add `minSpacing`, the minimum spacing between sprites.
    // Next, add a variable distance between sprites. This number
    // is randomly chosen between `minSpacing` and `maxSpacing.`
    // The `randomGenerator()` must be used to ensure that this random
    // number is consistent across renders.
    // Lastly, this is further tweaked by adding a `spacingAdjustment`
    // value, which can adjust overall density. In the case of people,
    // this value makes sprites slightly denser, to account for the
    // transparent space around each person sprite's defined width.
    lastWidth =
      object.width +
      minSpacing +
      randomGenerator() * (maxSpacing - minSpacing) +
      spacingAdjustment
    runningWidth += lastWidth

    objects.push(object)
  }

  // After exiting the loop, remove the space allocated for the next object,
  // by undoing the addition of `lastWidth` to `runningWidth`.
  // TODO: Refactor this behavior.
  const totalWidth = runningWidth - lastWidth

  // The left position of sprites are along the left edge.
  // This correction adjusts the actual left render position, based on the
  // width of the first and last sprites, to better balance centering the
  // sprites within the segment.
  const firstObjectCorrection = (maxSpriteWidth - objects[0].width) / 2
  const lastObjectCorrection =
    (maxSpriteWidth - objects[objects.length - 1].width) / 2

  let startLeft = (maxWidth - totalWidth) / 2
  if (objects.length === 1) {
    startLeft += firstObjectCorrection
  } else {
    startLeft += (firstObjectCorrection + lastObjectCorrection) / 2
  }

  return [objects, startLeft]
}

/**
 * General use case of rendering scattered sprites
 *
 * @param {Array} sprite - id of sprite to draw
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} width - width of segment to populate, in meters
 * @param {Number} offsetLeft
 * @param {Number} groundLevel - height at which to draw people
 * @param {Number} randSeed - ensures a consistent sequence of objects across
 *    renders
 * @param {Number} minSpacing - left spacing between each object, in meters
 *    (controls density)
 * @param {Number} maxSpacing - maximum right spacing between each object, in
 *    meters (controls density)
 * @param {Number} adjustment - further spacing adjustment value
 * @param {Number} padding - buffer zone at segments sides to avoid drawing in
 * @param {Number} multiplier
 * @param {Number} dpi
 */
export function drawScatteredSprites (
  sprites,
  ctx,
  width,
  offsetLeft,
  groundLevel,
  randSeed,
  minSpacing = DEFAULT_SCATTER_SPACING_MIN,
  maxSpacing = DEFAULT_SCATTER_SPACING_MAX,
  adjustment = 0,
  padding = 0,
  multiplier,
  dpi
) {
  // Pool must be an array of objects. If an array of strings
  // is passed in, look up its sprite information from the string
  // id and convert to object.
  const pool = sprites.map((sprite) => {
    if (typeof sprite === 'string') {
      const svg = images.get(sprite)
      return {
        id: sprite,
        width: svg.width / TILE_SIZE_ACTUAL
      }
    }

    // Pass objects through as-is
    return sprite
  })

  const maxSpriteWidth = getSpriteMaxWidth(pool)
  const [objects, startLeft] = getRandomObjects(
    pool,
    width,
    randSeed,
    minSpacing,
    maxSpacing,
    maxSpriteWidth,
    adjustment,
    padding
  )

  for (const object of objects) {
    const id = object.id
    const sprite = getSpriteDef(id)
    const svg = images.get(id)

    const distanceFromGround =
      multiplier *
      TILE_SIZE *
      ((svg.height - (sprite.originY ?? object.originY ?? 0)) /
        TILE_SIZE_ACTUAL)

    drawSegmentImage(
      id,
      ctx,
      undefined,
      undefined,
      undefined,
      undefined,
      offsetLeft +
        (object.left -
          // Adjust offset according to the svg viewbox width
          svg.width / TILE_SIZE_ACTUAL / 2 -
          // Adjust according to sprite's defined "hitbox" width
          (maxSpriteWidth - object.width) / 2 +
          startLeft) *
          TILE_SIZE *
          multiplier,
      groundLevel - distanceFromGround,
      undefined,
      undefined,
      multiplier,
      dpi
    )
  }
}
