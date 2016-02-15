/**
 * exports.js
 *
 * A shim for exporting browserify modules to the global scope that are
 * required while we're transitioning to a module bundler
 * Only keep require()s that are needed and please remove them at earliest
 * convenience
 */

window.Keypress = require('./app/keypress')
window.DebugInfo = require('./app/debug-info')
