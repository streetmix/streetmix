import { SETTINGS_UNITS_METRIC } from '~/src/users/constants'
import merge from 'deepmerge'

import type { StreetState } from '@streetmix/types'

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Array<infer U>
    ? DeepPartial<U>[]
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K]
}

export function createStreetState(overrides: DeepPartial<StreetState> = {}) {
  const streetState: StreetState = {
    id: '',
    namespacedId: 1,
    originalStreetId: null,
    schemaVersion: 0,
    units: SETTINGS_UNITS_METRIC,
    width: 0,
    name: null,
    segments: [],
    boundary: {
      left: {
        id: '',
        variant: '',
        floors: 1,
        elevation: 0,
      },
      right: {
        id: '',
        variant: '',
        floors: 1,
        elevation: 0,
      },
    },
    skybox: 'day',
    weather: null,
    location: null,
    showAnalytics: false,
    occupiedWidth: 0,
    remainingWidth: 0,
    creatorId: null,
    userUpdated: false,
    editCount: 0,
    immediateRemoval: true,
  }

  return merge(streetState, overrides as Partial<StreetState>)
}
