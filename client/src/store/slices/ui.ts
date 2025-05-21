import { createSlice } from '@reduxjs/toolkit'

import type { DraggingState } from '~/src/types'
import {
  DRAGGING_TYPE_NONE,
  DRAGGING_TYPE_RESIZE
} from '../../segments/constants'

import type { PayloadAction } from '@reduxjs/toolkit'
import type { BoundaryPosition } from '@streetmix/types'

interface UiState {
  welcomePanelVisible: boolean
  welcomePanelDismissed: boolean
  toolboxVisible: boolean
  activeSegment: number | BoundaryPosition | null
  draggingState: DraggingState | null
  draggingType: number
  resizeGuidesVisible: boolean
}

const initialState: UiState = {
  welcomePanelVisible: false,
  welcomePanelDismissed: false,
  toolboxVisible: false,
  activeSegment: null,
  draggingState: null,
  draggingType: 0,
  resizeGuidesVisible: false
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,

  reducers: {
    setWelcomePanelVisible (state) {
      state.welcomePanelVisible = true
    },

    setWelcomePanelDismissed (state) {
      state.welcomePanelDismissed = true
      state.welcomePanelVisible = false
    },

    setActiveSegment (state, action: PayloadAction<UiState['activeSegment']>) {
      // If we're in the middle of a resize drag state, do not set a new
      // active segment.
      if (!state.resizeGuidesVisible) {
        state.activeSegment = action.payload
      }
    },

    initDraggingState (state, action: PayloadAction<UiState['draggingType']>) {
      state.draggingType = action.payload
    },

    updateDraggingState (
      state,
      action: PayloadAction<UiState['draggingState']>
    ) {
      if (!action.payload) {
        state.draggingState = null
      } else {
        state.draggingState = {
          segmentBeforeEl: action.payload.segmentBeforeEl,
          segmentAfterEl: action.payload.segmentAfterEl,
          draggedSegment: action.payload.draggedSegment
        }
      }
    },

    clearDraggingState (state, action) {
      state.draggingState = null
      state.draggingType = DRAGGING_TYPE_NONE
    },

    setDraggingType (state, action: PayloadAction<UiState['draggingType']>) {
      state.draggingType = action.payload
      state.resizeGuidesVisible = action.payload === DRAGGING_TYPE_RESIZE
    },

    toggleToolbox (state) {
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
