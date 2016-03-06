'use strict'

module.exports = {
  empty: function (el) {
    while (el.lastChild) {
      el.removeChild(el.lastChild)
    }
  },

  // migrated from from _removeElFromDom
  remove: function (el) {
    if (el && el.parentNode) {
      el.parentNode.removeChild(el)
    }
  }
}
