// Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faCheck,
  faMinus,
  faPlus,
  faChevronRight,
  faChevronLeft,
  faArrowRight,
  faArrowLeft,
  faTimes,
  faUndo,
  faRedo,
  faTrashAlt,
  faTools
} from '@fortawesome/free-solid-svg-icons'
import { faTimesCircle } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'

// Alternative icon reference, which can be mocked and tested
export const UNDO_ICON = faUndo
export const REDO_ICON = faRedo
export const TOOLS_ICON = faTools

// Load Font-Awesome icons
export function initIcons () {
  library.add(
    faCheck, faMinus, faPlus,
    faChevronRight, faChevronLeft,
    faArrowRight, faArrowLeft,
    faTimes, faTimesCircle, fab,
    faUndo, faRedo, faTrashAlt
  )
}
