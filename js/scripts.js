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

  var TILE_IMAGE_VERSION = 3;

  var IMAGES_TO_BE_LOADED = [
    'images/tiles.png',
    'images/ui/icons/noun_project_2.svg',
    'images/ui/icons/noun_project_536.svg',
    'images/ui/icons/noun_project_97.svg',
    'images/ui/icons/noun_project_72.svg',
    'images/ui/icons/noun_project_13130.svg'
  ];

  var images;
  var imagesRemaining;

  var WIDTH_MULTIPLIER = 12; // 12 pixels per foot
  var WIDTH_TOOL_MULTIPLIER = 4;

  var TILE_SIZE = 12; // pixels
  var CANVAS_HEIGHT = 480;
  var CANVAS_BASELINE = CANVAS_HEIGHT - 35;

  var DRAGGING_TYPE_SEGMENT_MOVE = 1;
  var DRAGGING_TYPE_SEGMENT_RESIZE = 2;

  var SEGMENT_DRAGGING_TYPE_MOVE = 1;
  var SEGMENT_DRAGGING_TYPE_CREATE = 2;

  var WIDTH_RESIZE_DELAY = 100;

  var STREET_WIDTH_ADAPTIVE = -1;

  var TILESET_WIDTH = 2622;
  var TILESET_HEIGHT = 384;

  var MIN_WIDTH_EDIT_CANVAS_WIDTH = 120;

  var MIN_SEGMENT_WIDTH = 2;
  var MAX_SEGMENT_WIDTH = 150;
  var SEGMENT_WIDTH_RESOLUTION = .5;
  var SEGMENT_WIDTH_CLICK_INCREMENT = SEGMENT_WIDTH_RESOLUTION;

  var SEGMENT_OWNER_CAR = 'car';
  var SEGMENT_OWNER_BIKE = 'bike';
  var SEGMENT_OWNER_PEDESTRIAN = 'pedestrian';
  var SEGMENT_OWNER_PUBLIC_TRANSIT = 'public-transit';
  var SEGMENT_OWNER_NATURE = 'nature';

  var SEGMENT_OWNERS = {
    'car': {
      owner: SEGMENT_OWNER_CAR,
      imageUrl: 'images/ui/icons/noun_project_72.svg',
      imageSize: .8
    },
    'public-transit': {
      owner: SEGMENT_OWNER_PUBLIC_TRANSIT,
      imageUrl: 'images/ui/icons/noun_project_97.svg',
      imageSize: .8
    },
    'bike': {
      owner: SEGMENT_OWNER_BIKE,
      imageUrl: 'images/ui/icons/noun_project_536.svg',
      imageSize: 1.1
    },
    'pedestrian': {
      owner: SEGMENT_OWNER_PEDESTRIAN,
      imageUrl: 'images/ui/icons/noun_project_2.svg',
      imageSize: .8
    },
    'nature': {
      owner: SEGMENT_OWNER_NATURE,
      imageUrl: 'images/ui/icons/noun_project_13130.svg',
      imageSize: .8
    }
  };

  var SEGMENT_INFO = {
    'sidewalk': {
      name: 'Sidewalk',
      defaultWidth: 6,
      defaultHeight: 15,
      tileX: 0,
      tileY: 0,
      repeatWidth: 1,
      repeatHeight: 15,
      repeatX: 0,
      repeatY: 0,
      owner: SEGMENT_OWNER_PEDESTRIAN
    },
    "sidewalk-tree": {
      name: 'Sidewalk w/ a tree',
      defaultWidth: 6,
      defaultHeight: 15,
      tileX: 10,
      tileY: 0,
      repeatWidth: 1,
      repeatHeight: 15,
      repeatX: 0,
      repeatY: 0,
      owner: SEGMENT_OWNER_NATURE
    },
    "planting-strip": {
      name: 'Planting strip',
      defaultWidth: 4,
      defaultHeight: 15,
      tileX: 6,
      tileY: 0,
      repeatWidth: 1,
      repeatHeight: 15,
      repeatX: 6,
      repeatY: 0,
      owner: SEGMENT_OWNER_NATURE
    },
    "bike-lane-inbound": {
      name: 'Bike lane',
      subname: 'Inbound',
      defaultWidth: 6,
      defaultHeight: 15,
      tileX: 82,
      tileY: 0,
      repeatWidth: 1,
      repeatHeight: 15,
      repeatX: 82,
      repeatY: 0,
      owner: SEGMENT_OWNER_BIKE
    },
    "bike-lane-outbound": {
      name: 'Bike lane',
      subname: 'Outbound',
      defaultWidth: 6,
      defaultHeight: 15,
      tileX: 88,
      tileY: 0,
      repeatWidth: 1,
      repeatHeight: 15,
      repeatX: 88,
      repeatY: 0,
      owner: SEGMENT_OWNER_BIKE
    },
    "parking-lane": {
      name: 'Parking lane',
      defaultWidth: 8,
      defaultHeight: 15,
      tileX: 40,
      tileY: 0,
      repeatWidth: 1,
      repeatHeight: 15,
      repeatX: 30,
      repeatY: 0,
      owner: SEGMENT_OWNER_CAR
    },
    "drive-lane-inbound": {
      name: 'Drive lane',
      subname: 'Inbound',
      defaultWidth: 10,
      defaultHeight: 15,
      tileX: 20,
      tileY: 0,
      repeatWidth: 1,
      repeatHeight: 15,
      repeatX: 30,
      repeatY: 0,
      owner: SEGMENT_OWNER_CAR
    },
    "drive-lane-outbound": {
      name: 'Drive lane',
      subname: 'Outbound',
      defaultWidth: 10,
      defaultHeight: 15,
      tileX: 30,
      tileY: 0,
      repeatWidth: 1,
      repeatHeight: 15,
      repeatX: 30,
      repeatY: 0,
      owner: SEGMENT_OWNER_CAR
    },
    "turn-lane": {
      name: 'Turn lane',
      defaultWidth: 10,
      defaultHeight: 15,
      tileX: 72,
      tileY: 0,
      repeatWidth: 1,
      repeatHeight: 15,
      repeatX: 30,
      repeatY: 0,
      owner: SEGMENT_OWNER_CAR
    },
    "bus-lane-inbound": {
      name: 'Bus lane',
      subname: 'Inbound',
      defaultWidth: 12,
      defaultHeight: 15,
      tileX: 48,
      tileY: 0,
      repeatWidth: 1,
      repeatHeight: 15,
      repeatX: 30,
      repeatY: 0,
      owner: SEGMENT_OWNER_PUBLIC_TRANSIT
    },
    "bus-lane-outbound": {
      name: 'Bus lane',
      subname: 'Outbound',
      defaultWidth: 12,
      defaultHeight: 15,
      tileX: 60,
      tileY: 0,
      repeatWidth: 1,
      repeatHeight: 15,
      repeatX: 30,
      repeatY: 0,
      owner: SEGMENT_OWNER_PUBLIC_TRANSIT
    },
    "small-median": {
      name: 'Small median',
      defaultWidth: 4,
      defaultHeight: 15,
      tileX: 16,
      tileY: 0,
      repeatWidth: 1,
      repeatHeight: 15,
      repeatX: 16,
      repeatY: 0,
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
  }

  var data = {
    streetWidth: 80,
    occupiedWidth: null,
    remainingWidth: null,

    modified: false,

    segments: []
  };

  var draggingActive = false;
  var draggingType;

  //var tilesImage;

  var segmentHoveredEl;

  var retinaMultiplier;

  var segmentResizeDragging = {
    segmentEl: null,
    floatingEl: null,
    mouseX: null,
    mouseY: null,
    elX: null,
    elY: null,
    origX: null,
    origWidth: null,
    right: false
  };

  var segmentMoveDragging = {
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

  var initializing = false;

  var visualZoom = 1;

  var widthEditHeld = false;
  var resizeSegmentTimerId = -1;

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
        ((segmentInfo.tileX + tileOffsetX) * TILE_SIZE);// * multiplier;
    var bkPositionY = 
        (CANVAS_BASELINE - segmentInfo.defaultHeight * TILE_SIZE -
        (segmentInfo.tileY + tileOffsetY) * TILE_SIZE);// * multiplier;

    var width = realWidth * TILE_SIZE;
    var height = CANVAS_HEIGHT;

    var left = -tileOffsetX * TILE_SIZE * multiplier;
    var top = -tileOffsetY * TILE_SIZE * multiplier;

    if (!isTool) {
      // center properly
      var segmentRealWidth = segmentWidth / TILE_SIZE;
      left += (segmentRealWidth - realWidth) * TILE_SIZE / 2;
    }

    var canvasEl = document.createElement('canvas');
    canvasEl.classList.add('image');
    canvasEl.width = segmentWidth * retinaMultiplier;
    canvasEl.height = height * retinaMultiplier;

    canvasEl.style.width = segmentWidth + 'px';
    canvasEl.style.height = height + 'px';
    var ctx = canvasEl.getContext('2d');

    var realHeight = segmentInfo.defaultHeight * TILE_SIZE;

    if (!isTool) {
      if (segmentInfo.repeatWidth) {

        var repeatPositionX = ((segmentInfo.repeatX) * TILE_SIZE);
        var w = (segmentInfo.repeatWidth * TILE_SIZE);

        var count = Math.floor((segmentWidth) / w + 1);

        for (var i = 0; i < count; i++) {
          ctx.drawImage(images['images/tiles.png'], 
            repeatPositionX * 2, 
            0, 
            w * 2, 
            realHeight * 2, 
            i * TILE_SIZE * retinaMultiplier, 
            ((isTool ? 20 : 265) + top) * retinaMultiplier, 
            w * retinaMultiplier * multiplier, 
            realHeight * retinaMultiplier * multiplier);
        }
      }      
    }

    ctx.drawImage(images['images/tiles.png'], 
      bkPositionX * 2, 
      0, 
      width * 2, 
      realHeight * 2, 
      left * retinaMultiplier, 
      ((isTool ? 20 : 265) + top) * retinaMultiplier, 
      width * retinaMultiplier * multiplier, 
      realHeight * retinaMultiplier * multiplier);

    var currentEl = el.querySelector('canvas');
    if (currentEl) {
      currentEl.parentNode.removeChild(currentEl);
    }
    el.appendChild(canvasEl);
  }

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

      if (immediate) {
        _resizeSegment(segmentEl, width * TILE_SIZE, false, false, true);
      } else {
        resizeSegmentTimerId = window.setTimeout(function() {
          _resizeSegment(segmentEl, width * TILE_SIZE, false, false, true);
        }, 200);
      }
    }
  }

  function _onWidthEditInput(event) {
    widthEditInputChanged(event.target, false);
  }

  function _onWidthEditKeyDown(event) {
    var el = event.target;

    switch (event.keyCode) {
      case 13: // enter
        widthEditInputChanged(el, true);
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
      var widthText = (Math.floor(width) ? Math.floor(width) : '') + '½';
    } else {
      var widthText = width;
    }

    widthText += '\'';

    return widthText;
  }

  function _incrementSegmentWidth(segmentEl, add) {
    var width = parseFloat(segmentEl.getAttribute('width'));

    if (add) {
      width += SEGMENT_WIDTH_CLICK_INCREMENT;
    } else {      
      width -= SEGMENT_WIDTH_CLICK_INCREMENT;
    }
    width = _normalizeSegmentWidth(width);

    _resizeSegment(segmentEl, width * TILE_SIZE, true, false, false);
  }

  function _onWidthDecrementClick(event) {
    var el = event.target;

    var segmentEl = el.segmentEl;

    _incrementSegmentWidth(segmentEl, false);
  }

  function _onWidthIncrementClick(event) {
    var el = event.target;

    var segmentEl = el.segmentEl;

    _incrementSegmentWidth(segmentEl, true);
  }

  function _resizeSegment(el, width, updateEdit, isTool, immediate) {
    if (!isTool) {
      var width = _normalizeSegmentWidth(width / TILE_SIZE) * TILE_SIZE;
    }

    if (immediate) {
      el.classList.add('immediate-resize');

      window.setTimeout(function() {
        el.classList.remove('immediate-resize');
      }, 100);
    }

    el.style.width = (width * visualZoom) + 'px';
    el.setAttribute('width', width / TILE_SIZE);

    var widthEl = el.querySelector('span.width');
    if (widthEl) {
      widthEl.innerHTML = _prettifyWidth(width);
    }

    _setSegmentContents(el, el.getAttribute('type'), width, isTool);

    if (updateEdit) {
      var editEl = el.querySelector('.width-edit');
      if (editEl) {
        editEl.value = width / TILE_SIZE;
      }
    }

    var widthEditCanvasEl = el.querySelector('.width-edit-canvas');

    if (widthEditCanvasEl) {
      if (width < MIN_WIDTH_EDIT_CANVAS_WIDTH) {
        widthEditCanvasEl.style.width = MIN_WIDTH_EDIT_CANVAS_WIDTH + 'px';
        widthEditCanvasEl.style.marginLeft = 
            ((width - MIN_WIDTH_EDIT_CANVAS_WIDTH) / 2 - 20) + 'px';
      } else {
        widthEditCanvasEl.style.width = '';
        widthEditCanvasEl.style.marginLeft = '';
      }
    }

    _segmentsChanged();
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
      el.addEventListener('mouseover', _onSegmentMouseOver, false);
      el.addEventListener('mouseout', _onSegmentMouseOut, false);

      _setSegmentContents(el, type, width, isTool);

      if (!isTool) {
        var innerEl = document.createElement('span');
        innerEl.classList.add('name');
        innerEl.innerHTML = SEGMENT_INFO[type].name;
        el.appendChild(innerEl);

        var innerEl = document.createElement('span');
        innerEl.classList.add('width');
        el.appendChild(innerEl);

        var dragHandleEl = document.createElement('span');
        dragHandleEl.classList.add('drag-handle');
        dragHandleEl.classList.add('left');
        dragHandleEl.segmentEl = el;
        dragHandleEl.innerHTML = '‹';
        el.appendChild(dragHandleEl);

        var dragHandleEl = document.createElement('span');
        dragHandleEl.classList.add('drag-handle');
        dragHandleEl.classList.add('right');
        dragHandleEl.segmentEl = el;
        dragHandleEl.innerHTML = '›';
        el.appendChild(dragHandleEl);


        var commandsEl = document.createElement('span');
        commandsEl.classList.add('commands');

        var innerEl = document.createElement('button');
        innerEl.classList.add('info');
        innerEl.innerHTML = 'i';
        innerEl.segmentEl = el;
        innerEl.tabIndex = -1;
        //innerEl.setAttribute('title', 'Remove segment');
        //innerEl.addEventListener('click', _onRemoveButtonClick, false);
        commandsEl.appendChild(innerEl);        

        var innerEl = document.createElement('button');
        innerEl.classList.add('close');
        innerEl.innerHTML = '×';
        innerEl.segmentEl = el;
        innerEl.tabIndex = -1;
        innerEl.setAttribute('title', 'Remove segment');
        innerEl.addEventListener('click', _onRemoveButtonClick, false);
        commandsEl.appendChild(innerEl);        

        el.appendChild(commandsEl);


        var widthEditCanvasEl = document.createElement('span');
        widthEditCanvasEl.classList.add('width-edit-canvas');

        var innerEl = document.createElement('button');
        innerEl.classList.add('decrement');
        innerEl.innerHTML = '–';
        innerEl.segmentEl = el;
        innerEl.tabIndex = -1;
        innerEl.addEventListener('click', _onWidthDecrementClick, false);
        widthEditCanvasEl.appendChild(innerEl);        

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
        widthEditCanvasEl.appendChild(innerEl);

        var innerEl = document.createElement('button');
        innerEl.classList.add('increment');
        innerEl.innerHTML = '+';
        innerEl.segmentEl = el;
        innerEl.tabIndex = -1;
        innerEl.addEventListener('click', _onWidthIncrementClick, false);
        widthEditCanvasEl.appendChild(innerEl);        

        el.appendChild(widthEditCanvasEl);

        var innerEl = document.createElement('span');
        innerEl.classList.add('grid');
        el.appendChild(innerEl);
      } else {
      	el.setAttribute('title', SEGMENT_INFO[type].name);
      }
    }

    if (width) {
      _resizeSegment(el, width, true, isTool, true);
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

      data.segments[i].el = el;

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
      data.remainingWidth = 0;
    } else {
      data.remainingWidth = (data.streetWidth - data.occupiedWidth);
    }

    var position = data.streetWidth / 2 - data.occupiedWidth / 2;

    for (var i in data.segments) {
      if (data.segments[i].el) {
        if (((position < 0) || ((position + data.segments[i].width) > data.streetWidth)) && (data.streetWidth != STREET_WIDTH_ADAPTIVE)) {
          data.segments[i].el.classList.add('outside');
        } else {
          data.segments[i].el.classList.remove('outside');
        }
      }

      position += data.segments[i].width;
    }


    if (data.remainingWidth == 0) {
      document.body.classList.remove('street-overflows');
    } else if (data.remainingWidth > 0) {
      document.body.classList.remove('street-overflows');
    } else {
      document.body.classList.add('street-overflows');
    }

    if (data.streetWidth == STREET_WIDTH_ADAPTIVE) {
      document.querySelector('#street-width-option-adaptive').innerHTML = 'Adaptive (' + _prettifyWidth(TILE_SIZE * data.occupiedWidth) + ')';
    } else {
      document.querySelector('#street-width-option-adaptive').innerHTML = 'Adaptive';
    }
  }

  function _segmentsChanged() {
    if (!initializing) {
      _createDataFromDom();
    }
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
        segment.width = parseFloat(el.getAttribute('width'));
        segment.el = el;

        data.segments.push(segment);
      }
    }
  }

  function _drawLine(ctx, x1, y1, x2, y2) {
    x1 *= retinaMultiplier;
    y1 *= retinaMultiplier;
    x2 *= retinaMultiplier;
    y2 *= retinaMultiplier;

    ctx.beginPath(); 
    ctx.moveTo(x1, y1); 
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  function _drawArrowLine(ctx, x1, y1, x2, y2, text) {
    x1 += 2;
    x2 -= 2;

    _drawLine(ctx, x1, y1, x2, y2);

    if (text) {
      ctx.font = (12 * retinaMultiplier) + 'px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(text, (x1 + x2) / 2 * retinaMultiplier, y1 * retinaMultiplier - 10);      
    }
  }

  function _updateWidthChart(ownerWidths) {
    var ctx = document.querySelector('#width-chart').getContext('2d');

    var EMPTY_WIDTH = 40;

    var CHART_MARGIN = 20;

    var chartWidth = 500;
    var canvasWidth = document.querySelector('#width-chart').offsetWidth;
    var canvasHeight = document.querySelector('#width-chart').offsetHeight;

    document.querySelector('#width-chart').width = canvasWidth * retinaMultiplier;
    document.querySelector('#width-chart').height = canvasHeight * retinaMultiplier;

    chartWidth -= CHART_MARGIN * 2;

    var left = (canvasWidth - chartWidth) / 2;

    for (var id in SEGMENT_OWNERS) {
      if (ownerWidths[id] == 0) {
        chartWidth -= EMPTY_WIDTH;
      }
    }

    var maxWidth = data.streetWidth;

    if (data.streetWidth == STREET_WIDTH_ADAPTIVE) {
      maxWidth = data.occupiedWidth;
    } else if (data.occupiedWidth > data.streetWidth) {
      maxWidth = data.occupiedWidth;
    }

    var multiplier = chartWidth / maxWidth;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;

    var bottom = 70;

    _drawLine(ctx, left, 20, left, bottom);
    if ((maxWidth > data.streetWidth) && (data.streetWidth != STREET_WIDTH_ADAPTIVE)) {
      _drawLine(ctx, left + data.streetWidth * multiplier, 20, left + data.streetWidth * multiplier, 40);

      ctx.save();
      ctx.strokeStyle = 'red';
      ctx.fillStyle = 'red';
      _drawArrowLine(ctx, 
        left + data.streetWidth * multiplier, 30, left + maxWidth * multiplier, 30, _prettifyWidth(-data.remainingWidth * TILE_SIZE));
      ctx.restore();
    }

    _drawLine(ctx, left + maxWidth * multiplier, 20, left + maxWidth * multiplier, bottom);
    _drawArrowLine(ctx, 
        left, 30, left + ((data.streetWidth == STREET_WIDTH_ADAPTIVE) ? data.occupiedWidth : data.streetWidth) * multiplier, 30);
  
    var x = left;

    for (var id in SEGMENT_OWNERS) {
      if (ownerWidths[id] > 0) {
        var width = ownerWidths[id] * multiplier;

        _drawArrowLine(ctx, x, 60, x + width, 60, _prettifyWidth(ownerWidths[id] * TILE_SIZE));
        _drawLine(ctx, x + width, 50, x + width, 70);

        var imageWidth = images[SEGMENT_OWNERS[id].imageUrl].width / 5 * SEGMENT_OWNERS[id].imageSize;
        var imageHeight = images[SEGMENT_OWNERS[id].imageUrl].height / 5 * SEGMENT_OWNERS[id].imageSize;

        ctx.drawImage(images[SEGMENT_OWNERS[id].imageUrl], 
            0, 
            0, 
            images[SEGMENT_OWNERS[id].imageUrl].width, 
            images[SEGMENT_OWNERS[id].imageUrl].height, 
            (x + width / 2 - imageWidth / 2) * retinaMultiplier, 
            (80 - imageHeight) * retinaMultiplier,
            imageWidth * retinaMultiplier, 
            imageHeight * retinaMultiplier);

        x += width;
      }
    }

    if (data.occupiedWidth < data.streetWidth) {
      ctx.save();
      ctx.strokeStyle = 'rgb(100, 100, 100)';
      ctx.fillStyle = 'rgb(100, 100, 100)';
      ctx.setLineDash([15, 10]);
      _drawArrowLine(ctx, x, 60, left + data.streetWidth * multiplier, 60, _prettifyWidth(data.remainingWidth * TILE_SIZE));
      ctx.restore();
    }

    x = left + maxWidth * multiplier;

    for (var id in SEGMENT_OWNERS) {
      if (ownerWidths[id] == 0) {
        var width = EMPTY_WIDTH;

        ctx.fillStyle = 'rgb(100, 100, 100)';
        ctx.strokeStyle = 'rgb(100, 100, 100)';

        //ctx.save();
        _drawArrowLine(ctx, x, 60, x + width, 60, '–');
        //ctx.restore();
        _drawLine(ctx, x + width, 50, x + width, 70);

        var imageWidth = images[SEGMENT_OWNERS[id].imageUrl].width / 5 * SEGMENT_OWNERS[id].imageSize;
        var imageHeight = images[SEGMENT_OWNERS[id].imageUrl].height / 5 * SEGMENT_OWNERS[id].imageSize;

        ctx.save();
        ctx.globalAlpha = .5;
        //ctx.globalCompositeOperation = "lighter";
        ctx.drawImage(images[SEGMENT_OWNERS[id].imageUrl], 
            0, 
            0, 
            images[SEGMENT_OWNERS[id].imageUrl].width, 
            images[SEGMENT_OWNERS[id].imageUrl].height, 
            (x + width / 2 - imageWidth / 2) * retinaMultiplier, 
            (80 - imageHeight) * retinaMultiplier,
            imageWidth * retinaMultiplier, 
            imageHeight * retinaMultiplier);
        ctx.restore();
        
        x += width;
      }
    }



    document.querySelector('#street-width-canvas').style.left = CHART_MARGIN + 'px';
    document.querySelector('#street-width-canvas').style.width = (data.streetWidth * multiplier) + 'px';

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

    _updateWidthChart(ownerWidths);

/*    for (var id in SEGMENT_OWNERS) {
      var el = document.querySelector('header .sizes [owner-id="' + id + '"]');

      el.querySelector('.width').innerHTML = _prettifyWidth(ownerWidths[id] * TILE_SIZE);
      //el.querySelector('.bar').style.width = (ownerWidths[id] * 3) + 'px';
    }*/
  }

  function _getElAbsolutePos(el) {
    var pos = [0, 0];

    do {
      pos[0] += el.offsetLeft;
      pos[1] += el.offsetTop;

      el = el.offsetParent;
    } while (el);

    return pos;
  }

  function _handleSegmentResizeStart(event) {
    var el = event.target;

    draggingActive = true;
    draggingType = DRAGGING_TYPE_SEGMENT_RESIZE;
    document.body.classList.add('segment-resize-dragging');

    var pos = _getElAbsolutePos(el);

    segmentResizeDragging.right = el.classList.contains('right');

    segmentResizeDragging.floatingEl = document.createElement('div');
    segmentResizeDragging.floatingEl.classList.add('drag-handle');
    segmentResizeDragging.floatingEl.classList.add('floating');

    segmentResizeDragging.floatingEl.style.left = pos[0] + 'px';
    segmentResizeDragging.floatingEl.style.top = pos[1] + 'px';
    document.body.appendChild(segmentResizeDragging.floatingEl);

    segmentResizeDragging.mouseX = event.pageX;
    segmentResizeDragging.mouseY = event.pageY;

    segmentResizeDragging.elX = event.pageX - (event.offsetX || event.layerX);
    segmentResizeDragging.elY = event.pageY - (event.offsetY || event.layerY);    

    segmentResizeDragging.origX = segmentResizeDragging.elX;
    segmentResizeDragging.origWidth = parseFloat(el.segmentEl.getAttribute('width'));
    segmentResizeDragging.segmentEl = el.segmentEl;

    segmentResizeDragging.segmentEl.classList.add('hover');
  }

  function _handleSegmentMoveStart(event) {
    var el = event.target;

    draggingActive = true;
    draggingType = DRAGGING_TYPE_SEGMENT_MOVE;
    document.body.classList.add('segment-move-dragging');

    segmentMoveDragging.originalEl = el;

    if (segmentMoveDragging.originalEl.classList.contains('tool')) {
      segmentMoveDragging.type = SEGMENT_DRAGGING_TYPE_CREATE;
    } else {
      segmentMoveDragging.type = SEGMENT_DRAGGING_TYPE_MOVE;      
    }

    segmentMoveDragging.originalType = segmentMoveDragging.originalEl.getAttribute('type');
    if (segmentMoveDragging.type == SEGMENT_DRAGGING_TYPE_MOVE) {
      segmentMoveDragging.originalWidth = segmentMoveDragging.originalEl.offsetWidth;
    } else {
      segmentMoveDragging.originalWidth = segmentMoveDragging.originalEl.offsetWidth / WIDTH_TOOL_MULTIPLIER * WIDTH_MULTIPLIER;
    }

    segmentMoveDragging.elX = event.pageX - (event.offsetX || event.layerX);
    segmentMoveDragging.elY = event.pageY - (event.offsetY || event.layerY);

    if (segmentMoveDragging.type == SEGMENT_DRAGGING_TYPE_CREATE) {
      segmentMoveDragging.elY -= 300;
      segmentMoveDragging.elX -= segmentMoveDragging.originalWidth / 3;
    }

    segmentMoveDragging.mouseX = event.pageX;
    segmentMoveDragging.mouseY = event.pageY;

    segmentMoveDragging.el = document.createElement('div');
    segmentMoveDragging.el.classList.add('segment');
    segmentMoveDragging.el.classList.add('dragging');
    segmentMoveDragging.el.setAttribute('type', segmentMoveDragging.originalType);
    _setSegmentContents(segmentMoveDragging.el, segmentMoveDragging.originalType, segmentMoveDragging.originalWidth);
    document.body.appendChild(segmentMoveDragging.el);

    segmentMoveDragging.el.style.left = segmentMoveDragging.elX + 'px';
    segmentMoveDragging.el.style.top = segmentMoveDragging.elY + 'px';

    if (segmentMoveDragging.type == SEGMENT_DRAGGING_TYPE_MOVE) {
      segmentMoveDragging.originalEl.classList.add('dragged-out');
      if (segmentMoveDragging.originalEl.previousSibling) {
        segmentMoveDragging.originalEl.previousSibling.parentNode.removeChild(segmentMoveDragging.originalEl.previousSibling);
      }
      if (segmentMoveDragging.originalEl.nextSibling) {
        segmentMoveDragging.originalEl.nextSibling.parentNode.removeChild(segmentMoveDragging.originalEl.nextSibling);
      }
      segmentMoveDragging.originalDraggedOut = true;
    }
  }

  function _onBodyMouseDown(event) {
    var el = event.target;

    _loseAnyFocus();

    if (el.classList.contains('drag-handle')) {
      _handleSegmentResizeStart(event);
    } else {
      if (!el.classList.contains('segment') || el.classList.contains('unmovable')) {
        return;
      }

      _handleSegmentMoveStart(event);
    }

    event.preventDefault();
  }

  function _handleSegmentMoveDragging(event) {
    var deltaX = event.pageX - segmentMoveDragging.mouseX;
    var deltaY = event.pageY - segmentMoveDragging.mouseY;

    segmentMoveDragging.elX += deltaX;
    segmentMoveDragging.elY += deltaY;

    segmentMoveDragging.el.style.left = segmentMoveDragging.elX + 'px';
    segmentMoveDragging.el.style.top = segmentMoveDragging.elY + 'px';

    segmentMoveDragging.mouseX = event.pageX;
    segmentMoveDragging.mouseY = event.pageY;
  }

  function _handleSegmentResizeDragging(event) {
    var deltaX = event.pageX - segmentResizeDragging.mouseX;
    var deltaY = event.pageY - segmentResizeDragging.mouseY;

    var deltaFromOriginal = segmentResizeDragging.elX - segmentResizeDragging.origX;

    if (!segmentResizeDragging.right) {
      deltaFromOriginal = -deltaFromOriginal;
    }

    segmentResizeDragging.elX += deltaX;

    segmentResizeDragging.floatingEl.style.left = segmentResizeDragging.elX + 'px';

    var width = segmentResizeDragging.origWidth + deltaFromOriginal / TILE_SIZE * 2;

    _resizeSegment(segmentResizeDragging.segmentEl, width * TILE_SIZE, true, false, true);

    segmentResizeDragging.mouseX = event.pageX;
    segmentResizeDragging.mouseY = event.pageY;
  }

  function _onBodyMouseMove(event) {
    if (!draggingActive) {
      return;
    }

    switch (draggingType) {
      case DRAGGING_TYPE_SEGMENT_MOVE:
        _handleSegmentMoveDragging(event);
        break;
      case DRAGGING_TYPE_SEGMENT_RESIZE:
        _handleSegmentResizeDragging(event);
        break;
    }
  }

  function _flashWarning() {
    document.querySelector('#warning').classList.add('active');

    window.setTimeout(function() {
      document.querySelector('#warning').classList.remove('active');
    }, 0);
  }

  function _handleSegmentMoveEnd(event) {
    var el = event.target;
    while (el && (el.id != 'editable-street-canvas')) {
      el = el.parentNode;
    }
    var withinCanvas = !!el;

    var placeEl = 
        document.querySelector('#editable-street-section [type="separator"].hovered-over');

    if (placeEl) {
      var width = segmentMoveDragging.originalWidth;

      if (segmentMoveDragging.type == SEGMENT_DRAGGING_TYPE_CREATE) {
        if ((data.remainingWidth > 0) && (width > data.remainingWidth * TILE_SIZE)) {
          if (data.remainingWidth > MIN_SEGMENT_WIDTH) {
            width = _normalizeSegmentWidth(data.remainingWidth) * TILE_SIZE;
          }
        }
      }

      var el = _createSegment('separator');
      document.querySelector('#editable-street-section').insertBefore(el, placeEl);
      
      var el = _createSegment(segmentMoveDragging.originalType, width);
      document.querySelector('#editable-street-section').insertBefore(el, placeEl);

      // animation
      // TODO: Move all to CSS
      
      /*el.style.width = 50 + 'px';
      el.style.left = (-(width - 50) / 2) + 'px';
      el.style.webkitTransform = 'scaleX(.8)';
      el.style.MozTransform = 'scaleX(.8)';

      window.setTimeout(function() {
        el.style.width = width + 'px';
        el.style.left = 0;
        el.style.webkitTransform = 'none';
        el.style.MozTransform = 'none';
      }, 0);*/

      _recalculateSeparators();
      _segmentsChanged();

      data.modified = true;

      segmentMoveDragging.el.parentNode.removeChild(segmentMoveDragging.el);
    } else {
      if (!withinCanvas) {
        _dragOutOriginalIfNecessary();
      } else {
        segmentMoveDragging.originalEl.classList.remove('dragged-out');

        var el = _createSegment('separator');
        document.querySelector('#editable-street-section').insertBefore(el, 
            segmentMoveDragging.originalEl);

        var el = _createSegment('separator');
        document.querySelector('#editable-street-section').insertBefore(el, 
            segmentMoveDragging.originalEl.nextSibling);

      }

      segmentMoveDragging.el.classList.add('poof');
      window.setTimeout(function() {
        if (segmentMoveDragging.el && segmentMoveDragging.el.parentNode) {
          segmentMoveDragging.el.parentNode.removeChild(segmentMoveDragging.el);
        }
      }, 250);
    }

    draggingActive = false;
    document.body.classList.remove('segment-move-dragging');
  }

  function _handleSegmentResizeEnd(event) {
    draggingActive = false;
    document.body.classList.remove('segment-resize-dragging');

    var el = segmentResizeDragging.floatingEl;
    window.setTimeout(function() {
      el.parentNode.removeChild(el);
    }, 250);
  
    segmentResizeDragging.segmentEl.classList.remove('hover');
}

  function _onBodyMouseUp(event) {
    if (!draggingActive) {
      return;
    }

    switch (draggingType) {
      case DRAGGING_TYPE_SEGMENT_MOVE:
        _handleSegmentMoveEnd(event);
        break;
      case DRAGGING_TYPE_SEGMENT_RESIZE:
        _handleSegmentResizeEnd(event);
        break;
    }

    event.preventDefault();
  }

  function _dragOutOriginalIfNecessary() {
    if ((segmentMoveDragging.type == SEGMENT_DRAGGING_TYPE_MOVE) && 
        segmentMoveDragging.originalDraggedOut) {
      var el = _createSegment('separator');
      document.querySelector('#editable-street-section').insertBefore(el, 
          segmentMoveDragging.originalEl);

      segmentMoveDragging.originalEl.style.width = 0;
      window.setTimeout(function() {
        segmentMoveDragging.originalEl.parentNode.removeChild(segmentMoveDragging.originalEl);
        _recalculateSeparators();
        _segmentsChanged();
      }, WIDTH_RESIZE_DELAY);

      _recalculateSeparators();
      _segmentsChanged();

      segmentMoveDragging.originalDraggedOut = false;
    }
  }

  function _onSegmentMouseOver(event) {
    var el = event.target;

    while (el && !el.classList.contains('segment')) {
      el = el.parentNode;
    }
    if (el) {
      segmentHoveredEl = el;
    }
  }
  function _onSegmentMouseOut(event) {
    segmentHoveredEl = null;
  }

  function _onSeparatorMouseOver(event) {
    _dragOutOriginalIfNecessary();

    event.target.classList.add('hovered-over');
  }
  function _onSeparatorMouseOut(event) {
    event.target.classList.remove('hovered-over');
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

    if (newStreetWidth == data.streetWidth) {
      return;
    }

    data.streetWidth = newStreetWidth;
    _resizeStreetWidth();

    initializing = true;

    _createDomFromData();
    _segmentsChanged();

    initializing = false;    
  }

  function _prepareUI() {
    /*for (var id in SEGMENT_OWNERS) {
      var el = document.createElement('li');

      el.setAttribute('owner-id', id);

      el.innerHTML = '<span class="icon" type="' + id + '"></span><span class="width"></span>';

      document.querySelector('header .sizes ul').appendChild(el);
    }*/
  }

  function _onBodyKeyDown(event) {
    //console.log(event.keyCode);
    switch (event.keyCode) {
      case 39: // right arrow
      case 187: // = (or, plus)
        if (document.activeElement == document.body) {
          if (segmentHoveredEl) {
            _incrementSegmentWidth(segmentHoveredEl, true);
          }
          event.preventDefault();
        }
        break;
      case 37: // left arrow
      case 189: // minus
        if (document.activeElement == document.body) {
          if (segmentHoveredEl) {
            _incrementSegmentWidth(segmentHoveredEl, false);
          }
          event.preventDefault();
        }
        break;
      case 8: // backspace
      case 46: // Delete
        if (document.activeElement == document.body) {
          if (segmentHoveredEl && segmentHoveredEl.parentNode) {
            segmentHoveredEl.parentNode.removeChild(segmentHoveredEl);
            _segmentsChanged();
          }
          event.preventDefault();
        }
        break;
    }
  }

  function _onRemoveButtonClick(event) {
    var el = event.target.segmentEl;

    if (el) {
      el.parentNode.removeChild(el);
      _segmentsChanged();
    }
  }

  function _onImagesLoaded() {
    retinaMultiplier = window.devicePixelRatio;

    _prepareUI();

    _resizeStreetWidth();

    _getDefaultSegments();

    _createTools();

    _createDomFromData();
    _segmentsChanged();

    initializing = false;    

    _onResize();

    document.querySelector('#street-width').addEventListener('change', _onStreetWidthChange, false);

    window.addEventListener('resize', _onResize, false);

    window.addEventListener('mousedown', _onBodyMouseDown, false);
    window.addEventListener('mousemove', _onBodyMouseMove, false);
    window.addEventListener('mouseup', _onBodyMouseUp, false); 

    window.addEventListener('keydown', _onBodyKeyDown, false);   

    document.querySelector('#loading').classList.add('hidden');
  }

  function _onImageLoaded() {
    imagesRemaining--;

    if (imagesRemaining == 0) {
      _onImagesLoaded();
    }
  }
 
  main.init = function() {
    initializing = true;

    images = [];

    imagesRemaining = IMAGES_TO_BE_LOADED.length;

    for (var i in IMAGES_TO_BE_LOADED) {
      var url = IMAGES_TO_BE_LOADED[i];
      images[url] = document.createElement('img');
      images[url].addEventListener('load', _onImageLoaded, false);
      images[url].src = url + '?v' + TILE_IMAGE_VERSION;
    }
  }

  return main;
})();
