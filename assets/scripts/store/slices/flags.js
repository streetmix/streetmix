import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import FEATURE_FLAGS from '../../../../app/data/flags'
import { getFlags } from '../../util/api'

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

export const getInitialFlags = createAsyncThunk(
  'flags/getInitialFlags',
  async () => {
    const response = await getFlags()
    return response.data
  }
)

const flagsSlice = createSlice({
  name: 'flags',
  // TODO: Remove static initial flag setting and only rely on API
  // can't be removed right now because there are other dependencies of this
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
  },

  extraReducers: (builder) => {
    builder.addCase(getInitialFlags.fulfilled, (state, action) => {
      state = generateInitialFlags(action.payload)
    })
  }
})

export const { setFeatureFlag, setFlagOverrides } = flagsSlice.actions

export default flagsSlice.reducer
