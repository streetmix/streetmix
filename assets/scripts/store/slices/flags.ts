import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { FeatureFlagDefinition, FeatureFlags } from '../../types'
import FEATURE_FLAGS from '../../../../app/data/flags.json'
import { getFlags } from '../../util/api'

interface FeatureFlagSetting extends FeatureFlagDefinition {
  value: boolean
  source: 'initial' | 'session'
}

interface FeatureFlagState extends Record<string, FeatureFlagSetting> {}

function generateInitialFlags (flags: FeatureFlags): FeatureFlagState {
  return Object.entries(flags).reduce((obj: FeatureFlagState, item) => {
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
    setFeatureFlag (
      state,
      action: PayloadAction<{ flag: string, value: boolean }>
    ) {
      const flag = state[action.payload.flag]
      state[action.payload.flag] = {
        ...flag,
        value: action.payload.value,
        source: 'session'
      }
    },

    setFlagOverrides (state, action: PayloadAction<FeatureFlagState>) {
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
