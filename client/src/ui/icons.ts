/**
 * Imports FontAwesome icons
 */
// "deep import" style to workaround a "Maximum call stack exceeded" issue
// that only happens with the `free-solid-svg-icons` package.
// for instance: https://github.com/FortAwesome/react-native-fontawesome/issues/123
import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons/faChevronLeft'
import { faPencil } from '@fortawesome/free-solid-svg-icons/faPencil'
import { faLock } from '@fortawesome/free-solid-svg-icons/faLock'

// FontAwesome documentation recommends adding icons to a "library" object
// which the <FontAwesomeIcon> component looks up icons from via a string id.
//
// This approach has a few issues: one, the library must be initialized before
// any React code is mounted. While that would only be a mild inconvenience
// for the app, this means any test code that mounts <FontAwesomeIcon> as children
// must also initialize the library.
//
// Secondly, the string id is arbitrary, and doesn't match the variable names
// imported here. That means it's harder to do a search through the codebase to
// see if any code is still using a particular icon.
//
// FontAwesome does work this way, which is more what one might expect. Export
// constants representing the imported FontAwesome icon; then, pass these
// constants directly into the <FontAwesomeIcon> `icon=` prop.
//
// Furthermore, this is easier to mock for any tests where <FontAwesomeIcon>
// is a child of the component under test.
export const ICON_CHEVRON_RIGHT = faChevronRight
export const ICON_CHEVRON_LEFT = faChevronLeft
export const ICON_PENCIL = faPencil
export const ICON_LOCK = faLock
