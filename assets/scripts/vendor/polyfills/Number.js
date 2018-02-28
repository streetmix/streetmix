/**
 * Number methods that behave identically to global functions, and are
 * part of ECMAScript 2015's modularization of globals.
 *
 * Polyfill for Internet Explorer
 */
if (Number.parseFloat === undefined)
  Number.parseFloat = window.parseFloat

if (Number.parseInt === undefined)
  Number.parseInt = window.parseInt
