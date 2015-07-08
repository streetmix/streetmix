/*
 *  Keypress (singleton)
 *
 *  Handles registration, removal, and processing of keyboard inputs.
 *  Some inspiration from Keypress Javascript library (http://dmauro.github.io/Keypress/)
 */

// module.exports = Keypress
var Keypress = (function () {
  'use strict'

  /* global EventTracking */

  var TRACK_LABEL_KEYBOARD = 'Keyboard'

  // TODO: Flesh out this dictionary
  var KEYS = {
    'left': 37,
    'right': 39,
    'enter': 13,
    'backspace': 8,
    'delete': 46,
    'esc': 27,
    '0': 48,
    '1': 49,
    '2': 50,
    '3': 51,
    '4': 52,
    '5': 53,
    '6': 54,
    '7': 55,
    '8': 56,
    '9': 57,
    'a': 65,
    'b': 66,
    'c': 67,
    'd': 68,
    'e': 69,
    'f': 70,
    'g': 71,
    'h': 72,
    'i': 73,
    'j': 74,
    'k': 75,
    'l': 76,
    'm': 77,
    'n': 78,
    'o': 79,
    'p': 80,
    'q': 81,
    'r': 82,
    's': 83,
    't': 84,
    'u': 85,
    'v': 86,
    'w': 87,
    'x': 88,
    'y': 89,
    'z': 90,
    // '=': [187, 61],
    '+': [187, 61, 107], // = or +; 61 for Firefox; 107 for keypad
    '-': [189, 173, 109], // 109 for keypad; 173 for Firefox
    '?': 191,
    '/': 191
  }

  // Keep track of all registered commands here
  var inputs = {}

  // Set global listener for keypress
  function init () {
    // TODO: remove useCapture if we don't need it
    window.addEventListener('keydown', _onGlobalKeyDown, true)
  }

  // Placeholder utility functions
  function noop () {}

  function returnTrue () { return true }

  // (public) Registers a key command listener with the Keypress Manager
  function register (commands, options, callback) {
    // Defaults
    // For shiftKey, metaKey, and altKey, specifies what it should
    // match on the event object reported by the browser. For instance,
    // if event.metaKey is false, it means the command must be executed
    // only if the meta key (ctrl or command depending on the OS) is not
    // pressed. (Note that ctrlKey will be internally mapped to behave
    // the same as metaKey here.) The distinction is strict, pass the
    // value 'optional' to make the system ignore whether a key is pressed.
    var defaults = {
      shiftKey: false,
      metaKey: false,
      altKey: false,
      onKeypress: noop,
      condition: returnTrue,
      preventDefault: true,
      stopPropagation: false,
      requireFocusOnBody: true
    }

    // Check if the second argument is the options object or the callback function
    if (typeof arguments[1] === 'object') {
      options = arguments[1]
    } else if (typeof arguments[1] === 'function') {
      // The second argument is the callback function
      // You cannot pass two callback functions
      options = {}
      callback = arguments[1]
    }

    var commandObj = _processCommands(commands)

    // Process each command input
    for (var keyCode in commandObj) {
      var command = commandObj[keyCode]

      for (var i = 0; i < command.length; i++) {

        // Get default settings
        for (var key in defaults) {
          if (typeof command[i][key] === 'undefined') {
            command[i][key] = defaults[key]
          }
        }

        // Special case for 'ESC' key; it defaults to global (window) focus
        if (parseInt(keyCode, 10) === KEYS['esc']) {
          command[i].requireFocusOnBody = false
          command[i].stopPropagation = true
        }

        // Attach callback function to execute
        if (typeof callback === 'function') {
          command[i].onKeypress = callback
        }

        // If options are specified, replace defaults
        // This basically allows other code to override settings via the
        // options object - it's dumb, but there's no protection against it,
        // and who knows, could be useful in edge cases
        for (var k in options) {
          if (typeof command[i][k] !== options[k]) {
            command[i][k] = defaults[k]
          }
        }

        // Add processed commands to module's inputs holder
        if (typeof inputs[keyCode] === 'undefined') {
          inputs[keyCode] = []
        }
        inputs[keyCode].push(command[i])
      }
    }
  }

  // If command and callback matches, get rid of it.
  function deregister (commands, callback) {
    var commandObj = _processCommands(commands)

    // Process each command input
    for (var keyCode in commandObj) {
      var command = commandObj[keyCode]

      for (var i = 0; i < command.length; i++) {
        var items = inputs[keyCode]
        var x = items.length
        // A reverse while loop quickly removes all duplicates that matches
        while (x--) {
          var item = items[x]

          // Check for equality for command + function
          if ((item.onKeypress === callback) &&
              (item.shiftKey === command[i].shiftKey || item.shiftKey === 'optional') &&
              (item.altKey === command[i].altKey || item.altKey === 'optional') &&
              (item.metaKey === command[i].metaKey || item.metaKey === 'optional')) {
            // If matches, remove it from the command list.
            inputs[keyCode].splice(x, 1)
          }
        }
      }
    }
  }

  function _processCommands (commands) {
    // If a string, force to one-element array, otherwise expect an array of strings
    if (typeof commands === 'string') {
      commands = new Array(commands)
    }

    var commandsObj = {}

    // Process each command input
    for (var i = 0; i < commands.length; i++) {
      // Normalize command
      //  - adjust to lower case
      //  - replace command/cmd/control/ctrl to meta (this does not remove dupes)
      var command = commands[i].toLowerCase().replace(/(command|cmd|control|ctrl)/g, 'meta').split(' ')
      var settings = {
        shiftKey: false,
        altKey: false,
        metaKey: false
      }

      // Check for existence of modifier keys
      // Modifier keys are removed from input array
      var isShift = command.indexOf('shift')
      if (isShift > -1) {
        settings.shiftKey = true
        command.splice(isShift, 1)
      }

      var isAlt = command.indexOf('alt')
      if (isAlt > -1) {
        settings.altKey = true
        command.splice(isAlt, 1)
      }

      var isMeta = command.indexOf('meta')
      if (isMeta > -1) {
        settings.metaKey = true
        command.splice(isMeta, 1)
      }

      // First remaining item in the input array is the key code to test for.
      // Does not support multi-keys, so rest of input (if provided) is ignored.
      var keyCode = KEYS[command[0]]

      // Keycodes might be a single number or an array
      if (keyCode) {
        var keys = []
        // If keyCode is a number, convert to single-element array
        // Can't do a shortcut version of these with numbers :-/
        if (typeof keyCode === 'number') {
          keys.push(keyCode)
        } else if (Array.isArray(keyCode)) {
          keys = keyCode
        }

        for (var j = 0; j < keys.length; j++) {
          settings.keyCode = keys[j]
          if (typeof commandsObj[keys[j]] === 'undefined') {
            commandsObj[keys[j]] = []
          }

          commandsObj[keys[j]].push(settings)
        }
      }
    }

    return commandsObj
  }

  function _onGlobalKeyDown (event) {
    var input

    // Find the right command object
    var commandsForKeyCode = inputs[event.keyCode]
    if (!commandsForKeyCode || commandsForKeyCode.length === 0) return

    // Check if the right meta keys are down
    for (var i = 0; i < commandsForKeyCode.length; i++) {
      var item = commandsForKeyCode[i]
      if ((item.shiftKey === event.shiftKey || item.shiftKey === 'optional') &&
          (item.altKey === event.altKey || item.altKey === 'optional') &&
          (item.metaKey === event.metaKey || item.metaKey === 'optional')) {
        input = item
      }
    }

    // Exit now if an input is not found
    if (!input) return

    // Check if focus is on the correct place
    if (input.requireFocusOnBody === true && _isFocusOnBody() === false) return

    // Execute callback
    if (input) {
      if (input.preventDefault) {
        event.preventDefault()
      }
      if (input.stopPropagation) {
        event.stopPropagation()
      }
      input.onKeypress()
    }
  }

  // Utility function
  function _isFocusOnBody () {
    return document.activeElement === document.body
  }

  return {
    init: init,
    register: register,
    deregister: deregister,
    inputs: inputs,
    _proc: _processCommands
  }

})()
