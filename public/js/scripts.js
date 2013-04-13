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

  var TILESET_IMAGE_VERSION = 7;
  var TILESET_WIDTH = 2622;
  var TILESET_HEIGHT = 384;

  var IMAGES_TO_BE_LOADED = [
    'images/tiles.png',
    'images/ui/icons/noun_project_2.svg',
    'images/ui/icons/noun_project_536.svg',
    'images/ui/icons/noun_project_97.svg',
    'images/ui/icons/noun_project_72.svg',
    'images/ui/icons/noun_project_13130.svg'
  ];

  var WIDTH_TOOL_MULTIPLIER = 4;

  var TILE_SIZE = 12; // pixels
  var CANVAS_HEIGHT = 480;
  var CANVAS_BASELINE = CANVAS_HEIGHT - 35;

  var DRAGGING_TYPE_SEGMENT_MOVE = 1;
  var DRAGGING_TYPE_SEGMENT_RESIZE = 2;

  var SEGMENT_DRAGGING_TYPE_MOVE = 1;
  var SEGMENT_DRAGGING_TYPE_CREATE = 2;

  var WIDTH_RESIZE_DELAY = 100;
  var STATUS_MESSAGE_HIDE_DELAY = 5000;
  var WIDTH_EDIT_INPUT_DELAY = 200;

  var STREET_WIDTH_CUSTOM = -1;
  var MIN_CUSTOM_STREET_WIDTH = 10;
  var MAX_CUSTOM_STREET_WIDTH = 200;

  var MIN_WIDTH_EDIT_CANVAS_WIDTH = 120;

  var MIN_SEGMENT_WIDTH = 2;
  var MAX_SEGMENT_WIDTH = 150;
  var SEGMENT_WIDTH_RESOLUTION = .5;
  var SEGMENT_WIDTH_CLICK_INCREMENT = SEGMENT_WIDTH_RESOLUTION;

  var SEGMENT_WARNING_OUTSIDE = 1;
  var SEGMENT_WARNING_WIDTH_TOO_SMALL = 2;
  var SEGMENT_WARNING_WIDTH_TOO_LARGE = 3;

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
      owner: SEGMENT_OWNER_PEDESTRIAN,
      defaultWidth: 6,
      minWidth: 6,
      graphics: {
        center: { x: 3, y: 0, width: 4, height: 15 },
        repeat: { x: 1, y: 0, width: 1, height: 15 }
      }
    },
    "sidewalk-tree": {
      name: 'Sidewalk w/ a tree',
      owner: SEGMENT_OWNER_NATURE,
      defaultWidth: 4,
      graphics: {
        center: { x: 13, y: 0, width: 6, height: 15 },
        repeat: { x: 1, y: 0, width: 1, height: 15 }
      }
    },
    "sidewalk-lamp-right": {
      name: 'Sidewalk w/ a lamp',
      owner: SEGMENT_OWNER_PEDESTRIAN,
      defaultWidth: 4,
      graphics: {
        center: { width: 0, height: 15 },
        repeat: { x: 1, y: 0, width: 1, height: 15 },
        right: { x: 102, offsetX: -2, width: 4, height: 15 }
      }
    },
    "sidewalk-lamp-left": {
      name: 'Sidewalk w/ a lamp',
      owner: SEGMENT_OWNER_PEDESTRIAN,
      defaultWidth: 4,
      graphics: {
        center: { width: 0, height: 15 },
        repeat: { x: 1, y: 0, width: 1, height: 15 },
        left: { x: 107, offsetX: -2, width: 4, height: 15 }
      }
    },
    "planting-strip": {
      name: 'Planting strip',
      owner: SEGMENT_OWNER_NATURE,
      defaultWidth: 4,
      graphics: {
        center: { width: 0, height: 15 },
        repeat: { x: 8, y: 0, width: 4, height: 15 }
      }
    },
    "bike-lane-inbound": {
      name: 'Bike lane',
      subname: 'Inbound',
      owner: SEGMENT_OWNER_BIKE,
      defaultWidth: 6,
      graphics: {
        center: { x: 92, y: 0, width: 4, height: 15 },
        repeat: { x: 90, y: 0, width: 1, height: 15 }
      }
    },
    "bike-lane-outbound": {
      name: 'Bike lane',
      subname: 'Outbound',
      owner: SEGMENT_OWNER_BIKE,
      defaultWidth: 6,
      graphics: {
        center: { x: 97, y: 0, width: 4, height: 15 },
        repeat: { x: 90, y: 0, width: 1, height: 15 }
      }
    },
    "parking-lane": {
      name: 'Parking lane',
      owner: SEGMENT_OWNER_CAR,
      defaultWidth: 8,
      minWidth: 8,
      maxWidth: 10,
      graphics: {
        center: { x: 50, y: 0, width: 8, height: 15 },
        repeat: { x: 26, y: 0, width: 1, height: 15 },
        left: { x: 46, width: 3, height: 15 }
      }
    },
    "drive-lane-inbound": {
      name: 'Drive lane',
      subname: 'Inbound',
      owner: SEGMENT_OWNER_CAR,
      defaultWidth: 10,
      minWidth: 9,
      maxWidth: 12,
      graphics: {
        center: { x: 28, y: 0, width: 8, height: 15 },
        repeat: { x: 26, y: 0, width: 1, height: 15 }
      }
    },
    "drive-lane-outbound": {
      name: 'Drive lane',
      subname: 'Outbound',
      owner: SEGMENT_OWNER_CAR,
      defaultWidth: 10,
      minWidth: 9,
      maxWidth: 12,
      graphics: {
        center: { x: 37, y: 0, width: 8, height: 15 },
        repeat: { x: 26, y: 0, width: 1, height: 15 }
      }
    },
    "turn-lane": {
      name: 'Turn lane',
      owner: SEGMENT_OWNER_CAR,
      defaultWidth: 10,
      minWidth: 9,
      maxWidth: 12,
      graphics: {
        center: { x: 81, y: 0, width: 8, height: 15 },
        repeat: { x: 26, y: 0, width: 1, height: 15 }
      }
    },
    "bus-lane-inbound": {
      name: 'Bus lane',
      subname: 'Inbound',
      owner: SEGMENT_OWNER_PUBLIC_TRANSIT,
      defaultWidth: 12,
      minWidth: 9,
      maxWidth: 12,
      graphics: {
        center: { x: 59, y: 0, width: 10, height: 15 },
        repeat: { x: 26, y: 0, width: 1, height: 15 }
      }
    },
    "bus-lane-outbound": {
      name: 'Bus lane',
      subname: 'Outbound',
      owner: SEGMENT_OWNER_PUBLIC_TRANSIT,
      defaultWidth: 12,
      minWidth: 9,
      maxWidth: 12,
      graphics: {
        center: { x: 70, y: 0, width: 10, height: 15 },
        repeat: { x: 26, y: 0, width: 1, height: 15 }
      }
    },
    "small-median": {
      name: 'Small median',
      owner: SEGMENT_OWNER_CAR,
      defaultWidth: 4,
      graphics: {
        center: { x: 22, y: 0, width: 3, height: 15 },
        repeat: { x: 20, y: 0, width: 1, height: 15 }
      }
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
      { type: "sidewalk-tree", width: 4 },
      { type: "sidewalk-lamp-right", width: 2 },
      { type: "bike-lane-inbound", width: 6 },
      { type: "drive-lane-inbound", width: 10 },
      { type: "drive-lane-inbound", width: 10 },
      { type: "planting-strip", width: 4 },
      { type: "drive-lane-outbound", width: 10 },
      { type: "drive-lane-outbound", width: 10 },
      { type: "bike-lane-outbound", width: 6 },
      { type: "sidewalk-lamp-left", width: 2 },
      { type: "sidewalk-tree", width: 4 },
      { type: "sidewalk", width: 6 }
    ]
  };

  var data = {
    streetWidth: 80,
    occupiedWidth: null,
    remainingWidth: null,

    segments: []
  };

  var images;
  var imagesRemaining;  

  var lastData;
  var undoStack = [];
  var undoPosition = 0;
  var doNotCreateUndo = false;

  var draggingActive = false;
  var draggingType;

  var segmentHoveredEl;

  var touchSupport;
  var retinaMultiplier;
  var useCssTransform;

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
    segmentBeforeEl: null,
    segmentAfterEl: null,
    mouseX: null,
    mouseY: null,
    el: null,
    elX: null,
    elY: null,
    originalEl: null,
    originalWidth: null,
  };

  var initializing = false;

  var widthEditHeld = false;
  var resizeSegmentTimerId = -1;

  var infoBubbleVisible = false;
  var infoButtonHoverTimerId = -1;

  var streetSectionCanvasLeft;

 
  function _setSegmentContents(el, type, segmentWidth, isTool) {
    var segmentInfo = SEGMENT_INFO[type];

    if (segmentInfo.graphics.center && 
        typeof segmentInfo.graphics.center.width != 'undefined') {
      var realWidth = segmentInfo.graphics.center.width;
    } else {
      var realWidth = segmentInfo.defaultWidth;
    }

    var multiplier = isTool ? (WIDTH_TOOL_MULTIPLIER / TILE_SIZE) : 1;

    var bkPositionX = (segmentInfo.graphics.center.x || 0) * TILE_SIZE;
    var bkPositionY = 
        CANVAS_BASELINE - (segmentInfo.graphics.center.height || 0) * TILE_SIZE -
        (segmentInfo.graphics.center.y || 0) * TILE_SIZE;

    var left = 0;
    var top = 0;
    var width = realWidth * TILE_SIZE;
    var height = CANVAS_HEIGHT;

    // center properly
    var segmentRealWidth = segmentWidth / TILE_SIZE / multiplier;
    left += (segmentRealWidth - realWidth) * TILE_SIZE / 2;

    // sticking out
    var maxWidth = segmentWidth;
    if (!isTool) {
      if (maxWidth < realWidth * TILE_SIZE) {
        maxWidth = realWidth * TILE_SIZE;

        left = 0;
      }
    }

    var canvasLeft = (segmentWidth - maxWidth) / 2;

    var canvasOffsetX = 0;

    if (segmentInfo.graphics.left && segmentInfo.graphics.left.offsetX < 0) {
      var z = -segmentInfo.graphics.left.offsetX * TILE_SIZE;

      canvasLeft -= z;
      maxWidth += z;
    }

    if (segmentInfo.graphics.right && segmentInfo.graphics.right.offsetX < 0) {
      canvasOffsetX = -segmentInfo.graphics.right.offsetX * TILE_SIZE;

      maxWidth += canvasOffsetX;
    }

    var canvasEl = document.createElement('canvas');
    canvasEl.classList.add('image');
    canvasEl.width = maxWidth * retinaMultiplier;
    canvasEl.height = height * retinaMultiplier;
    canvasEl.style.width = maxWidth + 'px';
    canvasEl.style.height = height + 'px';

    if (!isTool) {
      canvasEl.style.left = canvasLeft + 'px';
    } else {
      canvasEl.style.left = 0;
    }

    var ctx = canvasEl.getContext('2d');

    var realHeight = (segmentInfo.graphics.center.height || 0) * TILE_SIZE;

    if (segmentInfo.graphics.repeat) {
      var repeatPositionX = segmentInfo.graphics.repeat.x * TILE_SIZE;
      var w = segmentInfo.graphics.repeat.width * TILE_SIZE * multiplier;

      var count = Math.floor((segmentWidth) / w + 1);

      if (segmentWidth < maxWidth) {
        var repeatStartX = -canvasLeft;
      } else {
        var repeatStartX = -(segmentWidth - maxWidth) - canvasOffsetX;
      }

      if (isTool) {
        repeatStartX = 0;
      }

      for (var i = 0; i < count; i++) {
        // remainder
        if (i == count - 1) {
          w = segmentWidth - (count - 1) * w;
        }

        if (w > 0) {
          ctx.drawImage(images['images/tiles.png'], 
            repeatPositionX * 2, 
            0, 
            w * 2, 
            realHeight * 2, 
            (repeatStartX + (i * segmentInfo.graphics.repeat.width) * TILE_SIZE) * retinaMultiplier * multiplier, 
            // TODO const
            ((isTool ? 20 : 265) + top) * retinaMultiplier, 
            w * retinaMultiplier, 
            realHeight * retinaMultiplier * multiplier);
        }
      }
    }      

    if (segmentInfo.graphics.left) {
      var leftPositionX = segmentInfo.graphics.left.x * TILE_SIZE;

      var w = segmentInfo.graphics.left.width * TILE_SIZE;

      ctx.drawImage(images['images/tiles.png'], 
        leftPositionX * 2, 
        0, 
        w * 2, 
        realHeight * 2, 
        0 * multiplier * retinaMultiplier, 
        // TODO const
        ((isTool ? 20 : 265) + top) * retinaMultiplier, 
        w * multiplier * retinaMultiplier, 
        realHeight * retinaMultiplier * multiplier);
    }

    if (segmentInfo.graphics.right) {
      var rightPositionX = segmentInfo.graphics.right.x * TILE_SIZE;

      var w = segmentInfo.graphics.right.width * TILE_SIZE;

      var rightTargetX = maxWidth - w;

      if (isTool) {
        rightTargetX -= segmentInfo.graphics.right.offsetX * TILE_SIZE * multiplier;
      }

      ctx.drawImage(images['images/tiles.png'], 
        rightPositionX * 2, 
        0, 
        w * 2, 
        realHeight * 2, 
        rightTargetX * retinaMultiplier, 
        // TODO const
        ((isTool ? 20 : 265) + top) * retinaMultiplier, 
        w * retinaMultiplier * multiplier, 
        realHeight * retinaMultiplier * multiplier);
    }

    if (width > 0) {
      ctx.drawImage(images['images/tiles.png'], 
        bkPositionX * 2, 
        0, 
        width * 2, 
        realHeight * 2, 
        left * retinaMultiplier * multiplier, 
        // TODO const
        ((isTool ? 20 : 265) + top) * retinaMultiplier, 
        width * retinaMultiplier * multiplier, 
        realHeight * retinaMultiplier * multiplier);
    }
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

    _widthEditInputChanged(el, true);

    el.hold = false;
    widthEditHeld = false;
  }

  function _widthEditInputChanged(el, immediate) {
    window.clearTimeout(resizeSegmentTimerId);

    var width = parseFloat(el.value);

    if (width) {
      var segmentEl = el.segmentEl;

      if (immediate) {
        _resizeSegment(segmentEl, width * TILE_SIZE, false, false, true);
      } else {
        resizeSegmentTimerId = window.setTimeout(function() {
          _resizeSegment(segmentEl, width * TILE_SIZE, false, false, true);
        }, WIDTH_EDIT_INPUT_DELAY);
      }
    }
  }

  function _onWidthEditInput(event) {
    _widthEditInputChanged(event.target, false);
  }

  function _onWidthEditKeyDown(event) {
    var el = event.target;

    // TODO const
    switch (event.keyCode) {
      case 13: // enter
        _widthEditInputChanged(el, true);
        _loseAnyFocus();
        el.value = el.segmentEl.getAttribute('width');
        break;
      case 27: // Esc
        el.value = el.oldValue;
        _widthEditInputChanged(el, true);
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

  function _resizeSegment(el, width, updateEdit, isTool, immediate, initial) {
    if (!isTool) {
      var width = _normalizeSegmentWidth(width / TILE_SIZE) * TILE_SIZE;
    }

    if (immediate) {
      el.classList.add('immediate-resize');

      // TODO const
      window.setTimeout(function() {
        el.classList.remove('immediate-resize');
      }, 100);
    }

    el.style.width = width + 'px';
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

    if (!initial) {
      _segmentsChanged();
    }
  }

  function _moveInfoBubble(segmentEl) {
    var infoBubbleEl = document.querySelector('#info-bubble');

    var infoBubbleWidth = infoBubbleEl.offsetWidth;
    var infoBubbleHeight = infoBubbleEl.offsetHeight;

    var pos = _getElAbsolutePos(segmentEl);

    var left = (pos[0] + segmentEl.offsetWidth / 2) - (infoBubbleWidth / 2);
    var top = pos[1];

    infoBubbleEl.style.left = left + 'px';
    infoBubbleEl.style.height = infoBubbleHeight + 'px';
    infoBubbleEl.style.top = (top + 510 - infoBubbleHeight) + 'px';

    var segment = data.segments[parseInt(segmentEl.dataNo)];

    var html = '';
    html += '<button class="close">×</button>';

    html += '<h1>' + SEGMENT_INFO[segmentEl.getAttribute('type')].name + '</h1>';
    html += '<section class="content">';
    if (segment.warnings[SEGMENT_WARNING_OUTSIDE]) {
      html += '<p class="warning">';
      html += '<strong>This segment doesn’t fit within the street.</strong> ';
      html += 'Resize the segment or remove other segments.';
      html += '</p>';
    }
    if (segment.warnings[SEGMENT_WARNING_WIDTH_TOO_SMALL]) {
      html += '<p class="warning">';
      html += '<strong>This segment is not wide enough.</strong> ';
      html += 'Drive lanes under 8" lorem ipsum.';
      html += '</p>';
    }
    if (segment.warnings[SEGMENT_WARNING_WIDTH_TOO_LARGE]) {
      html += '<p class="warning">';
      html += '<strong>This segment is too wide.</strong> ';
      html += 'Drive lanes over 15" lorem ipsum.';
      html += '</p>';
    }
    html += '<p class="photo"><img src="images/info-bubble-examples/bike-lane.jpg"></p>';
    html += '<p class="description">Etizzle sizzle urna ut nisl. Tellivizzle quizzle arcu. Own yo’ pulvinar, ipsizzle shut the shizzle up bizzle we gonna chung, nulla purizzle izzle brizzle, shizzle my nizzle crocodizzle nizzle metus nulla izzle izzle. Vivamus ullamcorpizzle, tortor et varizzle owned, mah nizzle black break yo neck, yall crackalackin, izzle shiz leo elizzle fizzle dolizzle. Maurizzle aliquet, orci vel mah nizzle yippiyo, sizzle cool luctus fizzle, izzle bibendizzle enizzle dizzle yippiyo nisl. Nullizzle phat velizzle shiznit get down get down eleifend dawg. Phasellizzle nec nibh. Curabitizzle nizzle velit boom shackalack uhuh ... yih! sodalizzle facilisizzle. Maecenas things nulla, iaculizzle check it out, pot sed, rizzle a, erizzle. Nulla vitae turpis fo shizzle my nizzle nibh get down get down nizzle. Nizzle pulvinar consectetizzle velizzle. Aliquizzle mofo volutpizzle. Nunc ut leo izzle shit get down get down faucibus. Crizzle nizzle lacizzle the bizzle shizznit condimentizzle ultricies. Ut nisl. Fo shizzle my nizzle izzle fo shizzle mah nizzle fo rizzle, mah home g-dizzle. Integer laorizzle nizzle away mi. Crunk at turpizzle.</p>';
    html += '</section>';

    infoBubbleEl.innerHTML = html;

    infoBubbleEl.querySelector('.close').addEventListener('click', _hideInfoBubble, false);

    var el = document.querySelector('.segment.hover');
    if (el) {
      el.classList.remove('hover');
    }

    segmentEl.classList.add('hover');
  }

  function _hideInfoBubble() {
    var el = document.querySelector('.segment.hover');
    if (el) {
      el.classList.remove('hover');
    }

    var infoBubbleEl = document.querySelector('#info-bubble');
    infoBubbleEl.classList.remove('visible');
    infoBubbleVisible = false;

    document.body.classList.remove('info-bubble-visible');
  }

  function _onInfoButtonMouseOver(event) {
    if (!infoBubbleVisible) {
      return;
    }

    var el = event.target;
    var segmentEl = el.segmentEl;

    window.clearTimeout(infoButtonHoverTimerId);

    // TODO const
    infoButtonHoverTimerId = window.setTimeout(function() { _showInfoBubble(segmentEl); }, 250);
  }

  function _onInfoButtonMouseOut(event) {
    window.clearTimeout(infoButtonHoverTimerId);    
  }

  function _showInfoBubble(segmentEl) {
    window.clearTimeout(infoButtonHoverTimerId);

    if (!infoBubbleVisible) {
      var infoBubbleEl = document.querySelector('#info-bubble');
      infoBubbleEl.classList.add('visible');
      infoBubbleEl.classList.add('no-move-transition');
      infoBubbleVisible = true;
      document.body.classList.add('info-bubble-visible');
    }

    _moveInfoBubble(segmentEl);

    window.setTimeout(function() {
      infoBubbleEl.classList.remove('no-move-transition');
    }, 0);
  }

  function _onInfoButtonClick(event) {
    window.clearTimeout(infoButtonHoverTimerId);

    if (infoBubbleVisible) {
      _hideInfoBubble();
    } else {
      var el = event.target;
      var segmentEl = el.segmentEl;

      _showInfoBubble(segmentEl);
    }
  }

  // TODO pass segment object instead of bits and pieces
  function _createSegment(type, width, isUnmovable, isTool) {
    var el = document.createElement('div');
    el.classList.add('segment');
    el.setAttribute('type', type);

    if (isUnmovable) {
      el.classList.add('unmovable');
    }
    
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
      innerEl.classList.add('remove');
      innerEl.innerHTML = '×';
      innerEl.segmentEl = el;
      innerEl.tabIndex = -1;
      innerEl.setAttribute('title', 'Remove segment');
      innerEl.addEventListener('click', _onRemoveButtonClick, false);
      commandsEl.appendChild(innerEl);        

      /*var innerEl = document.createElement('button');
      innerEl.classList.add('info');
      innerEl.segmentEl = el;
      innerEl.tabIndex = -1;
      innerEl.addEventListener('mouseover', _onInfoButtonMouseOver, false);
      innerEl.addEventListener('mouseout', _onInfoButtonMouseOut, false);
      innerEl.addEventListener('click', _onInfoButtonClick, false);
      commandsEl.appendChild(innerEl); */

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

    if (width) {
      _resizeSegment(el, width, true, isTool, true, true);
    }    
    return el;
  }

  function _createDomFromData() {
    document.querySelector('#editable-street-section').innerHTML = '';

    for (var i in data.segments) {
      var segment = data.segments[i];

      var el = _createSegment(segment.type, segment.width * TILE_SIZE, 
          segment.unmovable);
      document.querySelector('#editable-street-section').appendChild(el);

      data.segments[i].el = el;
      data.segments[i].el.dataNo = i;
    }

    _repositionSegments();
  }

  var SEGMENT_DRAG_HOLE = 40;

  function _repositionSegments() {
    var left = 0;

    for (var i in data.segments) {
      var el = data.segments[i].el;

      if (el == segmentMoveDragging.segmentBeforeEl) {
        left += SEGMENT_DRAG_HOLE;

        if (!segmentMoveDragging.segmentAfterEl) {
          left += SEGMENT_DRAG_HOLE;
        }
      }

      if (el.classList.contains('dragged-out')) {
        var width = 0;
      } else {
        var width = parseFloat(el.getAttribute('width')) * TILE_SIZE;
      }

      el.savedLeft = left; // so we don’t have to use offsetLeft
      el.savedWidth = width;

      left += width;

      if (el == segmentMoveDragging.segmentAfterEl) {
        left += SEGMENT_DRAG_HOLE;

        if (!segmentMoveDragging.segmentBeforeEl) {
          left += SEGMENT_DRAG_HOLE;
        }
      }
    }

    var occupiedWidth = left;

    var mainLeft = (data.streetWidth * TILE_SIZE - occupiedWidth) / 2;

    for (var i in data.segments) {
      var el = data.segments[i].el;

      el.savedLeft += mainLeft;

      if (useCssTransform) {
        el.style[useCssTransform] = 'translateX(' + el.savedLeft + 'px)';
        el.cssTransformLeft = el.savedLeft;
      } else {
        el.style.left = el.savedLeft + 'px';
      }
    }
  }

  function _applyWarningsToSegments() {
    for (var i in data.segments) {
      var segment = data.segments[i];

      if (segment.el) {
        if (segment.warnings[SEGMENT_WARNING_OUTSIDE] || 
            segment.warnings[SEGMENT_WARNING_WIDTH_TOO_SMALL] ||
            segment.warnings[SEGMENT_WARNING_WIDTH_TOO_LARGE]) {
          segment.el.classList.add('warning');          
        } else {
          segment.el.classList.remove('warning');                    
        }

        if (segment.warnings[SEGMENT_WARNING_OUTSIDE]) {
          segment.el.classList.add('outside');
        } else {
          segment.el.classList.remove('outside');
        }
      }
    }
  }

  function _recalculateWidth() {
    data.occupiedWidth = 0;

    for (var i in data.segments) {
      var segment = data.segments[i];

      data.occupiedWidth += segment.width;
    }   

    data.remainingWidth = (data.streetWidth - data.occupiedWidth);

    var position = data.streetWidth / 2 - data.occupiedWidth / 2;

    for (var i in data.segments) {
      var segment = data.segments[i];
      var segmentInfo = SEGMENT_INFO[segment.type];

      if (segment.el) {
        if ((position < 0) || ((position + segment.width) > data.streetWidth)) {
          segment.warnings[SEGMENT_WARNING_OUTSIDE] = true;
        } else {
          segment.warnings[SEGMENT_WARNING_OUTSIDE] = false;
        }

        if (segmentInfo.minWidth && (segment.width < segmentInfo.minWidth)) {
          segment.warnings[SEGMENT_WARNING_WIDTH_TOO_SMALL] = true;
        } else {
          segment.warnings[SEGMENT_WARNING_WIDTH_TOO_SMALL] = false;          
        }

        if (segmentInfo.maxWidth && (segment.width > segmentInfo.maxWidth)) {
          segment.warnings[SEGMENT_WARNING_WIDTH_TOO_LARGE] = true;
        } else {
          segment.warnings[SEGMENT_WARNING_WIDTH_TOO_LARGE] = false;          
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

    _applyWarningsToSegments();
  }

  function _segmentsChanged() {
    if (!initializing) {
      _createDataFromDom();
    }
    _recalculateWidth();
    _recalculateOwnerWidths();

    for (var i in data.segments) {
      if (data.segments[i].el) {
        data.segments[i].el.dataNo = i;
      }
    }

    _createUndoIfNecessary();

    _updateUndoButtons();

    _repositionSegments();
  }

  function _undo() {
    if (_isUndoAvailable()) {
      undoStack[undoPosition] = _trimNonUserData();
      undoPosition--;
      data = undoStack[undoPosition];

      doNotCreateUndo = true;
      _createDomFromData();
      _segmentsChanged();
      _resizeStreetWidth();
      doNotCreateUndo = false;

      _updateUndoButtons();
      lastData = _trimNonUserData();

      _statusMessage.hide();
    } else {
      _statusMessage.show('Nothing to undo.')
    }
  }

  function _redo() {
    if (_isRedoAvailable()) {
      undoPosition++;
      data = undoStack[undoPosition];

      doNotCreateUndo = true;
      _createDomFromData();
      _segmentsChanged();
      _resizeStreetWidth();
      doNotCreateUndo = false;

      _updateUndoButtons();
      lastData = _trimNonUserData();

      _statusMessage.hide();
    } else {
      _statusMessage.show('Nothing to redo.')
    }

  }

  function _createUndoIfNecessary() {
    if (doNotCreateUndo) {
      return;
    }

    var currentData = _trimNonUserData();

    if (JSON.stringify(currentData) != JSON.stringify(lastData)) {
      // This removes future undos in case we undo a few times and then do
      // something undoable.
      undoStack = undoStack.splice(0, undoPosition);
      undoStack[undoPosition] = lastData;

      undoPosition++;

      lastData = currentData;

      _updateUndoButtons();
    }
  }

  function _createDataFromDom() {
    var els = document.querySelectorAll('#editable-street-section > .segment');

    data.segments = [];

    for (var i = 0, el; el = els[i]; i++) {
      var segment = {};
      segment.type = el.getAttribute('type');
      segment.width = parseFloat(el.getAttribute('width'));
      segment.el = el;

      segment.warnings = [];

      data.segments.push(segment);
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
    if (data.occupiedWidth > data.streetWidth) {
      maxWidth = data.occupiedWidth;
    }

    var multiplier = chartWidth / maxWidth;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;

    var bottom = 70;

    _drawLine(ctx, left, 20, left, bottom);
    if (maxWidth > data.streetWidth) {
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
        left, 30, left + data.streetWidth * multiplier, 30);
  
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
      if (ctx.setLineDash) {
        ctx.setLineDash([15, 10]);
      }
      _drawArrowLine(ctx, x, 60, left + data.streetWidth * multiplier, 60, _prettifyWidth(data.remainingWidth * TILE_SIZE));
      ctx.restore();
    }

    x = left + maxWidth * multiplier;

    for (var id in SEGMENT_OWNERS) {
      if (ownerWidths[id] == 0) {
        var width = EMPTY_WIDTH;

        ctx.fillStyle = 'rgb(100, 100, 100)';
        ctx.strokeStyle = 'rgb(100, 100, 100)';

        _drawArrowLine(ctx, x, 60, x + width, 60, '–');
        _drawLine(ctx, x + width, 50, x + width, 70);

        var imageWidth = images[SEGMENT_OWNERS[id].imageUrl].width / 5 * SEGMENT_OWNERS[id].imageSize;
        var imageHeight = images[SEGMENT_OWNERS[id].imageUrl].height / 5 * SEGMENT_OWNERS[id].imageSize;

        ctx.save();
        ctx.globalAlpha = .5;
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

    document.querySelector('#street-width-canvas').style.left = 
        CHART_MARGIN + 'px';
    document.querySelector('#street-width-canvas').style.width = 
        (data.streetWidth * multiplier) + 'px';
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
  }

  function _getElAbsolutePos(el) {
    var pos = [0, 0];

    do {
      pos[0] += el.offsetLeft + (el.cssTransformLeft || 0);
      pos[1] += el.offsetTop + (el.cssTransformTop || 0);

      el = el.offsetParent;
    } while (el);

    return pos;
  }

  function _handleSegmentResizeStart(event) {
    doNotCreateUndo = true;

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

    var segmentInfo = SEGMENT_INFO[el.segmentEl.getAttribute('type')];

    if (segmentInfo.minWidth) {
      var guideEl = document.createElement('div');
      guideEl.classList.add('guide');

      var width = segmentInfo.minWidth * TILE_SIZE;
      guideEl.style.width = width + 'px';
      guideEl.style.marginLeft = (-width / 2) + 'px';
      el.segmentEl.appendChild(guideEl);
    }

    var remainingWidth = 
        data.remainingWidth + parseFloat(el.segmentEl.getAttribute('width'));

    if (remainingWidth && 
        (((!segmentInfo.minWidth) && (remainingWidth >= MIN_SEGMENT_WIDTH)) || (remainingWidth >= segmentInfo.minWidth)) && 
        ((!segmentInfo.maxWidth) || (remainingWidth <= segmentInfo.maxWidth))) {
      var guideEl = document.createElement('div');
      guideEl.classList.add('guide');

      var width = remainingWidth * TILE_SIZE;
      guideEl.style.width = width + 'px';
      guideEl.style.marginLeft = (-width / 2) + 'px';
      el.segmentEl.appendChild(guideEl);
    } else if (segmentInfo.maxWidth) {
      var guideEl = document.createElement('div');
      guideEl.classList.add('guide');

      var width = segmentInfo.maxWidth * TILE_SIZE;
      guideEl.style.width = width + 'px';
      guideEl.style.marginLeft = (-width / 2) + 'px';
      el.segmentEl.appendChild(guideEl);
    }
  }

  function _handleSegmentMoveStart(event) {
    doNotCreateUndo = true;

    if (event.touches && event.touches[0]) {
      var x = event.touches[0].pageX;
      var y = event.touches[0].pageY;
    } else {
      var x = event.pageX;
      var y = event.pageY;
    }    

    var el = event.target;

    draggingActive = true;
    draggingType = DRAGGING_TYPE_SEGMENT_MOVE;
    document.body.classList.add('segment-move-dragging');

    segmentMoveDragging.originalEl = el;

    segmentMoveDragging.originalType = segmentMoveDragging.originalEl.getAttribute('type');

    if (segmentMoveDragging.originalEl.classList.contains('tool')) {
      segmentMoveDragging.type = SEGMENT_DRAGGING_TYPE_CREATE;
      segmentMoveDragging.originalWidth = 
          SEGMENT_INFO[segmentMoveDragging.originalType].defaultWidth * TILE_SIZE;
    } else {
      segmentMoveDragging.type = SEGMENT_DRAGGING_TYPE_MOVE;      
      segmentMoveDragging.originalWidth = 
          segmentMoveDragging.originalEl.offsetWidth;
    }

    var pos = _getElAbsolutePos(el);

    segmentMoveDragging.elX = pos[0];
    segmentMoveDragging.elY = pos[1];

    if (segmentMoveDragging.type == SEGMENT_DRAGGING_TYPE_CREATE) {
      // TODO const
      segmentMoveDragging.elY -= 340;
      segmentMoveDragging.elX -= segmentMoveDragging.originalWidth / 3;
    }

    if (touchSupport) {
      // TODO const
      if (segmentMoveDragging.type == SEGMENT_DRAGGING_TYPE_CREATE) {
        segmentMoveDragging.elY -= 100;      
      } else {
        segmentMoveDragging.elY -= 50;      
      }
    }

    segmentMoveDragging.mouseX = x;
    segmentMoveDragging.mouseY = y;

    segmentMoveDragging.el = document.createElement('div');
    segmentMoveDragging.el.classList.add('segment');
    segmentMoveDragging.el.classList.add('dragging');
    segmentMoveDragging.el.setAttribute('type', segmentMoveDragging.originalType);
    _setSegmentContents(segmentMoveDragging.el, segmentMoveDragging.originalType, segmentMoveDragging.originalWidth);
    document.body.appendChild(segmentMoveDragging.el);

    if (useCssTransform) {
      segmentMoveDragging.el.style[useCssTransform] = 
          'translate(' + segmentMoveDragging.elX + 'px, ' + segmentMoveDragging.elY + 'px)';
    } else {
      segmentMoveDragging.el.style.left = segmentMoveDragging.elX + 'px';
      segmentMoveDragging.el.style.top = segmentMoveDragging.elY + 'px';
    }

    if (segmentMoveDragging.type == SEGMENT_DRAGGING_TYPE_MOVE) {
      segmentMoveDragging.originalEl.classList.add('dragged-out');
    }

    segmentMoveDragging.segmentBeforeEl = null;
    segmentMoveDragging.segmentAfterEl = null;
  }

  function _onBodyMouseDown(event) {
    var el = event.target;

    _loseAnyFocus();

    var topEl = event.target;
    while (topEl && (topEl.id != 'info-bubble')) {
      topEl = topEl.parentNode;
    }
    var withinInfoBubble = !!topEl;

    if (withinInfoBubble) {
      return;
    }

    if (!el.classList.contains('info')) {
      _hideInfoBubble();
    }

    if (el.classList.contains('drag-handle')) {
      _handleSegmentResizeStart(event);
    } else {
      if (!el.classList.contains('segment') || 
          el.classList.contains('unmovable')) {
        return;
      }

      _handleSegmentMoveStart(event);
    }

    event.preventDefault();
  }



  function _makeSpaceBetweenSegments(x, y) {
    var left = x - streetSectionCanvasLeft;

    var selectedSegmentBefore = null;
    var selectedSegmentAfter = null;

    for (var i in data.segments) {
      var segment = data.segments[i];

      if (!selectedSegmentBefore && ((segment.el.savedLeft + segment.el.savedWidth / 2) > left)) {
        selectedSegmentBefore = segment.el;
      }

      if ((segment.el.savedLeft + segment.el.savedWidth / 2) <= left) {
        selectedSegmentAfter = segment.el;
      }
    }

    if ((selectedSegmentBefore != segmentMoveDragging.segmentBeforeEl) ||
        (selectedSegmentAfter != segmentMoveDragging.segmentAfterEl)) {
      segmentMoveDragging.segmentBeforeEl = selectedSegmentBefore;
      segmentMoveDragging.segmentAfterEl = selectedSegmentAfter;
      _repositionSegments();
    }
  }

  function _handleSegmentMoveDragging(event) {
    var x = event.pageX;
    var y = event.pageY;

    var deltaX = x - segmentMoveDragging.mouseX;
    var deltaY = y - segmentMoveDragging.mouseY;

    segmentMoveDragging.elX += deltaX;
    segmentMoveDragging.elY += deltaY;

    if (useCssTransform) {
      segmentMoveDragging.el.style[useCssTransform] = 
          'translate(' + segmentMoveDragging.elX + 'px, ' + segmentMoveDragging.elY + 'px)';

      var deg = deltaX;

      if (deg > 20) {
        deg = 20;
      }
      if (deg < -20) {
        deg = -20;
      }

      if (useCssTransform) {
        segmentMoveDragging.el.querySelector('canvas').style[useCssTransform] = 
            'rotateZ(' + deg + 'deg)';
      }
    } else {
      segmentMoveDragging.el.style.left = segmentMoveDragging.elX + 'px';
      segmentMoveDragging.el.style.top = segmentMoveDragging.elY + 'px';
    }

    segmentMoveDragging.mouseX = x;
    segmentMoveDragging.mouseY = y;

    _makeSpaceBetweenSegments(x, y);
  }

  function _handleSegmentResizeDragging(event) {
    var x = event.pageX;
    var y = event.pageY;

    var deltaX = x - segmentResizeDragging.mouseX;
    var deltaY = y - segmentResizeDragging.mouseY;

    var deltaFromOriginal = 
        segmentResizeDragging.elX - segmentResizeDragging.origX;

    if (!segmentResizeDragging.right) {
      deltaFromOriginal = -deltaFromOriginal;
    }

    segmentResizeDragging.elX += deltaX;

    segmentResizeDragging.floatingEl.style.left = 
        segmentResizeDragging.elX + 'px';

    var width = 
        segmentResizeDragging.origWidth + deltaFromOriginal / TILE_SIZE * 2;

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

    event.preventDefault();
  }

  function _flashWarning() {
    document.querySelector('#warning').classList.add('active');

    window.setTimeout(function() {
      document.querySelector('#warning').classList.remove('active');
    }, 0);
  }

  function _removeTouchSegmentFadeouts() {
    var els = document.querySelectorAll('.fade-out-end');
    for (var i = 0, el; el = els[i]; i++) {
      el.classList.remove('fade-out-end');
    }
  }

  function _createTouchSegmentFadeout(el) {
    if (touchSupport) {
      _removeTouchSegmentFadeouts();

      window.clearTimeout(el.fadeoutTimerId);
      el.classList.remove('fade-out-end');
      el.classList.add('fade-out-start');

      window.setTimeout(function() {
        el.classList.remove('fade-out-start');
        el.classList.add('fade-out-end');
      }, 0);

      el.fadeoutTimerId = window.setTimeout(function() {
        el.classList.remove('fade-out-end');
      }, 5000);
    }
  }

  function _handleSegmentMoveEnd(event) {
    doNotCreateUndo = false;

    var el = document.elementFromPoint(segmentMoveDragging.mouseX, segmentMoveDragging.mouseY);
    while (el && (el.id != 'editable-street-section')) {
      el = el.parentNode;
    }
    var withinCanvas = !!el;

    if (!withinCanvas) {
      if (segmentMoveDragging.type == SEGMENT_DRAGGING_TYPE_MOVE) {
        segmentMoveDragging.originalEl.parentNode.removeChild(segmentMoveDragging.originalEl);
      }
    } else if (segmentMoveDragging.segmentBeforeEl || segmentMoveDragging.segmentAfterEl) {
      var width = segmentMoveDragging.originalWidth;

      if (segmentMoveDragging.type == SEGMENT_DRAGGING_TYPE_CREATE) {
        if ((data.remainingWidth > 0) && (width > data.remainingWidth * TILE_SIZE)) {
          if (data.remainingWidth > MIN_SEGMENT_WIDTH) {
            width = _normalizeSegmentWidth(data.remainingWidth) * TILE_SIZE;
          }
        }
      }
      
      var newEl = _createSegment(segmentMoveDragging.originalType, width);

      newEl.classList.add('create');

      if (segmentMoveDragging.segmentBeforeEl) {
        document.querySelector('#editable-street-section').
            insertBefore(newEl, segmentMoveDragging.segmentBeforeEl);
      } else {
        document.querySelector('#editable-street-section').
            insertBefore(newEl, segmentMoveDragging.segmentAfterEl.nextSibling);
      }

      window.setTimeout(function() {
        newEl.classList.remove('create');
      }, 100);

      if (segmentMoveDragging.type == SEGMENT_DRAGGING_TYPE_MOVE) {
        var draggedOutEl = document.querySelector('.segment.dragged-out');
        draggedOutEl.parentNode.removeChild(draggedOutEl);
      }

      _createTouchSegmentFadeout(el);
    } else {            
      _createTouchSegmentFadeout(segmentMoveDragging.originalEl);

      segmentMoveDragging.originalEl.classList.remove('dragged-out');
    }

    segmentMoveDragging.el.parentNode.removeChild(segmentMoveDragging.el);

    segmentMoveDragging.segmentBeforeEl = null;
    segmentMoveDragging.segmentAfterEl = null;
    _repositionSegments();
    _segmentsChanged();

    draggingActive = false;
    document.body.classList.remove('segment-move-dragging');
  }

  function _handleSegmentResizeEnd(event) {
    doNotCreateUndo = false;

    _segmentsChanged();

    draggingActive = false;
    document.body.classList.remove('segment-resize-dragging');

    // TODO const
    var el = segmentResizeDragging.floatingEl;
    window.setTimeout(function() {
      el.parentNode.removeChild(el);
    }, 250);
  
    segmentResizeDragging.segmentEl.classList.remove('hover');

    var guideEl;
    while (guideEl = segmentResizeDragging.segmentEl.querySelector('.guide')) {
      guideEl.parentNode.removeChild(guideEl);
    }
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

  function _createTools() {
    for (var i in SEGMENT_INFO) {
      var segmentInfo = SEGMENT_INFO[i];

      var width = segmentInfo.defaultWidth + 1;

      if (segmentInfo.graphics.center && (width < (segmentInfo.graphics.center.width + 1))) {
        width = segmentInfo.graphics.center.width + 1;
      }

      if (segmentInfo.graphics.left && segmentInfo.graphics.left.offsetX) {
        width -= segmentInfo.graphics.left.offsetX;
      }

      var el = _createSegment(i, 
        width * WIDTH_TOOL_MULTIPLIER, 
        false, 
        true);

      el.classList.add('tool');

      document.querySelector('#tools').appendChild(el);
    }
  }

  function _resizeStreetWidth() {
    var width = data.streetWidth * TILE_SIZE;

    document.querySelector('#street-section-canvas').style.width = 
        (width) + 'px';

    _onResize();
  }

  function _onResize() {
    var viewportWidth = window.innerWidth;
    var viewportHeight = window.innerHeight;

    var streetSectionHeight = document.querySelector('#street-section').offsetHeight;

    var toolsTop = document.querySelector('footer').offsetTop;

    var pos = (viewportHeight - streetSectionHeight) / 2;

    if (pos + document.querySelector('#street-section').offsetHeight > 
      toolsTop - 20) {
      pos = toolsTop - 20 - streetSectionHeight;
    }

    document.querySelector('#street-section').style.top = pos + 'px';

    streetSectionCanvasLeft = ((viewportWidth - data.streetWidth * TILE_SIZE) / 2);

    document.querySelector('#street-section-canvas').style.left = 
      streetSectionCanvasLeft + 'px';

    document.querySelector('#editable-street-section').style.width = 
      (data.streetWidth * TILE_SIZE) + 'px';
  }

  function _getDefaultSegments() {
    data.segments = [];

    for (var i in DEFAULT_SEGMENTS[data.streetWidth]) {
      var segment = DEFAULT_SEGMENTS[data.streetWidth][i];
      segment.warnings = [];

      data.segments.push(segment);
    }
  }

  function _onStreetWidthChange(event) {
    var el = event.target;
    var newStreetWidth = el.value;

    if (newStreetWidth == data.streetWidth) {
      return;
    }

    if (newStreetWidth == STREET_WIDTH_CUSTOM) {
      var width = prompt("Enter the new street width (from " + 
          MIN_CUSTOM_STREET_WIDTH + "' to " + MAX_CUSTOM_STREET_WIDTH +"'):");

      width = parseInt(width);

      if ((width < MIN_CUSTOM_STREET_WIDTH) || (width > MAX_CUSTOM_STREET_WIDTH)) {
        return;
      }

      document.querySelector('#street-width-option-custom').innerHTML = width + "'";
      document.querySelector('#street-width-option-custom').value = width;

      document.querySelector('#street-width-custom').value = width;

      document.querySelector('#street-width-custom').style.display = '';
      document.querySelector('#street-width-no-custom').style.display = 'none';

      newStreetWidth = width;
    }

    data.streetWidth = newStreetWidth;
    _resizeStreetWidth();

    initializing = true;

    _createDomFromData();
    _segmentsChanged();

    initializing = false;    
  }

  function _removeSegment(el) {
    if (el && el.parentNode) {
      el.parentNode.removeChild(el);
      _segmentsChanged();

      _statusMessage.show('The segment has been deleted. <button>Undo</button>');

      document.querySelector('#status-message button').
          addEventListener('click', _undo, false);
    }
  } 

  function _cheesy3dEffect() {

    var el = document.querySelector('#street-section');

    el.parentNode.style.webkitPerspective = 2000;
    el.parentNode.style.webkitTransformStyle = 'preserve-3d';

    el.style.webkitTransition = '-webkit-transform 1500ms';
    el.style.webkitTransform = 'rotateX(-30deg) rotateY(-20deg) translateX(-200px) translateZ(-500px)';
    el.style.webkitTransformOrigin = '50% 100%';

    var owners = ['pedestrian', 'bike', 'nature', 'public-transit', 'car'];

    var ownerWidths = [0, 0, 0, 0, 0];

    for (var i in data.segments) {
      var el = data.segments[i].el;

      var owner = owners.indexOf(SEGMENT_INFO[data.segments[i].type].owner);

      var extrude = (4 - owner) * 100;

      //el.style.zIndex = 50000000;

      el.style.webkitTransition = '-webkit-transform ' + (1000 + Math.random() * 200) + 'ms';
      el.style.webkitTransitionDelay = (1000 + Math.random() * 200) + 'ms';

      el.parentNode.style.webkitPerspective = 1000;
      el.parentNode.style.webkitPerspectiveOrigin = '50% -50%';
      el.parentNode.style.webkitTransformStyle = 'preserve-3d';

      el.style.webkitTransform = 'translateX(' + el.savedLeft + 'px) translateZ(' + extrude + 'px)';

      el.extrude = extrude;
      el.newX = ownerWidths[owner];

      _createTimeout(function(el) { 
        el.style.webkitTransform = 'translateX(' + el.newX + 'px) translateZ(' + el.extrude + 'px)';
        el.style.webkitTransitionDelay = 0;

      }, el, 2500 + Math.random() * 200);

      ownerWidths[owner] += el.savedWidth;
    }

    console.log(ownerWidths);
  }

  function _onBodyKeyDown(event) {
    switch (event.keyCode) {
      // TODO make const

      case 82:
        _cheesy3dEffect();
        break;
      case 39: // right arrow
      case 187: // = (or, plus)
        if (event.metaKey || event.ctrlKey || event.altKey) {
          return;
        }

        if (document.activeElement == document.body) {
          if (segmentHoveredEl) {
            _incrementSegmentWidth(segmentHoveredEl, true);
          }
          event.preventDefault();
        }
        break;
      case 37: // left arrow
      case 189: // minus
        if (event.metaKey || event.ctrlKey || event.altKey) {
          return;
        }

        if (document.activeElement == document.body) {
          if (segmentHoveredEl) {
            _incrementSegmentWidth(segmentHoveredEl, false);
          }
          event.preventDefault();
        }
        break;
      case 8: // backspace
      case 46: // Delete
        if (event.metaKey || event.ctrlKey || event.altKey) {
          return;
        }

        if (document.activeElement == document.body) {
          _removeSegment(segmentHoveredEl);
          event.preventDefault();
        }
        break;
      case 27: // Esc
        if (infoBubbleVisible) {
          _hideInfoBubble();
        }
        event.preventDefault();
        break;
      case 90: // Z
        if (!event.shiftKey && (event.metaKey || event.ctrlKey)) {
          _undo();
          event.preventDefault();
        } else if (event.shiftKey && (event.metaKey || event.ctrlKey)) {
          _redo();
          event.preventDefault();
        }
        break;
      case 89: // Y
        if (event.metaKey || event.ctrlKey) {
          _redo();
          event.preventDefault();
        }   
        break;   
    }
  }

  function _onRemoveButtonClick(event) {
    var el = event.target.segmentEl;

    if (el) {
      _removeSegment(el);
    }
  }

  function _addEventListeners() {
    document.querySelector('#undo').addEventListener('click', _undo, false);
    document.querySelector('#redo').addEventListener('click', _redo, false);

    document.querySelector('#street-width-custom').
        addEventListener('change', _onStreetWidthChange, false);
    document.querySelector('#street-width-no-custom').
        addEventListener('change', _onStreetWidthChange, false);

    window.addEventListener('resize', _onResize, false);

    if (!touchSupport) {
      window.addEventListener('mousedown', _onBodyMouseDown, false);
      window.addEventListener('mousemove', _onBodyMouseMove, false);
      window.addEventListener('mouseup', _onBodyMouseUp, false); 
    } else {
      window.addEventListener('touchstart', _onBodyMouseDown, false);
      window.addEventListener('touchmove', _onBodyMouseMove, false);
      window.addEventListener('touchend', _onBodyMouseUp, false); 
    }
    window.addEventListener('keydown', _onBodyKeyDown, false);       
  }

  var CSS_TRANSFORMS = ['webkitTransform', 'MozTransform', 'transform'];

  function _inspectSystem() {
    touchSupport = Modernizr.touch;
    retinaMultiplier = window.devicePixelRatio;    

    useCssTransform = false;
    var el = document.createElement('div');
    for (var i in CSS_TRANSFORMS) {
      if (typeof el.style[CSS_TRANSFORMS[i]] != 'undefined') {
        useCssTransform = CSS_TRANSFORMS[i];
        break;
      }
    }
  }

  function _onImagesLoaded() {
    _resizeStreetWidth();

    _getDefaultSegments();

    _createTools();

    _createDomFromData();
    _segmentsChanged();

    initializing = false;    

    doNotCreateUndo = false;
    lastData = _trimNonUserData();

    _onResize();

    _addEventListeners();

    document.querySelector('#loading').classList.add('hidden');

    _startAnimation();
  }

  function _createTimeout(fn, data, delay) {
    window.setTimeout(function() { fn.call(null, data); }, delay);
  }

  function _startAnimation() {
    for (var i in data.segments) {
      var el = data.segments[i].el.querySelector('canvas');

      el.style.opacity = 0;

      var deg = (parseInt(i) - data.segments.length / 2) * 20;

      el.style.webkitTransform = 'rotateZ(' + deg + 'deg)';
      el.style.webkitTransformOrigin = '50% 150%';

      el.parentNode.style.webkitPerspectiveOrigin = '50% 50%';

      _createTimeout(function(el) { 
        el.style.webkitTransition = '-webkit-transform 800ms, opacity 800ms';
        el.style.opacity = 1;
        el.style.webkitTransform = 'none';
      }, el, 300 + Math.random() * 50);
    }
  }

  function _onImageLoaded() {
    imagesRemaining--;

    if (imagesRemaining == 0) {
      _onImagesLoaded();
    }
  }

  var _statusMessage = {
    timerId: -1,

    show: function(text) {
      window.clearTimeout(_statusMessage.timerId);

      document.querySelector('#status-message > div').innerHTML = text;
      document.querySelector('#status-message').classList.add('visible');

      _statusMessage.timerId = 
          window.setTimeout(_statusMessage.hide, STATUS_MESSAGE_HIDE_DELAY);
    },

    hide: function() {
      document.querySelector('#status-message').classList.remove('visible');
    }
  };

  // Copies only the data necessary for save/undo.
  function _trimNonUserData() {
    var newData = {};

    newData.streetWidth = data.streetWidth;

    newData.segments = [];

    for (var i in data.segments) {
      var segment = {};
      segment.type = data.segments[i].type;
      segment.width = data.segments[i].width;

      newData.segments.push(segment);
    }

    return newData;
  }

  function _isUndoAvailable() {
    if (undoPosition > 0) {
      return true;
    } else {
      return false;
    }
  }

  function _isRedoAvailable() {
    if (undoPosition < undoStack.length - 1) {
      return true;
    } else {
      return false;
    }
  }

  function _updateUndoButtons() {
    document.querySelector('#undo').disabled = !_isUndoAvailable();
    document.querySelector('#redo').disabled = !_isRedoAvailable();
  }
 
  main.init = function() {
    initializing = true;
    doNotCreateUndo = true;

    _inspectSystem();

    images = [];

    imagesRemaining = IMAGES_TO_BE_LOADED.length;

    for (var i in IMAGES_TO_BE_LOADED) {
      var url = IMAGES_TO_BE_LOADED[i];
      images[url] = document.createElement('img');
      images[url].addEventListener('load', _onImageLoaded, false);
      images[url].src = url + '?v' + TILESET_IMAGE_VERSION;
    }
  }

  return main;
})();
