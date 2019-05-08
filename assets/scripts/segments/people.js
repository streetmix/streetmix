// TODO: Refactor this to have less magic numbers & stuff
import { images } from '../app/load_resources'
import { RandomGenerator } from '../util/random'
import { drawSegmentImage } from './view'
import { getSpriteDef } from './info'
import { TILE_SIZE, TILE_SIZE_ACTUAL } from './constants'
import { getVariantArray } from './variant_utils'
import PEOPLE from './people.json'

// TODO magic number - randSeed defaults to 35: why?
export function drawProgrammaticPeople (ctx, width, offsetLeft, groundLevel, randSeed = 35, multiplier, variantString, dpi) {
  let people = []
  let peopleWidth = 0

  // Depending on the type of sidewalk, we would have different densities of people.
  const variantArray = getVariantArray('sidewalk', variantString)

  let widthConst
  let widthRand

  switch (variantArray['sidewalk-density']) {
    case 'empty':
      return
    case 'sparse':
      widthConst = 60
      widthRand = 100
      break
    case 'normal':
      widthConst = 18
      widthRand = 60
      break
    case 'dense':
      widthConst = 18
      widthRand = 18
      break
  }

  const randomGenerator = new RandomGenerator()
  randomGenerator.seed = randSeed + 16 // TODO magic number - randSeed adds 16: why?

  let lastPersonId = 0

  while ((people.length === 0) || (peopleWidth < width - 40)) {
    let person

    do {
      const index = Math.floor(randomGenerator.rand() * PEOPLE.length)

      // Clone the person object
      person = Object.assign({}, PEOPLE[index])
    } while ((person.id === lastPersonId) || ((people.length === 0) && person.disallowFirst === true))

    lastPersonId = person.id
    person.left = peopleWidth

    var lastWidth = widthConst + (person.width * 12) - 24 + (randomGenerator.rand() * widthRand)

    peopleWidth += lastWidth
    people.push(person)
  }

  // This adjusts peopleWidth by the last value of lastWidth from the while loop above
  peopleWidth -= lastWidth

  let startLeft = (width - peopleWidth) / 2
  const firstPersonCorrection = (4 - people[0].width) * 12 / 2

  if (people.length === 1) {
    startLeft += firstPersonCorrection
  } else {
    const lastPersonCorrection = (4 - people[people.length - 1].width) * 12 / 2

    startLeft += (firstPersonCorrection + lastPersonCorrection) / 2
  }

  for (let person of people) {
    // Change person.id to 1-index instead of 0-index,
    // convert to string & zero-pad to two digits
    const type = ('0' + (person.id + 1).toString()).slice(-2)
    const id = 'people--people-' + type

    const sprite = getSpriteDef(id)
    const svg = images.get(id)

    const distanceFromGround = multiplier * TILE_SIZE * ((svg.height - (sprite.originY || 0)) / TILE_SIZE_ACTUAL)

    // TODO: Document / refactor magic numbers
    drawSegmentImage('people--people-' + type, ctx, undefined, undefined, undefined, undefined,
      offsetLeft + ((person.left - (5 * 12 / 2) - ((4 - person.width) * 12 / 2) + startLeft) * multiplier),
      groundLevel - distanceFromGround, undefined, undefined, multiplier, dpi)
  }
}
