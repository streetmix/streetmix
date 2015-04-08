var DEFAULT_NAME = msg('DEFAULT_STREET_NAME');

// Output using cmap2file as per
// http://www.typophile.com/node/64147#comment-380776
var STREET_NAME_FONT_GLYPHS = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}~¡¢£¤¥¦§¨©ª«¬®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿĀāĂăĆćĈĉĊċČčĎďĒĔĕĖėĜĝĞğĠġĤĥĨĩĪīĬĭİıĴĵĹĺĽľŁłŃŇňŌōŎŏŐőŒœŔŕŘřŚśŜŝŞşŠšŤťŨũŪūŬŭŮůŰűŴŵŶŷŸŹźŻżŽžƒˆˇ˘˙˚˛˜˝–—‘’‚“”„†‡•…‰‹›⁄€™−';
var STREET_NAME_REMIX_SUFFIX = '(remix)';
var MAX_STREET_NAME_WIDTH = 50;

function _streetNameNeedsUnicodeFont(name) {
  var needUnicodeFont = false;
  for (var i in name) {
    if (STREET_NAME_FONT_GLYPHS.indexOf(name.charAt(i)) == -1) {
      needUnicodeFont = true;
      break;
    }
  }

  return needUnicodeFont;
}

function _updateStreetNameFont(el) {
  var name = el.querySelector('div').innerHTML;

  var needUnicodeFont = _streetNameNeedsUnicodeFont(name);

  if (!needUnicodeFont) {
    el.classList.remove('fallback-unicode-font');
  } else {
    el.classList.add('fallback-unicode-font');
  }
}

function _updateStreetName() {
  $('#street-name > div').text(street.name);

  _updateStreetNameFont(document.querySelector('#street-name'));

  _resizeStreetName();

  _updateStreetMetadata();
  _updateStreetNameCanvasPos();

  _unifyUndoStack();
  _updatePageUrl();
  _updatePageTitle();
}

function _normalizeStreetName(name) {
  name = $.trim(name);

  if (name.length > MAX_STREET_NAME_WIDTH) {
    name = name.substr(0, MAX_STREET_NAME_WIDTH) + '…';
  }

  return name;
}

function _askForStreetName() {
  _ignoreWindowFocusMomentarily();

  var newName = prompt(msg('PROMPT_NEW_STREET_NAME'), street.name);

  if (newName) {
    street.name = _normalizeStreetName(newName);

    _updateStreetName();
    _saveStreetToServerIfNecessary();
    _updateStreetNameCanvasPos();
  }
}

function _resizeStreetName() {
  var streetNameCanvasWidth =
      document.querySelector('#street-name-canvas').offsetWidth;
  var streetNameWidth =
      document.querySelector('#street-name > div').scrollWidth;

  if (streetNameWidth > streetNameCanvasWidth) {
    document.querySelector('#street-name').style.width =
        streetNameCanvasWidth + 'px';
  } else {
    document.querySelector('#street-name').style.width = 'auto';
  }
}

function _updateStreetNameCanvasPos() {
  var menuEl = document.querySelector('#top-menu-bar ul.right');
  var menuElPos = _getElAbsolutePos(menuEl);

  var streetNameEl = document.querySelector('#street-name');
  var streetNameElPos = _getElAbsolutePos(streetNameEl);

  document.querySelector('#street-name-canvas').classList.add('no-movement');
  if (streetNameElPos[0] + streetNameEl.offsetWidth > menuElPos[0]) {
    document.querySelector('#street-name-canvas').classList.add('move-down-for-menu');
  } else {
    document.querySelector('#street-name-canvas').classList.remove('move-down-for-menu');
  }

  window.setTimeout(function() {
    document.querySelector('#street-name-canvas').classList.remove('no-movement');
  }, 50);
}

function _addRemixSuffixToName() {
  if (street.name.substr(street.name.length - STREET_NAME_REMIX_SUFFIX.length,
      STREET_NAME_REMIX_SUFFIX.length) != STREET_NAME_REMIX_SUFFIX) {
    street.name += ' ' + STREET_NAME_REMIX_SUFFIX;
  }
}
