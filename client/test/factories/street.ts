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
    id: 'street-id',
    namespacedId: 1,
    schemaVersion: 34,
    units: SETTINGS_UNITS_METRIC,
    width: 18,
    name: null,
    segments: [],
    boundary: {
      left: {
        id: 'left-boundary-id',
        variant: 'left-boundary-variant',
        floors: 1,
        elevation: 0,
      },
      right: {
        id: 'right-boundary-id',
        variant: 'right-boundary-variant',
        floors: 1,
        elevation: 0,
      },
    },
    skybox: 'day',
    weather: null,
    location: null,
    showAnalytics: false,
    userUpdated: false,
    editCount: 0,
    occupiedWidth: 14,
    remainingWidth: 4,
    creatorId: 'foo',
    originalStreetId: null,
    immediateRemoval: true,
  }

  return merge(streetState, overrides as Partial<StreetState>)
}
