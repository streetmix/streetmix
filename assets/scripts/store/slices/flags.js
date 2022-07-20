import { createSlice } from '@reduxjs/toolkit'
import FEATURE_FLAGS from '../../../../app/data/flags'

function generateInitialFlags (flags) {
  return Object.entries(flags).reduce((obj, item) => {
    const [key, value] = item
    obj[key] = {
      // Keep all original properties
      ...value,
      // Add new ones
      value: value.defaultValue,
      source: 'initial'
    }

    return obj
  }, {})
}

const flagsSlice = createSlice({
  name: 'flags',
  initialState: generateInitialFlags(FEATURE_FLAGS),

  reducers: {
    setFeatureFlag (state, action) {
      const flag = state[action.payload.flag]
      state[action.payload.flag] = {
        ...flag,
        value: action.payload.value,
        source: 'session'
      }
    },

    setFlagOverrides (state, action) {
      return {
        ...state,
        ...action.payload
      }
    }
  }
})

export const { setFeatureFlag, setFlagOverrides } = flagsSlice.actions

export default flagsSlice.reducer
