import {
  SETTINGS_UNITS_IMPERIAL,
  SETTINGS_UNITS_METRIC,
} from '../users/constants'
import { processWidthInput } from './width_units'

// Use this when it doesn't matter what the unit is.
const DEFAULT_UNITS = SETTINGS_UNITS_METRIC

describe('processWidthInput()', () => {
  it('trims leading and trailing whitespace', () => {
    const input = processWidthInput(' 3.75 ', DEFAULT_UNITS)
    expect(input).toEqual(3.75)
  })

  it('parses a value (3)', () => {
    const value = '3'

    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(3)

    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(0.914)
  })

  it('parses a value with trailing period (3.)', () => {
    const value = '3.'

    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(3)

    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(0.914)
  })

  it("parses a value with a prime symbol (3')", () => {
    const value = "3'"

    // Even in metric mode, the prime symbol should cause the value to be
    // interpreted as imperial units
    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(0.914)

    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(0.914)
  })

  it('parses a value with a double-prime symbol (3")', () => {
    const value = '3"'

    // Even in metric mode, the double-prime symbol should cause the value
    // to be interpreted as imperial units
    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(0.076)

    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(0.076)
  })

  it('parses a decimal with trailing zeroes (3.00)', () => {
    const value = '3.00'

    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(3)

    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(0.914)
  })

  it('parses a decimal without units (3.75)', () => {
    const value = '3.75'

    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(3.75)

    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(1.143)
  })

  it("parses a decimal with prime symbol (3.75')", () => {
    const value = "3.75'"

    // Even in metric mode, the prime symbol should cause the value to be
    // interpreted as imperial units
    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(1.143)

    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(1.143)
  })

  it('parses a decimal with `ft` unit (3.75 ft)', () => {
    const value = '3.75 ft'

    // Even in metric mode, the `ft` should cause the value to be interpreted
    // as imperial units
    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(1.143)

    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(1.143)
  })

  it('parses a decimal with `ft.` unit (3.75 ft.)', () => {
    const value = '3.75 ft.'

    // Even in metric mode, the `ft` should cause the value to be interpreted
    // as imperial units
    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(1.143)

    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(1.143)
  })

  it('parses a decimal with `ft` unit and no space (3.75ft)', () => {
    const value = '3.75ft'

    // Even in metric mode, the `ft` should cause the value to be interpreted
    // as imperial units
    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(1.143)

    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(1.143)
  })

  it('parses `feet` unit (3 feet)', () => {
    const value = '3 feet'

    // Even in metric mode, the `feet` should cause the value to be interpreted
    // as imperial units
    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(0.914)

    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(0.914)
  })

  it('parses `in` unit', () => {
    const value = '12 in'

    // Even in metric mode, the `in` should cause the value to be interpreted
    // as imperial units
    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(0.305)

    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(0.305)
  })

  it('parses `in.` unit', () => {
    const value = '24 in.'

    // Even in metric mode, the `in.` should cause the value to be
    // interpreted as imperial units
    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(0.61)

    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(0.61)
  })

  it('parses `inch` unit', () => {
    const value = '36 inches'

    // Even in metric mode, the `inch` should cause the value to be
    // interpreted as imperial units
    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(0.914)

    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(0.914)
  })

  it('parses `inches` unit', () => {
    const value = '6 inches'

    // Even in metric mode, the `inches` should cause the value to be
    // interpreted as imperial units
    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(0.152)

    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(0.152)
  })

  it('parses feet and inches with prime and double-prime symbols (3\'9")', () => {
    const value = '3\'9"'

    // Even in metric mode, the `ft` should cause the value to be interpreted
    // as imperial units
    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(1.143)

    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(1.143)
  })

  it("parses feet and inches with prime symbol, lacking a final double-prime symbol (3'9)", () => {
    const value = "3'9"

    // Even in metric mode, the `ft` should cause the value to be interpreted
    // as imperial units
    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(1.143)

    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(1.143)
  })

  it('parses feet and inches with prime and double-prime symbols and hyphen separator (3\'-9")', () => {
    const value = '3\'-9"'

    // Even in metric mode, the `ft` should cause the value to be interpreted
    // as imperial units
    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(1.143)

    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(1.143)
  })

  it("parses feet and inches with prime and hyphen separator, lacking a final double-prime symbol (3'-9)", () => {
    const value = "3'-9"

    // Even in metric mode, the `ft` should cause the value to be interpreted
    // as imperial units
    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(1.143)

    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(1.143)
  })

  it('parses feet and inches with prime and double-prime symbols and space separator (3\' 9")', () => {
    const value = '3\' 9"'

    // Even in metric mode, the `ft` should cause the value to be interpreted
    // as imperial units
    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(1.143)

    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(1.143)
  })

  it("parses feet and inches with prime and space separator, lacking a final double-prime symbol (3' 9)", () => {
    const value = "3' 9"

    // Even in metric mode, the `ft` should cause the value to be interpreted
    // as imperial units
    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(1.143)

    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(1.143)
  })

  it('parses feet and inches with support for leading zero (0\'6")', () => {
    const value = "0'6"

    // Even in metric mode, the `ft` should cause the value to be interpreted
    // as imperial units
    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(0.152)

    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(0.152)
  })

  it('parses feet and inches with support for leading zero (0\'-3")', () => {
    const value = "0'-3"

    // Even in metric mode, the `ft` should cause the value to be interpreted
    // as imperial units
    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(0.076)

    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(0.076)
  })

  it('parses feet and inches using a vulgar fraction (3¼′")', () => {
    // When a vulgar fraction is present it is very likely included with the
    // prime mark
    const value = '3¼′'

    // Even in metric mode, the prime symbol should cause the value to be
    // interpreted as imperial units
    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(0.991)

    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(0.991)
  })

  it('parses a value using the prime mark (3′)', () => {
    const value = '3′'

    // Even in metric mode, the prime symbol should cause the value to be
    // interpreted as imperial units
    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(0.914)

    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(0.914)
  })

  // TODO: This does not work because the parser only splits on straight-quotes
  // not prime marks yet.
  it.skip('parses a value using the prime marks (3′-6″)', () => {
    const value = '3′-6″'

    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(1.067)

    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(1.067)
  })

  it('parses a value with meters unit (3m)', () => {
    const value = '3m'

    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(3)

    // Even in imperial mode, the `m` should cause the value to be interpreted
    // as metric units
    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(3)
  })

  it('parses a value with a space between it and the meters unit (3 m)', () => {
    const value = '3 m'

    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(3)

    // Even in imperial mode, the `m` should cause the value to be interpreted
    // as metric units
    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(3)
  })

  it('parses a decimal value with meters unit (3.0m)', () => {
    const value = '3.0m'

    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(3)

    // Even in imperial mode, the `m` should cause the value to be interpreted
    // as metric units
    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(3)
  })

  it('parses a decimal value with a space between it and the meters unit (3.0 m)', () => {
    const value = '3.0 m'

    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(3)

    // Even in imperial mode, the `m` should cause the value to be interpreted
    // as metric units
    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(3)
  })

  it('parses a value with decimeters unit (150dm)', () => {
    const value = '150dm'

    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(15)

    // Even in imperial mode, the `cm` should cause the value to be interpreted
    // as metric units
    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(15)
  })

  it('parses a value with centimeters unit (150cm)', () => {
    const value = '150cm'

    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(1.5)

    // Even in imperial mode, the `cm` should cause the value to be interpreted
    // as metric units
    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(1.5)
  })

  it('parses a value with millimeters unit (150mm)', () => {
    const value = '150mm'

    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(0.15)

    // Even in imperial mode, the `mm` should cause the value to be interpreted
    // as metric units
    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(0.15)
  })

  it('parses a value with the Cyrillic meters unit (3 м)', () => {
    const value = '3 м'

    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(3)

    // Even in imperial mode, the `м` should cause the value to be interpreted
    // as metric units
    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(3)
  })
})
