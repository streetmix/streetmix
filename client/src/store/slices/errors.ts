import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface ErrorState {
  errorType: number | null
  abortEverything: boolean
}

const initialState: ErrorState = {
  errorType: null,
  abortEverything: false
}

const errorsSlice = createSlice({
  name: 'errors',
  initialState,

  reducers: {
    showError: {
      reducer (state, action: PayloadAction<ErrorState>) {
        state.errorType = action.payload.errorType
        state.abortEverything = action.payload.abortEverything || false
      },
      prepare (errorType: number | null, abortEverything: boolean) {
        return {
          payload: {
            errorType,
            abortEverything
          }
        }
      }
    },

    hideError (state, action) {
      state.errorType = null
      state.abortEverything = false
    }
  }
})

export const { showError, hideError } = errorsSlice.actions

export default errorsSlice.reducer
