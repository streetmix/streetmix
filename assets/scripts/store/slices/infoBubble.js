import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { startPrinting } from './app'

/**
 * Conditionally dispatches show() only if info bubble is not visible.
 */
export const showInfoBubble = createAsyncThunk(
  'infoBubble/showInfoBubble',
  (arg, { dispatch, getState }) => {
    dispatch(infoBubbleSlice.actions.show())
  },
  {
    condition: (arg, { getState, extra }) => {
      if (getState().infoBubble.visible === true) {
        return false
      }
    }
  }
)

/**
 * Conditionally dispatches hide() only if info bubble is visible.
 */
export const hideInfoBubble = createAsyncThunk(
  'infoBubble/showInfoBubble',
  (arg, { dispatch, getState }) => {
    dispatch(infoBubbleSlice.actions.hide())
  },
  {
    condition: (arg, { getState, extra }) => {
      if (getState().infoBubble.visible === false) {
        return false
      }
    }
  }
)

const infoBubbleSlice = createSlice({
  name: 'infoBubble',
  initialState: {
    visible: false,
    mouseInside: false,
    descriptionVisible: false,
    hoverPolygon: []
  },

  reducers: {
    show (state, action) {
      state.visible = true

      // When show is requested, hide description
      state.descriptionVisible = false
    },

    hide (state, action) {
      state.visible = false
      state.descriptionVisible = false
      state.mouseInside = false
    },

    updateHoverPolygon (state, action) {
      state.hoverPolygon = action.payload
    },

    setInfoBubbleMouseInside (state, action) {
      state.mouseInside = action.payload
    },

    showDescription (state, action) {
      state.descriptionVisible = true
    },

    hideDescription (state, action) {
      state.descriptionVisible = false
    }
  },

  extraReducers: {
    [startPrinting]: (state, action) => {
      state.visible = false
      state.descriptionVisible = false
      state.mouseInside = false
    }
  }
})

export const {
  show,
  hide,
  updateHoverPolygon,
  setInfoBubbleMouseInside,
  showDescription,
  hideDescription
} = infoBubbleSlice.actions

export default infoBubbleSlice.reducer
