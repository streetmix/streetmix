// TODO: Refactor this to have less magic numbers & stuff
import seedrandom from 'seedrandom'
import { images } from '../app/load_resources'
import { drawSegmentImage } from './view'
import { getSpriteDef } from './info'
import { TILE_SIZE, TILE_SIZE_ACTUAL } from './constants'
import PEOPLE from './people.json'

const PERSON_SPRITE_OFFSET_Y = 10

/**
 * Programatically draw a crowd of people to a canvas
 *
 * @todo refactor to general use case
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} width
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

  // TODO: Document magic number `40` or replace with defined constants
  while (people.length === 0 || peopleWidth < width - 40) {
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

    // TODO: Document magic numbers or replace with defined constants
    var lastWidth =
      minSpacing + person.width * 12 - 24 + randomGenerator() * maxSpacing

    peopleWidth += lastWidth
    people.push(person)
  }

  // This adjusts peopleWidth by the last value of lastWidth from the while loop above
  peopleWidth -= lastWidth

  let startLeft = (width - peopleWidth) / 2
  const firstPersonCorrection = ((4 - people[0].width) * 12) / 2

  if (people.length === 1) {
    startLeft += firstPersonCorrection
  } else {
    const lastPersonCorrection =
      ((4 - people[people.length - 1].width) * 12) / 2

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
          (5 * 12) / 2 -
          ((4 - person.width) * 12) / 2 +
          startLeft) *
          multiplier,
      groundLevel - distanceFromGround,
      undefined,
      undefined,
      multiplier,
      dpi
    )
  }
}
