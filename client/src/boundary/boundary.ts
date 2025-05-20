import { round } from '@streetmix/utils'

import BOUNDARY_DEFS from '../boundary/boundary_defs.yaml'
import { prettifyWidth } from '../util/width_units'
import { images } from '../app/load_resources'
import store from '../store'
import { SETTINGS_UNITS_METRIC } from '../users/constants'
import { TILE_SIZE, TILESET_POINT_PER_PIXEL } from '../segments/constants'

import type { IntlShape } from 'react-intl'
import type {
  BoundaryDefinition,
  BoundaryPosition,
  UnitsSetting
} from '@streetmix/types'

export function getBoundaryItem (variant: string): BoundaryDefinition {
  const item = BOUNDARY_DEFS[variant]
  if (item.id === undefined) {
    item.id = variant
  }

  return item
}

/**
 * Returns sprite id, given variant and position
 */
export function getSpriteId (
  variant: string,
  position: BoundaryPosition
): string {
  const item = getBoundaryItem(variant)
  return item.spriteId + (item.sameOnBothSides === true ? '' : '-' + position)
}

/**
 * Calculate boundary image height. For buildings that do not have multiple
 * floors, this is just the image's intrinsic height value. For buildings with
 * multiple floors, this must be calculated from the number of floors and
 * sprite pixel specifications.
 */
export function getBoundaryImageHeight (
  variant: string,
  position: BoundaryPosition,
  floors = 1
): number {
  const item = getBoundaryItem(variant)
  let height

  if (item.hasFloors) {
    height =
      (item.roofHeight +
        item.floorHeight * (floors - 1) +
        item.mainFloorHeight) *
      TILE_SIZE
  } else {
    const id = getSpriteId(variant, position)
    const svg = images.get(id)
    height = svg.height / TILESET_POINT_PER_PIXEL
  }

  return height
}

/**
 * Converts the number of floors to an actual height in meters
 */
function calculateRealHeightNumber (
  variant: string,
  position: BoundaryPosition,
  floors: number
): number {
  const CURB_HEIGHT = 0.15 // meters
  return (
    (getBoundaryImageHeight(variant, position, floors) - CURB_HEIGHT) /
    TILE_SIZE
  )
}

/**
 * Given a building, return a string showing number of floors and actual
 * height measurement e.g. when height value is `4` return a string that
 * looks like this:
 *    "4 floors (45m)"
 */
export function prettifyHeight (
  variant: string,
  position: BoundaryPosition,
  floors: number,
  units: UnitsSetting,
  formatMessage: IntlShape['formatMessage']
): string {
  let text = formatMessage(
    {
      id: 'building.floors-count',
      defaultMessage: '{count, plural, one {# floor} other {# floors}}'
    },
    {
      count: floors
    }
  )

  let realHeight = calculateRealHeightNumber(variant, position, floors)
  if (units === SETTINGS_UNITS_METRIC) {
    realHeight = round(realHeight, 1)
  }
  const locale = store.getState().locale.locale
  const prettifiedHeight = prettifyWidth(realHeight, units, locale)

  text += ` (${prettifiedHeight})`

  return text
}
