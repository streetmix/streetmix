import { createSlice } from '@reduxjs/toolkit'
import { type SliceDescription } from '@streetmix/types'

import { startPrinting } from './app'

interface InfoBubbleState {
  mouseInside: boolean
  descriptionVisible: boolean
  descriptionData: SliceDescription | null
}

const initialState: InfoBubbleState = {
  mouseInside: false,
  descriptionVisible: false,
  descriptionData: null
}

const infoBubbleSlice = createSlice({
  name: 'infoBubble',
  initialState,

  reducers: {
    setInfoBubbleMouseInside (state, action) {
      state.mouseInside = action.payload
    },

    showDescription (state, action) {
      state.descriptionVisible = true
      state.descriptionData = action.payload
    },

    hideDescription (state) {
      state.descriptionVisible = false
      // Keep data around for exit animation
      // state.descriptionData = null
    }
  },

  extraReducers: (builder) => {
    builder.addCase(startPrinting, (state) => {
      state.descriptionVisible = false
      state.mouseInside = false
    })
  }
})

export const { setInfoBubbleMouseInside, showDescription, hideDescription } =
  infoBubbleSlice.actions

export default infoBubbleSlice.reducer
