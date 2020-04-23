import { createSlice } from '@reduxjs/toolkit'
import { SHOW_GALLERY } from '../actions'
import { showDialog } from '../slices/dialogs'
import { startPrinting } from '../slices/app'

const menusSlice = createSlice({
  name: 'menus',
  initialState: null,

  reducers: {
    showMenu (state, action) {
      return action.payload
    },

    clearMenus (state, action) {
      return null
    }
  },

  // Certain other actions in the app will also hide menus.
  extraReducers: {
    [SHOW_GALLERY]: (state) => null,
    [showDialog]: (state) => null,
    [startPrinting]: (state) => null
  }
})

export const { showMenu, clearMenus } = menusSlice.actions

export default menusSlice.reducer
