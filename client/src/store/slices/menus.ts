import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface MenuState {
  id: string | null
}

const initialState: MenuState = {
  id: null
}

const menusSlice = createSlice({
  name: 'menus',
  initialState,

  reducers: {
    showMenu (state, action: PayloadAction<string | null>) {
      state.id = action.payload
    },

    clearMenus (state) {
      state.id = null
    }
  },

  // Certain other actions in the app will also hide menus.
  extraReducers: (builder) => {
    builder
      .addCase('gallery/openGallery/pending', (state) => {
        state.id = null
      })
      .addCase('dialogs/showDialog', (state) => {
        state.id = null
      })
      .addCase('app/startPrinting', (state) => {
        state.id = null
      })
  }
})

export const { showMenu, clearMenus } = menusSlice.actions

export default menusSlice.reducer
