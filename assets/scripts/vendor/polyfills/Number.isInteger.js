/**
 * Number.isInteger polyfill for Internet Explorer
 * source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger
 */

Number.isInteger = Number.isInteger || function (value) {
  return typeof value === 'number' &&
    Number.isFinite(value) &&
    Math.floor(value) === value
}
