import { createSlice } from '@reduxjs/toolkit'

import type { DraggingState } from '~/src/types'
import {
  DRAGGING_TYPE_NONE,
  DRAGGING_TYPE_RESIZE,
} from '../../segments/constants'

import type { PayloadAction } from '@reduxjs/toolkit'
import type { BoundaryPosition } from '@streetmix/types'

interface UiState {
  welcomePanelVisible: boolean
  welcomePanelDismissed: boolean
  toolboxVisible: boolean
  activeSegment: number | BoundaryPosition | null
  draggingState: DraggingState
  draggingType: number
  resizeGuidesVisible: boolean
  immediateRemoval: boolean
}

const initialState: UiState = {
  welcomePanelVisible: false,
  welcomePanelDismissed: false,
  toolboxVisible: false,
  activeSegment: null,
  draggingState: {
    isDragging: false,
    segmentBeforeEl: null,
    segmentAfterEl: null,
    draggedSegment: null,
    withinCanvas: false,
  },
  draggingType: DRAGGING_TYPE_NONE,
  resizeGuidesVisible: false,

  // When true, slices are removed from view without animation
  // This is only needed during `clearSegments()`, gallery replacement
  // seems to be handled differently.
  immediateRemoval: false,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,

  reducers: {
    setWelcomePanelVisible(
      state,
      action: PayloadAction<UiState['welcomePanelVisible']>
    ) {
      state.welcomePanelVisible = action.payload
    },

    setWelcomePanelDismissed(state) {
      state.welcomePanelDismissed = true
      state.welcomePanelVisible = false
    },

    setActiveSegment(state, action: PayloadAction<UiState['activeSegment']>) {
      // If we're in the middle of a resize drag state, do not set a new
      // active segment.
      if (!state.resizeGuidesVisible) {
        state.activeSegment = action.payload
      }
    },

    initDraggingState(
      state,
      action: PayloadAction<{
        type: UiState['draggingType']
        dragIndex?: number
      }>
    ) {
      state.draggingState.isDragging = true
      if (action.payload.dragIndex !== undefined) {
        state.draggingState.draggedSegment = action.payload.dragIndex
      }
      state.draggingType = action.payload.type
    },

    updateDraggingState(state, action: PayloadAction<Partial<DraggingState>>) {
      state.draggingState = {
        ...state.draggingState,
        ...action.payload,
      }
    },

    clearDraggingState(state) {
      state.draggingState = {
        isDragging: false,
        segmentBeforeEl: null,
        segmentAfterEl: null,
        draggedSegment: null,
        withinCanvas: false,
      }
      state.draggingType = DRAGGING_TYPE_NONE
    },

    setDraggingType(state, action: PayloadAction<UiState['draggingType']>) {
      state.draggingType = action.payload
      state.resizeGuidesVisible = action.payload === DRAGGING_TYPE_RESIZE
    },

    toggleToolbox(state) {
      state.toolboxVisible = !state.toolboxVisible
    },

    setImmediateRemoval(
      state,
      action: PayloadAction<UiState['immediateRemoval']>
    ) {
      state.immediateRemoval = action.payload
    },
  },
})

export const {
  setWelcomePanelVisible,
  setWelcomePanelDismissed,
  setActiveSegment,
  initDraggingState,
  updateDraggingState,
  clearDraggingState,
  setDraggingType,
  toggleToolbox,
  setImmediateRemoval,
} = uiSlice.actions

export default uiSlice.reducer
