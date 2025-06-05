import seedrandom from 'seedrandom'

import { images } from '../app/load_resources'
import { maxBy } from '../util/maxBy'
import { drawSegmentImage } from './view'
import { getSpriteDef } from './info'
import { TILE_SIZE, TILE_SIZE_ACTUAL } from './constants'

const DEFAULT_SELECTION_WEIGHT = 50
const DEFAULT_SCATTER_SPACING_MIN = 0
const DEFAULT_SCATTER_SPACING_MAX = 1 // in meters

interface ScatterableEntity {
  // `id` is a unique identifier. For drawing segments, this `id`
  // corresponds to the sprite's "filename", but that association is not
  // particularly meaningful for picking objects.
  id: string
  width: number

  // (optional) alternative sprites that can be picked in place of the primary
  // sprite. This can be variations (e.g. a person turned around, different
  // outfits, different plants, etc). This is an array of ids that correspond
  // to other "filenames". All alts have an equal chance of being picked as
  // the primary, and all other properties (e.g. `width`) apply to alts.
  alts?: string[]

  // (optional) affects the rarity of this entity. Higher values mean it has a
  // higher chance of being selected, relative to other entities in the same
  // pool. Lower numbers are rarer. If not provided, an entity's default weight
  // is 50.
  weight?: number

  // (optional) if `true`, prevent this entity from being selected first in a
  // list (reserved for unique or special entities that should not be the only
  // object displayed if we only have space for one object.)
  disallowFirst?: boolean

  // Don't provide this value; it's added by `getRandomObjects()`
  left?: number

  // (optional)
  originY?: number

  // Allow extending this with arbitrary properties
  [x: string]: unknown
}

type EntityPool = ScatterableEntity[]

/**
 * Given a pool of entities, with defined widths, get the maximum width value
 * This number is used during rendering to adjust sprites for center alignment
 */
function getSpriteMaxWidth (pool: EntityPool): number {
  return maxBy(pool, (s) => s.width).width
}

/**
 * Using the random generator function, perform a weighted random selection
 * from a pool of entities, then clone and return the object for that entity.
 */
function pickRandomEntityFromPool (
  pool: EntityPool,
  randomGenerator: seedrandom.PRNG
): ScatterableEntity {
  const totalWeight = pool.reduce((sum, entity) => {
    return sum + (entity.weight ?? DEFAULT_SELECTION_WEIGHT)
  }, 0)
  const randomNumber = Math.floor(randomGenerator() * totalWeight)

  let pickedEntityIndex = 0
  let searchWeight = 0

  for (let i = 0; i < pool.length; i++) {
    const entity = pool[i]
    searchWeight += entity.weight ?? DEFAULT_SELECTION_WEIGHT

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
 */
export function getRandomObjects (
  pool: EntityPool,
  maxWidth: number, // width of segment, in meters
  randSeed: string = '9123984', // default randSeed if one is not provided
  minSpacing: number, // in meters (controls density)
  maxSpacing: number, // in meters (controls density)
  maxSpriteWidth: number, // maximum sprite width in the pool (via `getSpriteMaxWidth()`)
  spacingAdjustment: number = 0, // additional value to adjust spacing, in meters
  padding: number = 0 // buffer zone at segment sides
): [EntityPool, number] {
  // Initialize a random generator function with `randSeed` here. Don't
  // recreate it and definitely not within loops, which is not performant.
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
    let object: ScatterableEntity

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
 */
export function drawScatteredSprites (
  sprites: EntityPool,
  ctx: CanvasRenderingContext2D,
  width: number,
  offsetLeft: number,
  groundLevel: number,
  randSeed: string,
  minSpacing: number = DEFAULT_SCATTER_SPACING_MIN,
  maxSpacing: number = DEFAULT_SCATTER_SPACING_MAX,
  adjustment: number = 0,
  padding: number = 0,
  multiplier: number,
  dpi: number
): void {
  // Pool must be an array of objects. If an array of strings
  // is passed in, look up its sprite information from the string
  // id and convert to object.
  const pool: EntityPool = sprites.map((sprite): ScatterableEntity => {
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

  // Initialize another random generator function with `randSeed` here
  // TODO: combine with the one used inside getRandomObjects()?
  const randomGenerator = seedrandom(randSeed)

  for (const object of objects) {
    let id = object.id

    // if object has alts, draw one. right not all alts + primary id has an
    // equal chance of being chosen
    if (object.alts && object.alts.length > 0) {
      const pool = [id, ...object.alts]
      const pick = Math.floor(randomGenerator() * pool.length)
      id = pool[pick]
    }

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
        ((object.left ?? 0) -
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
