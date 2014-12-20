/*
 * Streetmix
 *
 * Front-end (mostly) by Marcin Wichary, Code for America fellow in 2013.
 *
 */

//= require vendor/modernizr
//= require vendor/moment
//= require vendor/jquery-2.1.0.min
//= require vendor/jquery.cookie
//= require vendor/i18next-1.7.4

//= require_self
//= require_tree util
//= require_tree app
//= require_tree menus
//= require_tree dialogs
//= require_tree segments
//= require_tree streets
//= require_tree gallery
//= require_tree users

// TODO: Gradually migrate everything from global onto the Stmx namespace
var Stmx = {
  app: {},
  ui: {}
};
