/**
 * preinit
 *
 * Tasks to setup for Streetmix ASAP.
 */

// NOTE: This a DIFFERENT bundle from the main.js bundle!
// Code will NOT be shared between bundles!

// This is placed globally while we're transitioning bundles.
// TODO: Store in application state
window.debug = require('./preinit/debug_settings')

// This event is fired by _onEverythingLoaded() in the deprecated
// global bundle. This allows things in the modular bundle to respond
// to that function without needing to be exported globally.
// This should eventually not be required & can be removed.
window.addEventListener('stmx:everything_loaded', function (e) {
  _doWhatUsedToBeThe_onEverythingLoadedFunction()
})

