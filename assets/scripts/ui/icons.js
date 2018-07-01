// Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { faCheck, faMinus, faPlus } from '@fortawesome/free-solid-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'

// Load Font-Awesome icons
export function initIcons () {
  library.add(faCheck, faMinus, faPlus, fab)
}
