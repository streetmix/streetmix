import { createSlice } from '@reduxjs/toolkit'

const errorsSlice = createSlice({
  name: 'errors',
  initialState: {
    errorType: null,
    abortEverything: false
  },

  reducers: {
    showError: {
      reducer (state, action) {
        state.errorType = action.payload.errorType
        state.abortEverything = action.payload.abortEverything
      },
      prepare (errorType, abortEverything) {
        return {
          payload: {
            errorType,
            abortEverything: !!abortEverything
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
