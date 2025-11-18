import { createSlice } from '@reduxjs/toolkit'

import { showDialog } from './dialogs'
import { startPrinting } from './app'

import type { PayloadAction } from '@reduxjs/toolkit'

const initialState: string | null = null

const menusSlice = createSlice({
  name: 'menus',
  initialState,

  reducers: {
    showMenu (_state, action: PayloadAction<string | null>) {
      return action.payload
    },

    clearMenus () {
      return null
    }
  },

  // Certain other actions in the app will also hide menus.
  extraReducers: (builder) => {
    builder
      .addCase('gallery/openGallery/pending', (_state) => null)
      // This is a workaround for Jest, because many tests are using a mock
      // showDialog action, which breaks addCase since the `type` will be
      // undefined. If it's not there, pass the string action name instead
      .addCase(showDialog.type ?? 'dialogs/showDialog', (_state) => null)
      .addCase(startPrinting, (_state) => null)
  }
})

export const { showMenu, clearMenus } = menusSlice.actions

export default menusSlice.reducer
