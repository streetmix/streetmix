import { createSlice } from '@reduxjs/toolkit'
import FEATURE_FLAGS from '@streetmix/feature-flags'

import { STREETMIX_INSTANCE } from '../../app/config'

import type { PayloadAction } from '@reduxjs/toolkit'
import type { FeatureFlagDefinition, FeatureFlags } from '../../types'

interface FeatureFlagSetting extends FeatureFlagDefinition {
  value: boolean
  source: 'initial' | 'session'
}

export type FeatureFlagState = Record<string, FeatureFlagSetting>

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

    // Special-case flag turned on for a specific Streetmix instance
    if (key === 'COASTMIX_MODE' && STREETMIX_INSTANCE === 'coastmix') {
      obj[key].value = true
    }

    return obj
  }, {})
}

const flagsSlice = createSlice({
  name: 'flags',
  // TODO: Remove static initial flag setting and only rely on API
  // can't be removed right now because there are other dependencies of this
  initialState: generateInitialFlags(FEATURE_FLAGS),

  reducers: {
    setFeatureFlag (
      state,
      action: PayloadAction<{ flag: string; value: boolean }>
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
  }
})

export const { setFeatureFlag, setFlagOverrides } = flagsSlice.actions

export default flagsSlice.reducer
