/* eslint-env jest */
import { processWidthInput } from '../width_units'
import { SETTINGS_UNITS_IMPERIAL, SETTINGS_UNITS_METRIC } from '../../users/localization'

jest.mock('../../users/localization', () => {
  return {
    SETTINGS_UNITS_IMPERIAL: 1,
    SETTINGS_UNITS_METRIC: 2
  }
})

// Use this when it doesn't matter what the unit is.
// TODO: Switch default units to metric
const DEFAULT_UNITS = SETTINGS_UNITS_IMPERIAL

describe('processWidthInput()', () => {
  it('trims leading and trailing whitespace', () => {
    const input = processWidthInput(' 3.75 ', DEFAULT_UNITS)
    expect(input).toEqual(3.75)
  })

  it('parses a value (3)', () => {
    const value = '3'

    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(10)

    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(3)
  })

  it('parses a value with trailing period (3.)', () => {
    const value = '3.'

    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(10)

    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(3)
  })

  it('parses a value with a prime symbol (3\')', () => {
    const value = '3\''

    // Even in metric mode, the prime symbol causes the value to be interpreted as imperial units
    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(3)

    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(3)
  })

  it('parses a value with a double-prime symbol (3")', () => {
    const value = '3"'

    // Even in metric mode, the double-prime symbol causes the value to be interpreted as imperial units
    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(0.25)

    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(0.25)
  })

  it('parses a decimal with trailing zeroes (3.00)', () => {
    const value = '3.00'

    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(10)

    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(3)
  })

  it('parses a decimal without units (3.75)', () => {
    const value = '3.75'

    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(12.5)

    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(3.75)
  })

  it('parses a decimal with prime symbol (3.75\')', () => {
    const value = '3.75\''

    // Even in metric mode, the prime symbol causes the value to be interpreted as imperial units
    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(3.75)

    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(3.75)
  })

  it('parses a decimal with `ft` unit (3.75 ft)', () => {
    const value = '3.75 ft'

    // Even in metric mode, the `ft` causes the value to be interpreted as imperial units
    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(3.75)

    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(3.75)
  })

  it('parses a decimal with `ft.` unit (3.75 ft.)', () => {
    const value = '3.75 ft.'

    // Even in metric mode, the `ft` causes the value to be interpreted as imperial units
    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(3.75)

    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(3.75)
  })

  it('parses a decimal with `ft` unit and no space (3.75ft)', () => {
    const value = '3.75ft'

    // Even in metric mode, the `ft` causes the value to be interpreted as imperial units
    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(3.75)

    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(3.75)
  })

  it('parses `feet` unit (3 feet)', () => {
    const value = '3 feet'

    // Even in metric mode, the `feet` causes the value to be interpreted as imperial units
    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(3)

    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(3)
  })

  it('parses `in` unit', () => {
    const value = '12 in'

    // Even in metric mode, the `in` causes the value to be interpreted as imperial units
    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(1)

    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(1)
  })

  it('parses `in.` unit', () => {
    const value = '24 in.'

    // Even in metric mode, the `in.` causes the value to be interpreted as imperial units
    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(2)

    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(2)
  })

  it('parses `inch` unit', () => {
    const value = '36 inches'

    // Even in metric mode, the `inch` causes the value to be interpreted as imperial units
    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(3)

    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(3)
  })

  it('parses `inches` unit', () => {
    const value = '6 inches'

    // Even in metric mode, the `inches` causes the value to be interpreted as imperial units
    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(0.5)

    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(0.5)
  })

  it('parses feet and inches with prime and double-prime symbols (3\'9")', () => {
    const value = "3'9\""

    // Even in metric mode, the `ft` causes the value to be interpreted as imperial units
    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(3.75)

    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(3.75)
  })

  it('parses feet and inches with prime symbol, lacking a final double-prime symbol (3\'9)', () => {
    const value = "3'9"

    // Even in metric mode, the `ft` causes the value to be interpreted as imperial units
    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(3.75)

    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(3.75)
  })

  it('parses feet and inches with prime and double-prime symbols and hyphen separator (3\'-9")', () => {
    const value = "3'-9\""

    // Even in metric mode, the `ft` causes the value to be interpreted as imperial units
    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(3.75)

    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(3.75)
  })

  it('parses feet and inches with prime and hyphen separator, lacking a final double-prime symbol (3\'-9)', () => {
    const value = "3'-9"

    // Even in metric mode, the `ft` causes the value to be interpreted as imperial units
    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(3.75)

    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(3.75)
  })

  it('parses feet and inches with prime and double-prime symbols and space separator (3\' 9")', () => {
    const value = "3' 9\""

    // Even in metric mode, the `ft` causes the value to be interpreted as imperial units
    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(3.75)

    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(3.75)
  })

  it('parses feet and inches with prime and space separator, lacking a final double-prime symbol (3\' 9)', () => {
    const value = "3' 9"

    // Even in metric mode, the `ft` causes the value to be interpreted as imperial units
    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(3.75)

    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(3.75)
  })

  it('parses feet and inches with support for leading zero (0\'6")', () => {
    const value = "0'6"

    // Even in metric mode, the `ft` causes the value to be interpreted as imperial units
    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(0.5)

    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(0.5)
  })

  it('parses feet and inches with support for leading zero (0\'-3")', () => {
    const value = "0'-3"

    // Even in metric mode, the `ft` causes the value to be interpreted as imperial units
    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(0.25)

    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(0.25)
  })

  it('parses a value with meters unit (3m)', () => {
    const value = '3m'

    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(10)

    // Even in imperial mode, the `m` causes the value to be interpreted as metric units
    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(10)
  })

  it('parses a decimal value with meters unit (3.0m)', () => {
    const value = '3.0m'

    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(10)

    // Even in imperial mode, the `m` causes the value to be interpreted as metric units
    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(10)
  })

  it('parses a value with centimeters unit (150cm)', () => {
    const value = '150cm'

    const input1 = processWidthInput(value, SETTINGS_UNITS_METRIC)
    expect(input1).toEqual(5) // 150cm => 1.5m => 5ft

    // Even in imperial mode, the `cm` causes the value to be interpreted as metric units
    const input2 = processWidthInput(value, SETTINGS_UNITS_IMPERIAL)
    expect(input2).toEqual(5)
  })
})
