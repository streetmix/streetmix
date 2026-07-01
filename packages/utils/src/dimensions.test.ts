import { Decimal } from 'decimal.js'
import { prettifyWidth, roundToNearestEighth } from './dimensions.js'

const SETTINGS_UNITS_METRIC = 0
const SETTINGS_UNITS_IMPERIAL = 1

describe('roundToNearestEighth()', () => {
  it('matches decimal.js toDecimalPlaces() behavior', () => {
    // Randomly select a few numbers to test.
    for (let i = 0; i < 10; i++) {
      const value = Math.random() * 10
      const a = roundToNearestEighth(value)
      const b = new Decimal(value).toNearest(0.125).toNumber()
      expect(a).toEqual(b)
    }
  })
})

describe('prettifyWidth()', () => {
  it('formats a metric width in English', () => {
    const width = prettifyWidth(3, SETTINGS_UNITS_METRIC, 'en')
    expect(width).toBe('3 m')
  })

  // Test passes if output uses Western Arabic numerals and Arabic character for meter
  // Note that the test outputs in ltr, but in the UI we will be displaying this rtl
  it('formats a metric width in Arabic', () => {
    const width = prettifyWidth(3, SETTINGS_UNITS_METRIC, 'ar')
    expect(width).toBe('3 م')
  })

  // Test passes if output uses the Cyrillic character for meter
  it('formats a metric width in Russian', () => {
    const width = prettifyWidth(3, SETTINGS_UNITS_METRIC, 'ru')
    expect(width).toBe('3 м')
  })

  it('formats a decimal metric width', () => {
    const width = prettifyWidth(9.5, SETTINGS_UNITS_METRIC, 'en')
    expect(width).toBe('9.5 m')
  })

  it('formats an imperial unit width', () => {
    const width = prettifyWidth(0.914, SETTINGS_UNITS_IMPERIAL, 'en')
    expect(width).toBe('3′')
  })

  describe('imperial units with vulgar fractions', () => {
    it('formats .125 as ⅛', () => {
      const width = prettifyWidth(0.953, SETTINGS_UNITS_IMPERIAL, 'en')
      expect(width).toBe('3⅛′')
    })

    it('formats .25 as ¼', () => {
      const width = prettifyWidth(0.991, SETTINGS_UNITS_IMPERIAL, 'en')
      expect(width).toBe('3¼′')
    })

    it('formats .375 as ⅜', () => {
      const width = prettifyWidth(1.029, SETTINGS_UNITS_IMPERIAL, 'en')
      expect(width).toBe('3⅜′')
    })

    it('formats .5 as ½', () => {
      const width = prettifyWidth(1.067, SETTINGS_UNITS_IMPERIAL, 'en')
      expect(width).toBe('3½′')
    })

    it('formats .625 as ⅝', () => {
      const width = prettifyWidth(1.105, SETTINGS_UNITS_IMPERIAL, 'en')
      expect(width).toBe('3⅝′')
    })

    it('formats .75 as ¾', () => {
      const width = prettifyWidth(1.143, SETTINGS_UNITS_IMPERIAL, 'en')
      expect(width).toBe('3¾′')
    })

    it('formats .875 as ⅞', () => {
      const width = prettifyWidth(1.181, SETTINGS_UNITS_IMPERIAL, 'en')
      expect(width).toBe('3⅞′')
    })
  })

  it('formats an imperial unit with decimals to nearest 1/8', () => {
    const width = prettifyWidth(1.113, SETTINGS_UNITS_IMPERIAL, 'en')
    expect(width).toBe('3⅝′') // 3.65' => 3⅝
  })
})
