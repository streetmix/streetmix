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

    clearMenus (state, action) {
      return null
    }
  },

  // Certain other actions in the app will also hide menus.
  extraReducers: (builder) => {
    builder
      .addCase('gallery/openGallery/pending', (state) => null)
      .addCase(showDialog, (state) => null)
      .addCase(startPrinting, (state) => null)
  }
})

export const { showMenu, clearMenus } = menusSlice.actions

export default menusSlice.reducer
