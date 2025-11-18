import { createSlice } from '@reduxjs/toolkit'
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
      .addCase('gallery/openGallery/pending', () => null)
      .addCase('dialogs/showDialog', () => null)
      .addCase('app/startPrinting', () => null)
  }
})

export const { showMenu, clearMenus } = menusSlice.actions

export default menusSlice.reducer
