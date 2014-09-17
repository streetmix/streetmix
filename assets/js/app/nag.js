function _checkIfChangesSaved() {
  // don’t do for settings deliberately

  if (abortEverything) {
    return;
  }

  var showWarning = false;

  if (saveStreetIncomplete) {
    showWarning = true;
  } else for (var i in nonblockingAjaxRequests) {
    if (!nonblockingAjaxRequests[i].allowToClosePage) {
      showWarning = true;
    }
  }

  if (showWarning) {
    nonblockingAjaxRequestTimer = 0;
    _scheduleNextNonblockingAjaxRequest();

    return 'Your changes have not been saved yet. Please return to the page, check your Internet connection, and wait a little while to allow the changes to be saved.';
  }
}

function _onWindowBeforeUnload() {
  var text = _checkIfChangesSaved();
  if (text) {
    return text;
  }
}
