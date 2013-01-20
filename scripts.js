var main = (function(){
  var main = {};

  var WIDTH_MULTIPLIER = 12; // 12 pixels per foot
  var WIDTH_TOOL_MULTIPLIER = 4; // 12 pixels per foot

  var SEGMENT_TYPES = {
    "sidewalk": {
      name: 'Sidewalk',
      defaultWidth: 6,
    },
    "sidewalk-tree": {
      name: 'Sidewalk w/ a tree',
      defaultWidth: 6,
    },
    "planting-strip": {
      name: 'Planting strip',
      defaultWidth: 4,
    },
    "bike-lane-inbound": {
      name: 'Bike lane',
      subname: 'Inbound',
      defaultWidth: 6,
    },
    "bike-lane-outbound": {
      name: 'Bike lane',
      subname: 'Outbound',
      defaultWidth: 6,
    },
    "parking-lane": {
      name: 'Parking lane',
      defaultWidth: 8,
    },
    "drive-lane-inbound": {
      name: 'Drive lane',
      subname: 'Inbound',
      defaultWidth: 10,
    },
    "drive-lane-outbound": {
      name: 'Drive lane',
      subname: 'Outbound',
      defaultWidth: 10,
    },
    "turn-lane": {
      name: 'Turn lane',
      defaultWidth: 10,
    },
    "bus-lane-inbound": {
      name: 'Bus lane',
      subname: 'Inbound',
      defaultWidth: 12,
    },
    "bus-lane-outbound": {
      name: 'Bus lane',
      subname: 'Outbound',
      defaultWidth: 12,
    },
    "small-median": {
      name: 'Small median',
      defaultWidth: 4,
    },
  };

  var segments = [
    { type: "sidewalk-tree", width: 6 },
    { type: "planting-strip", width: 4 },
    { type: "parking-lane", width: 8 },
    { type: "bike-lane-inbound", width: 6 },
    { type: "small-median", width: 4 },
    { type: "bike-lane-outbound", width: 6 },
    { type: "turn-lane", width: 10 },
    { type: "parking-lane", width: 8 },
    { type: "planting-strip", width: 4 },
    { type: "sidewalk", width: 6 },
  ];

  var DRAGGING_TYPE_MOVE = 1;
  var DRAGGING_TYPE_CREATE = 2;

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

  var WIDTH_RESIZE_DELAY = 100;

  function _recalculateSeparators() {
    //console.log('Recalculating…');

    var els = document.querySelectorAll('#editable-street-section [type="separator"]');
    for (var i = 0, el; el = els[i]; i++) {
      var prevWidth = el.previousSibling ? el.previousSibling.offsetWidth : 0;
      var nextWidth = el.nextSibling ? el.nextSibling.offsetWidth : 0;

      //console.log(prevWidth, nextWidth);

      if (i == 0) {
        prevWidth = 2000;
      } else if (i == els.length - 1) {
        nextWidth = 2000;
      }

      el.style.width = (prevWidth / 2 + nextWidth / 2 + 2 + 100) + 'px';
      el.style.marginLeft = (-prevWidth / 2 - 1) + 'px';
      el.style.marginRight = (-nextWidth / 2 - 1 - 100) + 'px';
    }
  }

  function _createSegment(type, width) {
    var el = document.createElement('div');
    el.classList.add('segment');
    el.setAttribute('type', type);
    if (width) {
      el.style.width = width + 'px';
    }


    if (type == 'separator') {
      el.addEventListener('mouseover', _onSeparatorMouseOver, false);
      el.addEventListener('mouseout', _onSeparatorMouseOut, false);
    } else {
      el.innerHTML = '<span class="name">Test</span><span class="width">12\'</span>';
    }
    return el;
  }

  function _createSegmentDom() {
    var el = _createSegment('separator');
    document.querySelector('#editable-street-section').appendChild(el);

    for (var i in segments) {
      var segment = segments[i];

      var el = _createSegment(segment.type, segment.width * WIDTH_MULTIPLIER);
      document.querySelector('#editable-street-section').appendChild(el);

      var el = _createSegment('separator');
      document.querySelector('#editable-street-section').appendChild(el);
    }

    _recalculateSeparators();
  }

  function _onBodyMouseDown(event) {
    var el = event.target;
    if (!el.classList.contains('segment')) {
      return;
    }

    draggingStatus.active = true;
    document.querySelector('#editable-street-section').classList.add('dragging');

    draggingStatus.originalEl = event.target;

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

    draggingStatus.elX = event.pageX - event.offsetX;
    draggingStatus.elY = event.pageY - event.offsetY;

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
    draggingStatus.el.style.width = draggingStatus.originalWidth + 'px';
    document.body.appendChild(draggingStatus.el);

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
    document.querySelector('#editable-street-section').classList.remove('dragging');

    var placeEl = document.querySelector('#editable-street-section [type="separator"].hover');

    draggingStatus.el.parentNode.removeChild(draggingStatus.el);


    if (placeEl) {
      var el = _createSegment('separator');
      document.querySelector('#editable-street-section').insertBefore(el, placeEl);

      var el = document.createElement('div');
      el.classList.add('segment');
      el.setAttribute('type', draggingStatus.originalType);
      el.style.width = 50 + 'px';
      document.querySelector('#editable-street-section').insertBefore(el, placeEl);

      window.setTimeout(function() {
        el.style.width = draggingStatus.originalWidth + 'px';
      }, 0);

      _recalculateSeparators();
    } else {
      if (!withinCanvas) {
        _dragOutOriginalIfNecessary();
      } else {
        draggingStatus.originalEl.classList.remove('dragged-out');

        var el = _createSegment('separator');
        document.querySelector('#editable-street-section').insertBefore(el, draggingStatus.originalEl);

        var el = _createSegment('separator');
        document.querySelector('#editable-street-section').insertBefore(el, draggingStatus.originalEl.nextSibling);

      }
    }

    event.preventDefault();
  }

  function _dragOutOriginalIfNecessary() {
    if ((draggingStatus.type == DRAGGING_TYPE_MOVE) && draggingStatus.originalDraggedOut) {
      var el = _createSegment('separator');
      document.querySelector('#editable-street-section').insertBefore(el, draggingStatus.originalEl);

      draggingStatus.originalEl.style.width = 0;
      window.setTimeout(function() {
        draggingStatus.originalEl.parentNode.removeChild(draggingStatus.originalEl);
        _recalculateSeparators();
      }, WIDTH_RESIZE_DELAY);

      _recalculateSeparators();

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
    for (var i in SEGMENT_TYPES) {
      var segmentType = SEGMENT_TYPES[i];
      var el = _createSegment(i, segmentType.defaultWidth * WIDTH_TOOL_MULTIPLIER);

      el.classList.add('tool');

      document.querySelector('#tools').appendChild(el);
    }
  }

  main.init = function(){
    _createTools();

    _createSegmentDom();

    window.addEventListener('mousedown', _onBodyMouseDown, false);
    window.addEventListener('mousemove', _onBodyMouseMove, false);
    window.addEventListener('mouseup', _onBodyMouseUp, false);
  }

  return main;
})();
