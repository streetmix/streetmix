// TODO: Refactor this to have less magic numbers & stuff
import { RandomGenerator } from '../util/random'
import { drawSegmentImageSVG } from './view'
import { getVariantArray } from './variant_utils'

const PERSON_TYPES = 31
const PERSON_CAN_GO_FIRST = [true, true, true, true, true, true, true, true, true, true,
  true, true, true, true, true, true, true, true, false, false,
  true, true, true, true, true, true, true, true, true, true,
  true]
const PERSON_WIDTH = [2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
  2, 2, 2, 3, 2, 3, 3, 3, 3, 3,
  1, 1, 3, 4, 2, 3, 2, 3, 4, 3,
  2]

// TODO magic number - randSeed defaults to 35: why?
export function drawProgrammaticPeople (ctx, width, offsetLeft, offsetTop, randSeed = 35, multiplier, variantString) {
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

  let lastPersonType = 0
  let peopleCount = 0

  while ((!peopleCount) || (peopleWidth < width - 40)) {
    let person = {
      left: peopleWidth
    }

    /* eslint-disable no-unmodified-loop-condition */
    do {
      person.type = Math.floor(randomGenerator.rand() * PERSON_TYPES)
    } while ((person.type === lastPersonType) || ((peopleCount === 0) && !PERSON_CAN_GO_FIRST[person.type]))
    /* eslint-enable no-unmodified-loop-condition */

    lastPersonType = person.type

    var lastWidth = widthConst + PERSON_WIDTH[person.type] * 12 - 24 + randomGenerator.rand() * widthRand

    peopleWidth += lastWidth
    people.push(person)
    peopleCount++
  }

  // This adjusts peopleWidth by the last value of lastWidth from the while loop above
  peopleWidth -= lastWidth

  let startLeft = (width - peopleWidth) / 2
  let firstPersonCorrection = (4 - PERSON_WIDTH[people[0].type]) * 12 / 2

  if (people.length === 1) {
    startLeft += firstPersonCorrection
  } else {
    let lastPersonCorrection = (4 - PERSON_WIDTH[people[people.length - 1].type]) * 12 / 2

    startLeft += (firstPersonCorrection + lastPersonCorrection) / 2
  }

  for (let person of people) {
    // Change person.type to 1-index instead of 0-index,
    // convert to string & zero-pad to two digits
    let type = ('0' + (person.type + 1).toString()).slice(-2)

    // TODO: Document / refactor magic numbers
    drawSegmentImageSVG('people--people-' + type, ctx,
      offsetLeft + (person.left - 5 * 12 / 2 - (4 - PERSON_WIDTH[person.type]) * 12 / 2 + startLeft) * multiplier,
      offsetTop + 37 * multiplier,
      12 * 5 * multiplier, 24 * 4 * multiplier)
  }
}
