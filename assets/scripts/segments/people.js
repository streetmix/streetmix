// TODO: Refactor this to have less magic numbers & stuff
import seedrandom from 'seedrandom'
import { images } from '../app/load_resources'
import { drawSegmentImage } from './view'
import { getSpriteDef } from './info'
import { TILE_SIZE, TILE_SIZE_ACTUAL } from './constants'
import PEOPLE from './people.json'

// Buffer area to not render people in
// This will be split on either side (2 on the left, 2 on the right)
// Not 4 on both sides
const SEGMENT_PADDING = 4 // in feet

// Adjust spacing between people to be slightly closer
const PERSON_SPACING_ADJUSTMENT = -2 // in feet

// Maximum width of a person sprite, used to help adjust sprites for alignment
const PERSON_SPRITE_MAX_WIDTH = 4 // in feet

const PERSON_SPRITE_OFFSET_Y = 10 // in pixels

/**
 * Programatically draw a crowd of people to a canvas
 *
 * @todo refactor to general use case
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} width - width of segment to draw in, in feet
 * @param {Number} offsetLeft
 * @param {Number} groundLevel - height at which to draw people
 * @param {Number} randSeed - create a consistent random sequence of people across renders
 * @param {Number} minSpacing - mininum distance between each sprite (in pixels?) (controls density)
 * @param {Number} maxSpacing - maximum distance between each sprite (in pixels?) (controls density)
 * @param {Number} multiplier
 * @param {Number} dpi
 */
export function drawProgrammaticPeople (
  ctx,
  width,
  offsetLeft,
  groundLevel,
  randSeed,
  minSpacing,
  maxSpacing,
  multiplier,
  dpi
) {
  const people = []
  let peopleWidth = 0

  const randomGenerator = seedrandom(randSeed)

  let lastPersonId = 0
  let thisPersonId = null

  while (people.length === 0 || peopleWidth < width - SEGMENT_PADDING) {
    let person

    do {
      const index = Math.floor(randomGenerator() * PEOPLE.length)
      thisPersonId = index

      // Clone the person object
      person = Object.assign({}, PEOPLE[index])
    } while (
      thisPersonId === lastPersonId ||
      (people.length === 0 && person.disallowFirst === true)
    )

    lastPersonId = thisPersonId
    person.left = peopleWidth

    // Calculate the amount of space to allocate to this person,
    // creating space for placing the next person (if any).
    // `minSpacing` here is the spacing to the left of the person,
    // in feet. In most cases ('normal' and 'dense') we're saying
    // each person has a 1.5-ft of space to the left of them.
    // `maxSpacing` is a random amount betwween it and 0 to allocate
    // to the right of the person.
    // This takes into account the person's defined sprite width.
    // This is further tweaked by adding a PERSON_SPACING_ADJUSTMENT
    // constant value. Currently, this is a negative value which causes
    // sprites to be rendered slightly closer together. This is because
    // sprites are generally less wide than the sprite's defined width
    // (which is based on the width of the viewbox, not the content itself.)
    // All of these units are using feet measurements, and we multiply this
    // by TILE_SIZE because later calculations are also doing conversions.
    // TODO: Refactor this multiplication out in conjunction with later
    // calculation steps.
    var lastWidth =
      minSpacing +
      person.width +
      PERSON_SPACING_ADJUSTMENT +
      randomGenerator() * maxSpacing

    peopleWidth += lastWidth
    people.push(person)
  }

  // After exiting the loop, remove the space allocated for the next person,
  // by undoing the addition of `lastWidth` to `peopleWidth`.
  // TODO: Refactor this behavior.
  peopleWidth -= lastWidth

  let startLeft = (width - peopleWidth) / 2
  const firstPersonCorrection = (PERSON_SPRITE_MAX_WIDTH - people[0].width) / 2
  const lastPersonCorrection =
    (PERSON_SPRITE_MAX_WIDTH - people[people.length - 1].width) / 2

  if (people.length === 1) {
    startLeft += firstPersonCorrection
  } else {
    startLeft += (firstPersonCorrection + lastPersonCorrection) / 2
  }

  for (const person of people) {
    const id = `people--${person.id}`
    const sprite = getSpriteDef(id)
    const svg = images.get(id)

    const distanceFromGround =
      multiplier *
      TILE_SIZE *
      ((svg.height - (sprite.originY ?? PERSON_SPRITE_OFFSET_Y)) /
        TILE_SIZE_ACTUAL)

    // TODO: Document / refactor magic numbers
    drawSegmentImage(
      id,
      ctx,
      undefined,
      undefined,
      undefined,
      undefined,
      offsetLeft +
        (person.left -
          // TODO: his number was multiplied by TILE_SIZE, so 5 feet for what?
          5 / 2 -
          (PERSON_SPRITE_MAX_WIDTH - person.width) / 2 +
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
