import { createSlice } from '@reduxjs/toolkit'
import { createAsyncThunkTyped as createAsyncThunk } from '../createAsyncThunk'
import { startPrinting } from './app'

interface InfoBubbleState {
  visible: boolean
  mouseInside: boolean
  descriptionVisible: boolean
  hoverPolygon: Array<[number, number]>
}

const initialState: InfoBubbleState = {
  visible: false,
  mouseInside: false,
  descriptionVisible: false,
  hoverPolygon: []
}

/**
 * Conditionally dispatches show() only if info bubble is not visible.
 */
export const showInfoBubble = createAsyncThunk(
  'infoBubble/showInfoBubble',
  (_, { dispatch }) => {
    dispatch(infoBubbleSlice.actions.show())
  },
  {
    condition: (_, { getState }) => {
      if (getState().infoBubble.visible) {
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
  (_, { dispatch }) => {
    dispatch(infoBubbleSlice.actions.hide())
  },
  {
    condition: (_, { getState }) => {
      if (!getState().infoBubble.visible) {
        return false
      }
    }
  }
)

const infoBubbleSlice = createSlice({
  name: 'infoBubble',
  initialState,

  reducers: {
    show (state) {
      state.visible = true

      // When show is requested, hide description
      state.descriptionVisible = false
    },

    hide (state) {
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

    showDescription (state) {
      state.descriptionVisible = true
    },

    hideDescription (state) {
      state.descriptionVisible = false
    }
  },

  extraReducers: (builder) => {
    builder.addCase(startPrinting, (state) => {
      state.visible = false
      state.descriptionVisible = false
      state.mouseInside = false
    })
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
