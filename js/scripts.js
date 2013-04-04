/*
 * StreetMix
 *
 * Front-end (mostly) by Marcin Wichary, Code for America fellow in 2013.
 *
 * Note: This code is really gnarly. It’s been done under a lot of time 
 * pressure and there’s a lot of shortcut and tech debt.
 * 
 * We are planning to work on this much more, but probably no sooner than
 * March in the earnest.
*/

var main = (function(){
"use strict";
  var main = {};

  var WIDTH_MULTIPLIER = 12; // 12 pixels per foot
  var WIDTH_TOOL_MULTIPLIER = 4;

  var TILE_SIZE = 12; // pixels
  var CANVAS_HEIGHT = 480;
  var CANVAS_BASELINE = CANVAS_HEIGHT - 35;

  var DRAGGING_TYPE_MOVE = 1;
  var DRAGGING_TYPE_CREATE = 2;

  var WIDTH_RESIZE_DELAY = 100;

  var STREET_WIDTH_ADAPTIVE = -1;

  var TILESET_WIDTH = 2622;
  var TILESET_HEIGHT = 384;

  var MIN_SEGMENT_WIDTH = 2;
  var MAX_SEGMENT_WIDTH = 50;
  var SEGMENT_WIDTH_RESOLUTION = .5;

  var SEGMENT_OWNER_CAR = 'car';
  var SEGMENT_OWNER_BIKE = 'bike';
  var SEGMENT_OWNER_PEDESTRIAN = 'pedestrian';
  var SEGMENT_OWNER_PUBLIC_TRANSIT = 'public-transit';
  var SEGMENT_OWNER_NATURE = 'nature';

  var SEGMENT_OWNERS = {
    'pedestrian': {
      owner: SEGMENT_OWNER_PEDESTRIAN
    },
    'bike': {
      owner: SEGMENT_OWNER_BIKE
    },
    'public-transit': {
      owner: SEGMENT_OWNER_PUBLIC_TRANSIT
    },
    'car': {
      owner: SEGMENT_OWNER_CAR
    },
    'nature': {
      owner: SEGMENT_OWNER_NATURE
    }
  };

  var SEGMENT_INFO = {
    'sidewalk': {
      name: 'Sidewalk',
      defaultWidth: 6,
      defaultHeight: 15,
      tileX: 0,
      tileY: 0,
      owner: SEGMENT_OWNER_PEDESTRIAN
    },
    "sidewalk-tree": {
      name: 'Sidewalk w/ a tree',
      defaultWidth: 6,
      defaultHeight: 15,
      tileX: 10,
      tileY: 0,
      owner: SEGMENT_OWNER_NATURE
    },
    "planting-strip": {
      name: 'Planting strip',
      defaultWidth: 4,
      defaultHeight: 15,
      tileX: 6,
      tileY: 0,
      owner: SEGMENT_OWNER_NATURE
    },
    "bike-lane-inbound": {
      name: 'Bike lane',
      subname: 'Inbound',
      defaultWidth: 6,
      defaultHeight: 15,
      tileX: 82,
      tileY: 0,
      owner: SEGMENT_OWNER_BIKE
    },
    "bike-lane-outbound": {
      name: 'Bike lane',
      subname: 'Outbound',
      defaultWidth: 6,
      defaultHeight: 15,
      tileX: 88,
      tileY: 0,
      owner: SEGMENT_OWNER_BIKE
    },
    "parking-lane": {
      name: 'Parking lane',
      defaultWidth: 8,
      defaultHeight: 15,
      tileX: 40,
      tileY: 0,
      owner: SEGMENT_OWNER_CAR
    },
    "drive-lane-inbound": {
      name: 'Drive lane',
      subname: 'Inbound',
      defaultWidth: 10,
      defaultHeight: 15,
      tileX: 20,
      tileY: 0,
      owner: SEGMENT_OWNER_CAR
    },
    "drive-lane-outbound": {
      name: 'Drive lane',
      subname: 'Outbound',
      defaultWidth: 10,
      defaultHeight: 15,
      tileX: 30,
      tileY: 0,
      owner: SEGMENT_OWNER_CAR
    },
    "turn-lane": {
      name: 'Turn lane',
      defaultWidth: 10,
      defaultHeight: 15,
      tileX: 72,
      tileY: 0,
      owner: SEGMENT_OWNER_CAR
    },
    "bus-lane-inbound": {
      name: 'Bus lane',
      subname: 'Inbound',
      defaultWidth: 12,
      defaultHeight: 15,
      tileX: 48,
      tileY: 0,
      owner: SEGMENT_OWNER_PUBLIC_TRANSIT
    },
    "bus-lane-outbound": {
      name: 'Bus lane',
      subname: 'Outbound',
      defaultWidth: 12,
      defaultHeight: 15,
      tileX: 60,
      tileY: 0,
      owner: SEGMENT_OWNER_PUBLIC_TRANSIT
    },
    "small-median": {
      name: 'Small median',
      defaultWidth: 4,
      defaultHeight: 15,
      tileX: 16,
      tileY: 0,
      owner: SEGMENT_OWNER_CAR
    },
  };

  var DEFAULT_SEGMENTS = {
    40: [
      { type: "sidewalk", width: 6 },
      { type: "planting-strip", width: 4 },
      { type: "drive-lane-inbound", width: 10 },
      { type: "drive-lane-outbound", width: 10 },
      { type: "planting-strip", width: 4 },
      { type: "sidewalk", width: 6 }
    ],
    60: [
      { type: "sidewalk", width: 6 },
      { type: "sidewalk-tree", width: 6 },
      { type: "bike-lane-inbound", width: 6 },
      { type: "drive-lane-inbound", width: 10 },
      { type: "drive-lane-outbound", width: 10 },
      { type: "planting-strip", width: 4 },
      { type: "bike-lane-outbound", width: 6 },
      { type: "sidewalk-tree", width: 6 },
      { type: "sidewalk", width: 6 }
    ],
    /*
    80: [
      { type: "sidewalk", width: 6 },
      { type: "sidewalk-tree", width: 6 },
      { type: "bike-lane-inbound", width: 6 },
      { type: "drive-lane-inbound", width: 10 },
      { type: "drive-lane-inbound", width: 10 },
      { type: "planting-strip", width: 4 },
      { type: "drive-lane-outbound", width: 10 },
      { type: "drive-lane-outbound", width: 10 },
      { type: "bike-lane-outbound", width: 6 },
      { type: "sidewalk-tree", width: 6 },
      { type: "sidewalk", width: 6 }
    ]
    */
    80: [
      { type: "sidewalk", width: 6 },
      { type: "sidewalk-tree", width: 6 },
      { type: "bike-lane-inbound", width: 6 },
      { type: "drive-lane-inbound", width: 15 },
      { type: "drive-lane-inbound", width: 10 },
      { type: "planting-strip", width: 2 },
      { type: "planting-strip", width: 4 },
      { type: "drive-lane-outbound", width: 10 },
      { type: "bike-lane-outbound", width: 6 },
      { type: "sidewalk-tree", width: 6 },
      { type: "sidewalk", width: 6 }
    ]
  }

  var data = {
    streetWidth: 80,
    occupiedWidth: null,

    modified: false,

    segments: []
  };

  var draggingStatus = {
    type: null,
    active: false,
    mouseX: null,
    mouseY: null,
    el: null,
    elX: null,
    elY: null,
    originalEl: null,
    originalWidth: null,
    originalDraggedOut: false
  };

  var visualZoom = 1;

  function _recalculateSeparators() {
    var els = document.querySelectorAll('#editable-street-section [type="separator"]');
    for (var i = 0, el; el = els[i]; i++) {
      var prevWidth = el.previousSibling ? el.previousSibling.offsetWidth : 0;
      var nextWidth = el.nextSibling ? el.nextSibling.offsetWidth : 0;

      if (i == 0) {
        prevWidth = 2000;
      } else if (i == els.length - 1) {
        nextWidth = 2000;
      }

      el.style.width = ((prevWidth / 2 + nextWidth / 2 + 2 + 100) * visualZoom) + 'px';
      el.style.marginLeft = ((-prevWidth / 2 - 1) * visualZoom) + 'px';
      el.style.marginRight = ((-nextWidth / 2 - 1 - 100) * visualZoom) + 'px';
    }
  }

  function _setSegmentContents(el, type, segmentWidth, isTool) {
    var segmentInfo = SEGMENT_INFO[type];

    var realWidth = segmentInfo.realWidth || segmentInfo.defaultWidth;

    var tileOffsetX = segmentInfo.tileOffsetX || 0;
    var tileOffsetY = segmentInfo.tileOffsetY || 0;

    var multiplier = isTool ? (WIDTH_TOOL_MULTIPLIER / WIDTH_MULTIPLIER) : 1;

    var bkPositionX = 
        -((segmentInfo.tileX + tileOffsetX) * TILE_SIZE) * multiplier;
    var bkPositionY = 
        (CANVAS_BASELINE - segmentInfo.defaultHeight * TILE_SIZE -
        (segmentInfo.tileY + tileOffsetY) * TILE_SIZE) * multiplier;

    if (isTool) {
      // TODO move to CSS
      bkPositionY -= 70;
    }

    var width = realWidth * TILE_SIZE * multiplier;
    var height = CANVAS_HEIGHT * multiplier;

    var left = -tileOffsetX * TILE_SIZE * multiplier;
    var top = -tileOffsetY * TILE_SIZE * multiplier;

    if (!isTool) {
      // center properly
      var segmentRealWidth = segmentWidth / TILE_SIZE;
      left += (segmentRealWidth - realWidth) * TILE_SIZE / 2;

      width *= visualZoom;
      height *= visualZoom;
    }

    var wrapperEl = document.createElement('div');
    wrapperEl.classList.add('image');
    if (!isTool) {
      wrapperEl.style.left = (left * visualZoom) + 'px';
      wrapperEl.style.top = (top * visualZoom) + 'px';
    }
    wrapperEl.style.width = width + 'px';
    wrapperEl.style.height = height + 'px';

    var imgWidth = TILESET_WIDTH / 2;
    var imgHeight = TILESET_HEIGHT / 2;

    if (isTool) {
      imgWidth /= WIDTH_MULTIPLIER / WIDTH_TOOL_MULTIPLIER;
      imgHeight /= WIDTH_MULTIPLIER / WIDTH_TOOL_MULTIPLIER;
    }

    if (!isTool) {
      imgWidth *= visualZoom;
      imgHeight *= visualZoom;
    }

    var imgEl = document.createElement('img');
    imgEl.src = 'images/tiles.png';
    imgEl.style.width = imgWidth + 'px';
    imgEl.style.height = imgHeight + 'px';
    imgEl.style.left = (bkPositionX * visualZoom) + 'px';
    imgEl.style.top = (bkPositionY * visualZoom) + 'px';

    var currentEl = el.querySelector('.image');
    if (currentEl) {
      currentEl.parentNode.removeChild(currentEl);
    }

    wrapperEl.appendChild(imgEl);
    el.appendChild(wrapperEl);
  }

  var widthEditHeld = false;
  var resizeSegmentTimerId = -1;

  function _onWidthEditClick(event) {
    var el = event.target;

    el.hold = true;
    widthEditHeld = true;

    if (document.activeElement != el) {
      el.select();
    }
  }

  function _onWidthEditMouseOver(event) {
    if (!widthEditHeld) {
      event.target.focus();
      event.target.select();
    }
  }
  function _onWidthEditMouseOut(event) {
    var el = event.target;
    if (!widthEditHeld) {
      _loseAnyFocus();
    }
  }

  function _loseAnyFocus() {
    document.body.focus();
  }

  function _onWidthEditFocus(event) {
    var el = event.target;

    el.oldValue = el.value;
  }

  function _onWidthEditBlur(event) {
    var el = event.target;

    widthEditInputChanged(el, true);

    el.hold = false;
    widthEditHeld = false;
  }

  function widthEditInputChanged(el, immediate) {
    window.clearTimeout(resizeSegmentTimerId);

    var width = parseFloat(el.value);

    if (width) {
      var segmentEl = el.segmentEl;

      resizeSegmentTimerId = window.setTimeout(function() {
        _resizeSegment(segmentEl, width * TILE_SIZE);
      }, immediate ? 0 : 200);
    }
  }

  function _onWidthEditInput(event) {
    widthEditInputChanged(event.target, false);
  }

  function _onWidthEditKeyDown(event) {
    var el = event.target;

    switch (event.keyCode) {
      case 13: // enter
        _loseAnyFocus();
        el.value = el.segmentEl.getAttribute('width');
        break;
      case 27: // Esc
        el.value = el.oldValue;
        widthEditInputChanged(el, true);
        _loseAnyFocus();
        break;
    }
  }

  function _normalizeSegmentWidth(width) {
    if (width < MIN_SEGMENT_WIDTH) {
      width = MIN_SEGMENT_WIDTH;
    }
    if (width > MAX_SEGMENT_WIDTH) {
      width = MAX_SEGMENT_WIDTH;
    }    

    width = Math.round(width / SEGMENT_WIDTH_RESOLUTION) * SEGMENT_WIDTH_RESOLUTION;

    return width;
  }

  function _prettifyWidth(width) {
    var width = width / TILE_SIZE;

    if (width - Math.floor(width) == .5) {
      var widthText = Math.floor(width) + '½';
    } else {
      var widthText = width;
    }

    widthText += '\'';

    return widthText;
  }

  function _resizeSegment(el, width, isTool) {
    var width = _normalizeSegmentWidth(width / TILE_SIZE) * TILE_SIZE;

    el.style.width = (width * visualZoom) + 'px';
    el.setAttribute('width', width / TILE_SIZE);

    var widthEl = el.querySelector('span.width');
    if (widthEl) {
      widthEl.innerHTML = _prettifyWidth(width);
    }

    _setSegmentContents(el, el.getAttribute('type'), width, isTool);
  }

  // TODO pass segment object instead of bits and pieces
  function _createSegment(type, width, isUnmovable, isTool) {
    var el = document.createElement('div');
    el.classList.add('segment');
    el.setAttribute('type', type);

    if (isUnmovable) {
      el.classList.add('unmovable');
    }
    
    if (type == 'separator') {
      el.addEventListener('mouseover', _onSeparatorMouseOver, false);
      el.addEventListener('mouseout', _onSeparatorMouseOut, false);
    } else {
      _setSegmentContents(el, type, width, isTool);

      if (!isTool) {
        var innerEl = document.createElement('span');
        innerEl.classList.add('name');
        innerEl.innerHTML = SEGMENT_INFO[type].name;
        el.appendChild(innerEl);

        var innerEl = document.createElement('span');
        innerEl.classList.add('width');
        //innerEl.innerHTML = width / TILE_SIZE + '\'';
        el.appendChild(innerEl);

        var innerEl = document.createElement('input');
        innerEl.setAttribute('type', 'text');
        innerEl.classList.add('width-edit');
        innerEl.segmentEl = el;
        innerEl.value = width / TILE_SIZE;

        innerEl.addEventListener('click', _onWidthEditClick, false);
        innerEl.addEventListener('focus', _onWidthEditFocus, false);
        innerEl.addEventListener('blur', _onWidthEditBlur, false);
        innerEl.addEventListener('input', _onWidthEditInput, false);
        innerEl.addEventListener('mouseover', _onWidthEditMouseOver, false);
        innerEl.addEventListener('mouseout', _onWidthEditMouseOut, false);
        innerEl.addEventListener('keydown', _onWidthEditKeyDown, false);
        el.appendChild(innerEl);

        var innerEl = document.createElement('span');
        innerEl.classList.add('grid');
        el.appendChild(innerEl);
      } else {
      	el.setAttribute('title', SEGMENT_INFO[type].name);
      }
    }

    if (width) {
      _resizeSegment(el, width, isTool);
    }    
    return el;
  }

  function _createDomFromData() {
    document.querySelector('#editable-street-section').innerHTML = '';

    var el = _createSegment('separator');
    document.querySelector('#editable-street-section').appendChild(el);

    for (var i in data.segments) {
      var segment = data.segments[i];

      var el = _createSegment(segment.type, segment.width * WIDTH_MULTIPLIER, 
          segment.unmovable);
      document.querySelector('#editable-street-section').appendChild(el);

      var el = _createSegment('separator');
      document.querySelector('#editable-street-section').appendChild(el);
    }

    _recalculateSeparators();
  }

  function _recalculateWidth() {
    data.occupiedWidth = 0;

    for (var i in data.segments) {
      var segment = data.segments[i];

      data.occupiedWidth += segment.width;
    }   

    if (data.streetWidth == STREET_WIDTH_ADAPTIVE) {
      _resizeStreetWidth();
    }
  }

  function _segmentsChanged() {
    _createDataFromDom();
    _recalculateWidth();
    _recalculateOwnerWidths();
  }

  function _createDataFromDom() {
    var els = document.querySelectorAll('#editable-street-section > .segment');

    data.segments = [];

    for (var i = 0, el; el = els[i]; i++) {
      if (el.getAttribute('type') != 'separator') {

        var segment = {};
        segment.type = el.getAttribute('type');
        segment.width = parseInt(el.getAttribute('width'));

        data.segments.push(segment);
      }
    }
  }

  function _recalculateOwnerWidths() {
    var ownerWidths = {};

    for (var id in SEGMENT_OWNERS) {
      ownerWidths[id] = 0;
    }

    for (var i in data.segments) {
      var segment = data.segments[i];

      ownerWidths[SEGMENT_INFO[segment.type].owner] += segment.width;
    }   

    for (var id in SEGMENT_OWNERS) {
      var el = document.querySelector('header .sizes [owner-id="' + id + '"]');

      el.querySelector('.width').innerHTML = ownerWidths[id];
      el.querySelector('.bar').style.width = (ownerWidths[id] * 3) + 'px';
    }
  }

  function _onBodyMouseDown(event) {
    var el = event.target;

    _loseAnyFocus();

    if (!el.classList.contains('segment') || el.classList.contains('unmovable')) {
      return;
    }

    draggingStatus.active = true;
    document.body.classList.add('dragging');

    draggingStatus.originalEl = el;

    if (draggingStatus.originalEl.classList.contains('tool')) {
      draggingStatus.type = DRAGGING_TYPE_CREATE;
    } else {
      draggingStatus.type = DRAGGING_TYPE_MOVE;      
    }

    draggingStatus.originalType = draggingStatus.originalEl.getAttribute('type');
    if (draggingStatus.type == DRAGGING_TYPE_MOVE) {
      draggingStatus.originalWidth = draggingStatus.originalEl.offsetWidth;
    } else {
      draggingStatus.originalWidth = draggingStatus.originalEl.offsetWidth / WIDTH_TOOL_MULTIPLIER * WIDTH_MULTIPLIER;
    }

    draggingStatus.elX = event.pageX - (event.offsetX || event.layerX);
    draggingStatus.elY = event.pageY - (event.offsetY || event.layerY);

    if (draggingStatus.type == DRAGGING_TYPE_CREATE) {
      draggingStatus.elY -= 300;
      draggingStatus.elX -= draggingStatus.originalWidth / 3;
    }

    draggingStatus.mouseX = event.pageX;
    draggingStatus.mouseY = event.pageY;

    draggingStatus.el = document.createElement('div');
    draggingStatus.el.classList.add('segment');
    draggingStatus.el.classList.add('dragging');
    draggingStatus.el.setAttribute('type', draggingStatus.originalType);
    _setSegmentContents(draggingStatus.el, draggingStatus.originalType);
    draggingStatus.el.style.width = draggingStatus.originalWidth + 'px';
    document.body.appendChild(draggingStatus.el);

    if (draggingStatus.type == DRAGGING_TYPE_CREATE) {
      if ((data.streetWidth != STREET_WIDTH_ADAPTIVE) && 
          (data.occupiedWidth + (draggingStatus.originalWidth / TILE_SIZE) > data.streetWidth)) {
        draggingStatus.el.classList.add('warning');
      }
    }

    draggingStatus.el.style.left = draggingStatus.elX + 'px';
    draggingStatus.el.style.top = draggingStatus.elY + 'px';

    if (draggingStatus.type == DRAGGING_TYPE_MOVE) {
      draggingStatus.originalEl.classList.add('dragged-out');
      if (draggingStatus.originalEl.previousSibling) {
        draggingStatus.originalEl.previousSibling.parentNode.removeChild(draggingStatus.originalEl.previousSibling);
      }
      if (draggingStatus.originalEl.nextSibling) {
        draggingStatus.originalEl.nextSibling.parentNode.removeChild(draggingStatus.originalEl.nextSibling);
      }
      draggingStatus.originalDraggedOut = true;
    }

    event.preventDefault();
  }

  function _onBodyMouseMove(event) {
    if (draggingStatus.active) {

      var deltaX = event.pageX - draggingStatus.mouseX;
      var deltaY = event.pageY - draggingStatus.mouseY;

      draggingStatus.elX += deltaX;
      draggingStatus.elY += deltaY;

      draggingStatus.el.style.left = draggingStatus.elX + 'px';
      draggingStatus.el.style.top = draggingStatus.elY + 'px';

      draggingStatus.mouseX = event.pageX;
      draggingStatus.mouseY = event.pageY;
    }
  }

  function _flashWarning() {
    document.querySelector('#warning').classList.add('active');

    window.setTimeout(function() {
      document.querySelector('#warning').classList.remove('active');
    }, 0);
  }

  function _onBodyMouseUp(event) {
    if (!draggingStatus.active) {
      return;
    }

    var el = event.target;
    while (el && (el.id != 'editable-street-canvas')) {
      el = el.parentNode;
    }
    var withinCanvas = !!el;

    draggingStatus.active = false;
    document.body.classList.remove('dragging');

    var placeEl = 
        document.querySelector('#editable-street-section [type="separator"].hover');

    // Doesn’t fit
    if (placeEl && draggingStatus.el.classList.contains('warning')) {
      placeEl = false;
      withinCanvas = false;

      _flashWarning();
    }

    if (placeEl) {
      var el = _createSegment('separator');
      document.querySelector('#editable-street-section').insertBefore(el, placeEl);
      
      var el = _createSegment(draggingStatus.originalType, draggingStatus.originalWidth);
      document.querySelector('#editable-street-section').insertBefore(el, placeEl);

      // animation
      // TODO: Move all to CSS
      el.style.width = 50 + 'px';
      el.style.left = (-(draggingStatus.originalWidth - 50) / 2) + 'px';
      el.style.webkitTransform = 'scaleX(.8)';
      el.style.MozTransform = 'scaleX(.8)';

      window.setTimeout(function() {
        el.style.width = draggingStatus.originalWidth + 'px';
        el.style.left = 0;
        el.style.webkitTransform = 'none';
        el.style.MozTransform = 'none';
      }, 0);

      _recalculateSeparators();
      _segmentsChanged();

      data.modified = true;

      draggingStatus.el.parentNode.removeChild(draggingStatus.el);

    } else {
      if (!withinCanvas) {
        _dragOutOriginalIfNecessary();
      } else {
        draggingStatus.originalEl.classList.remove('dragged-out');

        var el = _createSegment('separator');
        document.querySelector('#editable-street-section').insertBefore(el, 
            draggingStatus.originalEl);

        var el = _createSegment('separator');
        document.querySelector('#editable-street-section').insertBefore(el, 
            draggingStatus.originalEl.nextSibling);

      }

      draggingStatus.el.classList.add('poof');
      window.setTimeout(function() {
        if (draggingStatus.el && draggingStatus.el.parentNode) {
          draggingStatus.el.parentNode.removeChild(draggingStatus.el);
        }
      }, 250);
    }

    event.preventDefault();
  }

  function _dragOutOriginalIfNecessary() {
    if ((draggingStatus.type == DRAGGING_TYPE_MOVE) && 
        draggingStatus.originalDraggedOut) {
      var el = _createSegment('separator');
      document.querySelector('#editable-street-section').insertBefore(el, 
          draggingStatus.originalEl);

      draggingStatus.originalEl.style.width = 0;
      window.setTimeout(function() {
        draggingStatus.originalEl.parentNode.removeChild(draggingStatus.originalEl);
        _recalculateSeparators();
        _segmentsChanged();
      }, WIDTH_RESIZE_DELAY);

      _recalculateSeparators();
      _segmentsChanged();

      draggingStatus.originalDraggedOut = false;
    }
  }

  function _onSeparatorMouseOver(event) {
    _dragOutOriginalIfNecessary();

    event.target.classList.add('hover');
  }
  function _onSeparatorMouseOut(event) {
    event.target.classList.remove('hover');
  }

  function _createTools() {
    for (var i in SEGMENT_INFO) {
      var segmentType = SEGMENT_INFO[i];
      var el = _createSegment(i, segmentType.defaultWidth * WIDTH_TOOL_MULTIPLIER, false, true);

      el.classList.add('tool');

      document.querySelector('#tools').appendChild(el);
    }
  }

  function _resizeStreetWidth() {
    if (data.streetWidth == STREET_WIDTH_ADAPTIVE) {
      var width = data.occupiedWidth;
    } else {
      var width = data.streetWidth;
    }

    width *= TILE_SIZE;

    document.querySelector('#street-section-canvas').style.width = 
        (width * visualZoom) + 'px';
    document.querySelector('#street-section-canvas').style.marginLeft = 
        ((-width / 2) * visualZoom) + 'px';

    document.querySelector('#editable-street-canvas').style.marginLeft = 
        (-5000 + (width / 2) * visualZoom) + 'px';
  }

  function _onResize() {
    var viewportWidth = window.innerWidth;
    var viewportHeight = window.innerHeight;

    var streetSectionHeight = document.querySelector('#street-section').offsetHeight;

    var toolsTop = document.querySelector('#tools').offsetTop;

    var pos = 
      (viewportHeight - streetSectionHeight) / 2;

    if (pos + document.querySelector('#street-section').offsetHeight > 
      toolsTop - 20) {
      pos = toolsTop - 20 - streetSectionHeight;
    }

    document.querySelector('#street-section').style.top = pos + 'px';
  }

  function _getDefaultSegments() {
    data.segments = [];

    for (var i in DEFAULT_SEGMENTS[data.streetWidth]) {
      data.segments.push(DEFAULT_SEGMENTS[data.streetWidth][i]);
    }

    data.modified = false;
  }

  function _onStreetWidthChange(event) {
    var el = event.target;
    var newStreetWidth = el.value;

    var replaceWithDefault = false;

    if (newStreetWidth == data.streetWidth) {
      return;
    }

    if (!data.modified || newStreetWidth == STREET_WIDTH_ADAPTIVE) {
      replaceWithDefault = true;
    } else if (data.occupiedWidth > newStreetWidth) {
      var reply = confirm(
          'Your segments are too wide for that type of street. ' +
          'Do you want to replace them with a default ' + newStreetWidth + '\' street?');

      if (!reply) {
        return;
      } 

      replaceWithDefault = true;
    }

    data.streetWidth = newStreetWidth;
    _resizeStreetWidth();

    if (replaceWithDefault && (data.streetWidth != STREET_WIDTH_ADAPTIVE)) {
      _getDefaultSegments();
    }
    _createDomFromData();
    _segmentsChanged();
  }

  function _prepareUI() {
    for (var id in SEGMENT_OWNERS) {
      var el = document.createElement('li');

      el.setAttribute('owner-id', id);

      el.innerHTML = '<span class="name">' + id + '</span><span class="width"></span><span class="bar"></span>';

      document.querySelector('header .sizes ul').appendChild(el);
    }
  }
 
  main.init = function(){
    _prepareUI();

    _resizeStreetWidth();

    _getDefaultSegments();

    _createTools();

    _createDomFromData();
    _segmentsChanged();

    _onResize();

    document.querySelector('#street-width').addEventListener('change', _onStreetWidthChange, false);

    window.addEventListener('resize', _onResize, false);

    window.addEventListener('mousedown', _onBodyMouseDown, false);
    window.addEventListener('mousemove', _onBodyMouseMove, false);
    window.addEventListener('mouseup', _onBodyMouseUp, false);
  }

  return main;
})();
