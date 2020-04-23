/* eslint-env jest */
import persistSettings, { setUserUnits } from './persistSettings'
import { changeLocale } from './locale'

describe('persistSettings reducer', () => {
  const initialState = {
    units: 1,
    locale: null
  }

  it('should handle initial state', () => {
    expect(persistSettings(undefined, {})).toEqual(initialState)
  })

  it('should handle setUserUnits()', () => {
    expect(persistSettings(initialState, setUserUnits(2))).toEqual({
      units: 2,
      locale: null
    })
  })

  // TODO: Remove this test once we have type safety
  it('should handle setUserUnits() with string arguments', () => {
    expect(persistSettings(initialState, setUserUnits('2'))).toEqual({
      units: 2,
      locale: null
    })
  })

  it('should handle extra reducers', () => {
    expect(
      persistSettings(
        initialState,
        changeLocale.fulfilled({
          locale: 'fi'
        })
      )
    ).toEqual({
      units: 1,
      locale: 'fi'
    })
  })
})
