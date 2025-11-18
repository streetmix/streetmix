import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface DialogState {
  name: string | null
}

// It may be desirable to simplify the shape of this state object
// to just a string - see the menus state for example.
// This used to have more properties in an earlier implementation,
// and is currently selected as a prop object by the <DialogRoot>
// component, which means this can't be refactored until that is.
const initialState: DialogState = {
  name: null
}

const dialogsSlice = createSlice({
  name: 'dialogs',
  initialState,

  reducers: {
    showDialog (state, action: PayloadAction<DialogState['name']>) {
      state.name = action.payload
    },

    clearDialogs (state) {
      state.name = null
    }
  }
})

export const { showDialog, clearDialogs } = dialogsSlice.actions

export default dialogsSlice.reducer
