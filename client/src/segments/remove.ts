import { formatMessage } from '../locales/locale'
import {
  removeSegment as removeSegmentActionCreator,
  clearSegments
} from '../store/slices/street'
import { addToast } from '../store/slices/toasts'
import store from '../store'
import { segmentsChanged } from './view'

/**
 * Removes a given segment at `position`
 */
export function removeSegment (position: number): void {
  // TODO: handle new popup controls (formerly infobubble) here

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
export function removeAllSegments (): void {
  store.dispatch(clearSegments())
  segmentsChanged()
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
