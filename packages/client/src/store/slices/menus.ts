import { createSlice } from '@reduxjs/toolkit'
import { showDialog } from './dialogs'
import { startPrinting } from './app'

const initialState: string | null = null

const menusSlice = createSlice({
  name: 'menus',
  initialState,

  reducers: {
    showMenu (state, action) {
      return action.payload
    },

    clearMenus (state) {
      return null
    }
  },

  // Certain other actions in the app will also hide menus.
  extraReducers: (builder) => {
    builder
      .addCase('gallery/openGallery/pending', (state) => null)
      // This is a workaround for Jest, because many tests are using a mock
      // showDialog action, which breaks addCase since the `type` will be
      // undefined. If it's not there, pass the string action name instead
      .addCase(showDialog.type ?? 'dialogs/showDialog', (state) => null)
      .addCase(startPrinting, (state) => null)
  }
})

export const { showMenu, clearMenus } = menusSlice.actions

export default menusSlice.reducer
