/**
 * Streetmix
 *
 */

// Initalization scripts
import './app/initialization'

// Export modules to window for the global-scoped JavaScript
import './exports'

// Load things that are needed
import './app/event_tracking'
import './app/blocking_shield'
import './app/debug_info'
import './app/keyboard_commands'
import './app/print'
import './app/welcome'

// Menus
import './menus/_feedback'
import './menus/_help'
import './menus/_identity'
import './menus/_settings'
import './menus/_share'

// Dialogs
import './dialogs/_about'
import './dialogs/_save_as_image'
import './dialogs/dialog'

// Segments
import './segments/people'

// Street
import './streets/name'
import './streets/scroll'

// Gallery
import './gallery/scroll'

// Utilities
import { startListening } from './app/keypress'

// Start listening for keypresses
startListening()
