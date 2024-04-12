import { prettifyHeight } from '../buildings'
import {
  SETTINGS_UNITS_METRIC,
  SETTINGS_UNITS_IMPERIAL
} from '../../users/constants'

describe('prettifyHeight()', () => {
  it('formats a building with floors with height (metric)', () => {
    const formatMessage = () => '2 floors'
    const text = prettifyHeight(
      'wide',
      'left',
      2,
      SETTINGS_UNITS_METRIC,
      formatMessage
    )
    expect(text).toBe('2 floors (7.9 m)')
  })

  it('formats a building with floors with height (metric)', () => {
    const formatMessage = () => '3 floors'
    const text = prettifyHeight(
      'narrow',
      'right',
      3,
      SETTINGS_UNITS_IMPERIAL,
      formatMessage
    )
    expect(text).toBe('3 floors (36′)')
  })
})
