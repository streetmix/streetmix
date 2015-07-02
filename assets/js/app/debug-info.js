
function _showDebugInfo () {
  var debugStreetData = _clone(street)
  var debugUndo = _clone(undoStack)
  var debugSettings = _clone(settings)
  var debugEl = document.querySelector('#debug')
  var textEl = debugEl.querySelector('textarea')

  // Some things just shouldn't be seen...
  for (var i in debugStreetData.segments) {
    delete debugStreetData.segments[i].el
  }

  for (var j in debugUndo) {
    for (var i in debugUndo[j].segments) {
      delete debugUndo[j].segments[i].el
    }
  }

  // Create a JSON object, this parses better in editors
  var debugObj = {
    'DATA': debugStreetData,
    'SETTINGS': debugSettings,
    'UNDO': debugUndo
  }

  debugEl.classList.add('visible')
  textEl.innerHTML = JSON.stringify(debugObj, null, 2)
  textEl.focus()
  textEl.select()
}

function _hideDebugInfo () {
  document.querySelector('#debug').classList.remove('visible')
  _loseAnyFocus()
}
