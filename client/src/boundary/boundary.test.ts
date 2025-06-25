import {
  SETTINGS_UNITS_METRIC,
  SETTINGS_UNITS_IMPERIAL
} from '../users/constants'
import { prettifyHeight } from './boundary'

describe('prettifyHeight()', () => {
  it('formats a building with floors with height (metric)', () => {
    const formatMessage = (): string => '2 floors'
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
    const formatMessage = (): string => '3 floors'
    const text = prettifyHeight(
      'narrow',
      'right',
      3,
      SETTINGS_UNITS_IMPERIAL,
      formatMessage
    )
    expect(text).toBe('3 floors (36⅛′)')
  })
})
