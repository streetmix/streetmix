import { createSlice } from '@reduxjs/toolkit'

const dialogsSlice = createSlice({
  name: 'dialogs',

  // It may be desirable to simplify the shape of this state object
  // to just a string - see the menus state for example.
  // This used to have more properties in an earlier implementation,
  // and is currently selected as a prop object by the <DialogRoot>
  // component, which means this can't be refactored until that is.
  initialState: {
    name: null
  },

  reducers: {
    showDialog (state, action) {
      state.name = action.payload
    },

    clearDialogs (state, action) {
      state.name = null
    }
  }
})

export const { showDialog, clearDialogs } = dialogsSlice.actions

export default dialogsSlice.reducer
