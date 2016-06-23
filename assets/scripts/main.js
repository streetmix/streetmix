/**
 * Streetmix
 *
 */

import $ from 'jquery'
window.$ = $

import _ from 'lodash'
window._ = _

import { Stmx } from './app/initialization'
window.Stmx = Stmx

// import modules for side-effects
import './app/blocking_shield'
import './app/debug_info'
import './app/keyboard_commands'
import './app/print'
import './app/status_message'
import './app/welcome'
import './dialogs/dialog'
import './gallery/scroll'
import './gallery/view'
import './info_bubble/info_bubble'
import './menus/_help'
import './menus/menu'
import './streets/name'
import './streets/scroll'
import './util/fetch_nonblocking'

import { startListening } from './app/keypress'
// Start listening for keypresses
startListening()
