import { createSlice } from '@reduxjs/toolkit'
import {
  DRAGGING_TYPE_NONE,
  DRAGGING_TYPE_RESIZE
} from '../../segments/constants'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    welcomePanelVisible: false,
    welcomePanelDismissed: false,
    toolboxVisible: false,
    activeSegment: null,
    draggingState: null,
    draggingType: 0,
    resizeGuidesVisible: false
  },

  reducers: {
    setWelcomePanelVisible (state, action) {
      state.welcomePanelVisible = true
    },

    setWelcomePanelDismissed (state, action) {
      state.welcomePanelDismissed = true
      state.welcomePanelVisible = false
    },

    setActiveSegment (state, action) {
      // If we're in the middle of a resize drag state, do not set a new
      // active segment.
      if (state.resizeGuidesVisible !== true) {
        state.activeSegment = action.payload
      }
    },

    initDraggingState (state, action) {
      state.draggingType = action.payload
    },

    updateDraggingState (state, action) {
      state.draggingState = {
        segmentBeforeEl: action.payload.segmentBeforeEl,
        segmentAfterEl: action.payload.segmentAfterEl,
        draggedSegment: action.payload.draggedSegment
      }
    },

    clearDraggingState (state, action) {
      state.draggingState = null
      state.draggingType = DRAGGING_TYPE_NONE
    },

    setDraggingType (state, action) {
      state.draggingType = action.payload
      state.resizeGuidesVisible = action.payload === DRAGGING_TYPE_RESIZE
    },

    toggleToolbox (state, action) {
      state.toolboxVisible = !state.toolboxVisible
    }
  }
})

export const {
  setWelcomePanelVisible,
  setWelcomePanelDismissed,
  setActiveSegment,
  initDraggingState,
  updateDraggingState,
  clearDraggingState,
  setDraggingType,
  toggleToolbox
} = uiSlice.actions

export default uiSlice.reducer
