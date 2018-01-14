import { observeStore } from '../store'

// Imported to force updates when state changes
import { createDomFromData } from '../streets/data_model'

export function initializeFlagSubscribers () {
  initLocalStorageUpdateListener()
  initCanvasRectangleUpdateListener()
}

function initLocalStorageUpdateListener () {
  const select = (state) => state.flags
  const onChange = (flags) => {
    // todo
  }

  return observeStore(select, onChange)
}

// Listeners to handle app updates for flags that don't have any other way to do it
// todo: try to avoid doing these if possible
function initCanvasRectangleUpdateListener () {
  const select = (state) => state.flags.DEBUG_SEGMENT_CANVAS_RECTANGLES.value
  const onChange = () => { createDomFromData() }

  return observeStore(select, onChange)
}
