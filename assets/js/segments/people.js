var PERSON_TYPES = 31;
var PERSON_CAN_GO_FIRST = [true, true, true, true, true, true, true, true, true, true,
                           true, true, true, true, true, true, true, true, false, false,
                           true, true, true, true, true, true, true, true, true, true,
                           true];
var PERSON_WIDTH = [2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
                    2, 2, 2, 3, 2, 3, 3, 3, 3, 3,
                    1, 1, 3, 4, 2, 3, 2, 3, 4, 3,
                    2];
var PERSON_TILESET_WRAP = 10;

function _drawProgrammaticPeople(ctx, width, offsetLeft, offsetTop, randSeed, multiplier, variantString) {
  var people = [];
  var peopleWidth = 0;

  var variantArray = _getVariantArray('sidewalk', variantString);

  switch (variantArray['sidewalk-density']) {
    case 'empty':
      return;
    // TODO const
    case 'sparse':
      var widthConst = 60;
      var widthRand = 100;
      break;
    case 'normal':
      var widthConst = 18;
      var widthRand = 60;
      break;
    case 'dense':
      var widthConst = 18;
      var widthRand = 18;
      break;
  }

  var randSeed = (randSeed || 35) + 16;

  var randomGenerator = new RandomGenerator();
  randomGenerator.seed(randSeed);

  var lastPersonType = 0;

  var peopleCount = 0;

  while ((!peopleCount) || (peopleWidth < width - 40)) {
    var person = {};
    person.left = peopleWidth;
    do {
      person.type = Math.floor(randomGenerator.rand() * PERSON_TYPES);
    } while ((person.type == lastPersonType) || ((peopleCount == 0) && !PERSON_CAN_GO_FIRST[person.type]));
    lastPersonType = person.type;

    var lastWidth = widthConst + PERSON_WIDTH[person.type] * 12 - 24 + randomGenerator.rand() * widthRand;

    peopleWidth += lastWidth;
    people.push(person);
    peopleCount++;
  }
  peopleWidth -= lastWidth;

  var startLeft = (width - peopleWidth) / 2;

  var firstPersonCorrection = (4 - PERSON_WIDTH[people[0].type]) * 12 / 2;
  if (people.length == 1) {
    startLeft += firstPersonCorrection;
  } else {
    var lastPersonCorrection = (4 - PERSON_WIDTH[people[people.length - 1].type]) * 12 / 2;

    startLeft += (firstPersonCorrection + lastPersonCorrection) / 2;
  }

  for (var i in people) {
    var person = people[i];
    // TODO const

    var typeX = person.type % PERSON_TILESET_WRAP;
    var typeY = Math.floor(person.type / PERSON_TILESET_WRAP);

    _drawSegmentImage(2, ctx,
        1008 + 12 * 5 * typeX, 1756 / 2 + 24 * 4 * typeY,
        12 * 5, 24 * 4,
        offsetLeft + (person.left - 5 * 12 / 2 - (4 - PERSON_WIDTH[person.type]) * 12 / 2 + startLeft) * multiplier,
        offsetTop + 37 * multiplier,
        12 * 5 * multiplier, 24 * 4 * multiplier);
  }
}
