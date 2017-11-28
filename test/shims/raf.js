/**
 * requestAnimationFrame shim for React 16/Jest
 * see https://github.com/facebook/jest/issues/4545#issuecomment-332762365
 *
 * This must be its own file and loaded first, before any Jest setup.
 */
global.requestAnimationFrame = (callback) => {
  setTimeout(callback, 0)
}
