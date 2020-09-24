import { infoBubble } from '../info_bubble/info_bubble'
import { segmentsChanged } from './view'
import { formatMessage } from '../locales/locale'
import {
  removeSegment as removeSegmentActionCreator,
  clearSegments
} from '../store/slices/street'
import { addToast } from '../store/slices/toasts'
import store from '../store'

/**
 * Removes a segment, given the element to remove
 *
 * @param {Number} position - segment to remove
 */
export function removeSegment (position) {
  infoBubble.hide()

  // This makes sure that the drag handles on the segment
  // don't appear briefly after animating away
  infoBubble.hideSegment()

  // Update the store
  // ToDo: Refactor all other methods that use this to update the store via there dispatch
  store.dispatch(removeSegmentActionCreator(position, false))

  segmentsChanged()

  store.dispatch(
    addToast({
      message: formatMessage(
        'toast.segment-deleted',
        'The segment has been removed.'
      ),
      component: 'TOAST_UNDO'
    })
  )
}

/**
 * Removes all segments. This is a “power user” feature
 * and it is not advertised in the UI.
 */
export function removeAllSegments () {
  store.dispatch(clearSegments())
  segmentsChanged()
  infoBubble.hide()
  store.dispatch(
    addToast({
      message: formatMessage(
        'toast.all-segments-deleted',
        'All segments have been removed.'
      ),
      component: 'TOAST_UNDO'
    })
  )
}
