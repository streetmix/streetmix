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
    const thing = processWidthInput(' 3.75 ')
    expect(thing).toEqual(3.75)
  })

  it('parses a value (3)', () => {
    const thing = processWidthInput('3')
    expect(thing).toEqual(3)
  })

  it('parses a value with trailing period (3.)', () => {
    const thing = processWidthInput('3.')
    expect(thing).toEqual(3)
  })

  it('parses a decimal with trailing zeroes (3.00)', () => {
    const thing = processWidthInput('3.00')
    expect(thing).toEqual(3)
  })

  it('parses a decimal without units (3.75)', () => {
    const thing = processWidthInput('3.75')
    expect(thing).toEqual(3.75)
  })

  it('parses a decimal with prime symbol (3.75\')', () => {
    const thing = processWidthInput("3.75'")
    expect(thing).toEqual(3.75)
  })

  it('parses a decimal with `ft` unit (3.75 ft)', () => {
    const thing = processWidthInput('3.75 ft')
    expect(thing).toEqual(3.75)
  })

  it('parses a decimal with `ft.` unit (3.75 ft.)', () => {
    const thing = processWidthInput('3.75 ft.')
    expect(thing).toEqual(3.75)
  })

  it('parses a decimal with `ft` unit and no space (3.75ft)', () => {
    const thing = processWidthInput('3.75ft')
    expect(thing).toEqual(3.75)
  })

  it('parses feet and inches with prime and double prime symbols (3\'9")', () => {
    const thing = processWidthInput("3'9\"")
    expect(thing).toEqual(3.75)
  })

  it('parses feet and inches with prime and double prime symbols and hyphen separator (3\'-9")', () => {
    const thing = processWidthInput("3'-9\"")
    expect(thing).toEqual(3.75)
  })

  it('parses feet and inches with prime and hyphen separator, lacking a final double prime symbol (3\'-9)', () => {
    const thing = processWidthInput("3'-9")
    expect(thing).toEqual(3.75)
  })

  it('parses feet and inches with prime and double prime symbols and space separator (3\' 9")', () => {
    const thing = processWidthInput("3' 9\"")
    expect(thing).toEqual(3.75)
  })

  it('parses feet and inches with prime and space separator, lacking a final double prime symbol (3\' 9)', () => {
    const thing = processWidthInput("3' 9")
    expect(thing).toEqual(3.75)
  })

  it('parses feet and inches with support for leading zero (0\'-3")', () => {
    const thing = processWidthInput("0'-3")
    expect(thing).toEqual(0.25)
  })

  it('parses a value with meters unit (3m)', () => {
    const thing = processWidthInput('3m')
    expect(thing).toEqual(10)
  })
})
