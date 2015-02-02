var TILESET_IMAGE_VERSION = 55;
var TILESET_POINT_PER_PIXEL = 2.0;
var TILE_SIZE = 12; // pixels
var TILESET_CORRECTION = [null, 0, -84, -162];

var IMAGES_TO_BE_LOADED = [
  '/images/tiles-1.png',
  '/images/tiles-2.png',
  '/images/tiles-3.png',
  '/images/sky-front.png',
  '/images/sky-rear.png'
];

var images = [];
var imagesToBeLoaded;

function _onImageLoaded() {
  imagesToBeLoaded--;
  document.querySelector('#loading-progress').value++;

  _checkIfEverythingIsLoaded();
}

function _loadImages() {
  imagesToBeLoaded = IMAGES_TO_BE_LOADED.length;

  for (var i in IMAGES_TO_BE_LOADED) {
    var url = IMAGES_TO_BE_LOADED[i];

    images[url] = document.createElement('img');
    images[url].addEventListener('load', _onImageLoaded);
    images[url].src = url + '?v' + TILESET_IMAGE_VERSION;
  }

  document.querySelector('#loading-progress').value = 0;
  document.querySelector('#loading-progress').max = imagesToBeLoaded + 5;
}
