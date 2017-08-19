/* eslint-env jest */
import { processWidthInput } from '../width_units'

jest.mock('../../streets/data_model', () => {
  return {
    getStreet: () => ({
      units: 1
    })
  }
})
jest.mock('../../users/localization', () => {
  return {
    SETTINGS_UNITS_IMPERIAL: 1,
    SETTINGS_UNITS_METRIC: 2
  }
})

describe('processWidthInput()', () => {
  it('trims leading and trailing whitespace', () => {
    const input = processWidthInput(' 3.75 ')
    expect(input).toEqual(3.75)
  })

  it('parses a value (3)', () => {
    const input = processWidthInput('3')
    expect(input).toEqual(3)
  })

  it('parses a value with trailing period (3.)', () => {
    const input = processWidthInput('3.')
    expect(input).toEqual(3)
  })

  it('parses a value with a prime symbol (3\')', () => {
    const input = processWidthInput('3\'')
    expect(input).toEqual(3)
  })

  it('parses a value with a double-prime symbol (3")', () => {
    const input = processWidthInput('3"')
    expect(input).toEqual(0.25)
  })

  it('parses a decimal with trailing zeroes (3.00)', () => {
    const input = processWidthInput('3.00')
    expect(input).toEqual(3)
  })

  it('parses a decimal without units (3.75)', () => {
    const input = processWidthInput('3.75')
    expect(input).toEqual(3.75)
  })

  it('parses a decimal with prime symbol (3.75\')', () => {
    const input = processWidthInput("3.75'")
    expect(input).toEqual(3.75)
  })

  it('parses a decimal with `ft` unit (3.75 ft)', () => {
    const input = processWidthInput('3.75 ft')
    expect(input).toEqual(3.75)
  })

  it('parses a decimal with `ft.` unit (3.75 ft.)', () => {
    const input = processWidthInput('3.75 ft.')
    expect(input).toEqual(3.75)
  })

  it('parses a decimal with `ft` unit and no space (3.75ft)', () => {
    const input = processWidthInput('3.75ft')
    expect(input).toEqual(3.75)
  })

  it('parses feet and inches with prime and double-prime symbols (3\'9")', () => {
    const input = processWidthInput("3'9\"")
    expect(input).toEqual(3.75)
  })

  it('parses feet and inches with prime symbol, lacking a final double-prime symbol (3\'9)', () => {
    const input = processWidthInput("3'9")
    expect(input).toEqual(3.75)
  })

  it('parses feet and inches with prime and double-prime symbols and hyphen separator (3\'-9")', () => {
    const input = processWidthInput("3'-9\"")
    expect(input).toEqual(3.75)
  })

  it('parses feet and inches with prime and hyphen separator, lacking a final double-prime symbol (3\'-9)', () => {
    const input = processWidthInput("3'-9")
    expect(input).toEqual(3.75)
  })

  it('parses feet and inches with prime and double-prime symbols and space separator (3\' 9")', () => {
    const input = processWidthInput("3' 9\"")
    expect(input).toEqual(3.75)
  })

  it('parses feet and inches with prime and space separator, lacking a final double-prime symbol (3\' 9)', () => {
    const input = processWidthInput("3' 9")
    expect(input).toEqual(3.75)
  })

  it('parses feet and inches with support for leading zero (0\'6")', () => {
    const input = processWidthInput("0'6")
    expect(input).toEqual(0.5)
  })

  it('parses feet and inches with support for leading zero (0\'-3")', () => {
    const input = processWidthInput("0'-3")
    expect(input).toEqual(0.25)
  })

  it('parses a value with meters unit (3m)', () => {
    const input = processWidthInput('3m')
    expect(input).toEqual(10)
  })

  it('parses a decimal value with meters unit (3.0m)', () => {
    const input = processWidthInput('3.0m')
    expect(input).toEqual(10)
  })

  it.skip('todo: parses correctly under different unit preferences')
})
