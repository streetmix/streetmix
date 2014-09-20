var serverContacted;

var latestRequestId;
var latestVerificationStreet;

var nonblockingAjaxRequests = [];

var nonblockingAjaxRequestTimer = 0;

var NON_BLOCKING_AJAX_REQUEST_TIME = [10, 500, 1000, 5000, 10000];
var NON_BLOCKING_AJAX_REQUEST_BACKOFF_RANGE = 60000;

var NON_BLOCKING_NO_CONNECTION_MESSAGE_TIMER_COUNT = 4;

var NO_CONNECTION_MESSAGE_TIMEOUT = 10000;

var blockingAjaxRequest;
var blockingAjaxRequestDoneFunc;
var blockingAjaxRequestCancelFunc;
var blockingAjaxRequestInProgress = false;

var blockingShieldTimerId = -1;
var blockingShieldTooSlowTimerId = -1;

var uniqueRequestId = 0;

function _getUniqueRequestHeader() {
  uniqueRequestId++;
  return uniqueRequestId;
}

var _noConnectionMessage = {
  visible: false,
  timerId: -1,

  schedule: function() {
    if (_noConnectionMessage.timerId == -1) {
      // TODO const
      _noConnectionMessage.timerId =
        window.setTimeout(_noConnectionMessage.show, NO_CONNECTION_MESSAGE_TIMEOUT);
    }
  },

  show: function() {
    document.querySelector('#no-connection-message').classList.add('visible');
    document.body.classList.add('no-connection-message-visible');
  },

  hide: function() {
    window.clearTimeout(_noConnectionMessage.timerId);
    _noConnectionMessage.timerId = -1;

    document.querySelector('#no-connection-message').classList.remove('visible');
    document.body.classList.remove('no-connection-message-visible');
  }
};

function _getNonblockingAjaxRequestCount() {
  return nonblockingAjaxRequests.length;
}

function _getAjaxRequestSignature(request) {
  return request.type + ' ' + request.url;
}

function _newNonblockingAjaxRequest(request, allowToClosePage, doneFunc, errorFunc, maxRetries) {
  nonblockingAjaxRequestTimer = 0;

  var signature = _getAjaxRequestSignature(request);

  _removeNonblockingAjaxRequest(signature);
  nonblockingAjaxRequests.push({
    request: request,
    allowToClosePage: allowToClosePage,
    doneFunc: doneFunc,
    errorFunc: errorFunc,
    inProgress: false,
    signature: signature,
    tryCount: 0,
    maxRetries: maxRetries
  });

  _scheduleNextNonblockingAjaxRequest();
}

function _nonblockingAjaxTryAgain() {
  _noConnectionMessage.hide();

  nonblockingAjaxRequestTimer = 0;

  _scheduleNextNonblockingAjaxRequest();
}

function _sendNextNonblockingAjaxRequest() {
  if (abortEverything) {
    return;
  }

  if (_getNonblockingAjaxRequestCount()) {
    _noConnectionMessage.schedule();

    var request = null;

    request = nonblockingAjaxRequests[0];

    if (request) {
      if (!request.inProgress) {
        request.inProgress = true;

        var query = $.ajax(request.request).done(function(data) {
          _successNonblockingAjaxRequest(data, request);
        }).fail(function(data) {
          _errorNonblockingAjaxRequest(data, request);
        });
      }
    }

    _scheduleNextNonblockingAjaxRequest();
  }
}

function _scheduleNextNonblockingAjaxRequest() {
  if (_getNonblockingAjaxRequestCount()) {
    if (nonblockingAjaxRequestTimer < NON_BLOCKING_AJAX_REQUEST_TIME.length) {
      var time = NON_BLOCKING_AJAX_REQUEST_TIME[nonblockingAjaxRequestTimer];
    } else {
      var time = Math.floor(Math.random() * NON_BLOCKING_AJAX_REQUEST_BACKOFF_RANGE);
    }

    window.setTimeout(_sendNextNonblockingAjaxRequest, time);

    nonblockingAjaxRequestTimer++;
  } else {
    saveStreetIncomplete = false;
  }
}

function _removeNonblockingAjaxRequest(signature) {
  for (var i in nonblockingAjaxRequests) {
    if (nonblockingAjaxRequests[i].signature == signature) {
      nonblockingAjaxRequests.splice(i, 1);
      break;
    }
  }
}

function _errorNonblockingAjaxRequest(data, request) {
  // Do not execute the error function immediately if there is
  // a directive to retry a certain number of times first.
  if (request.errorFunc && !request.maxRetries) {
    request.errorFunc(data);
  }

  request.tryCount++;
  request.inProgress = false;

  // Abort resending if the max number of tries has been hit.
  if (request.maxRetries && request.tryCount >= request.maxRetries) {
    nonblockingAjaxRequestTimer = 0;
    _noConnectionMessage.hide();
    _removeNonblockingAjaxRequest(request.signature);
    if (request.errorFunc) {
      request.errorFunc(data);
    }
  }
}

function _successNonblockingAjaxRequest(data, request) {
  nonblockingAjaxRequestTimer = 0;

  _noConnectionMessage.hide();

  _removeNonblockingAjaxRequest(request.signature);

  if (request.doneFunc) {
    request.doneFunc(data);
  }

  _scheduleNextNonblockingAjaxRequest();
}

function _successBlockingAjaxRequest(data) {
  _hideBlockingShield();

  blockingAjaxRequestInProgress = false;

  blockingAjaxRequestDoneFunc(data);
}

function _errorBlockingAjaxRequest() {
  if (blockingAjaxRequestCancelFunc) {
    document.querySelector('#blocking-shield').classList.add('show-cancel');
  }

  document.querySelector('#blocking-shield').classList.add('show-try-again');

  _darkenBlockingShield();
}

function _blockingTryAgain() {
  document.querySelector('#blocking-shield').classList.remove('show-try-again');
  document.querySelector('#blocking-shield').classList.remove('show-cancel');

  $.ajax(blockingAjaxRequest).
      done(_successBlockingAjaxRequest).fail(_errorBlockingAjaxRequest);
}

function _blockingCancel() {
  _hideBlockingShield();

  blockingAjaxRequestInProgress = false;

  blockingAjaxRequestCancelFunc();
}

function _newBlockingAjaxRequest(message, request, doneFunc, cancelFunc) {
  _showBlockingShield(message);

  blockingAjaxRequestInProgress = true;

  blockingAjaxRequest = request;
  blockingAjaxRequestDoneFunc = doneFunc;
  blockingAjaxRequestCancelFunc = cancelFunc;

  $.ajax(blockingAjaxRequest).
      done(_successBlockingAjaxRequest).fail(_errorBlockingAjaxRequest);
}

function _checkIfEverythingIsLoaded() {
  if (abortEverything) {
    return;
  }

  if ((imagesToBeLoaded == 0) && signInLoaded && bodyLoaded &&
      readyStateCompleteLoaded && geolocationLoaded && serverContacted) {
    _onEverythingLoaded();
  }
}
