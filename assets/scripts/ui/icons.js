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
import {
  faTwitter,
  faFacebookSquare,
  faGithub,
  faDiscord
} from '@fortawesome/free-brands-svg-icons'

// Alternative icon reference, which can be mocked and tested
export const UNDO_ICON = faUndo
export const REDO_ICON = faRedo
export const TOOLS_ICON = faTools

export const ICON_TWITTER = faTwitter
export const ICON_FACEBOOK = faFacebookSquare
export const ICON_GITHUB = faGithub
export const ICON_DISCORD = faDiscord

// Load Font-Awesome icons
export function initIcons () {
  library.add(
    faCheck, faMinus, faPlus,
    faChevronRight, faChevronLeft,
    faArrowRight, faArrowLeft,
    faTimes, faTimesCircle,
    faUndo, faRedo, faTrashAlt
  )
}
