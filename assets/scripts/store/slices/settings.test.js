/* eslint-env jest */
import settings, { updateSettings, setUserUnits } from './settings'
import { changeLocale } from './locale'

describe('settings reducer', () => {
  const initialState = {
    lastStreetId: null,
    lastStreetNamespacedId: null,
    lastStreetCreatorId: null,
    newStreetPreference: 1,
    saveAsImageTransparentSky: false,
    saveAsImageSegmentNamesAndWidths: false,
    saveAsImageStreetName: false,
    saveAsImageWatermark: true,
    locale: null,
    units: null
  }

  it('should handle initial state', () => {
    expect(settings(undefined, {})).toEqual(initialState)
  })

  it('should handle updateSettings()', () => {
    expect(
      settings(
        initialState,
        updateSettings({
          saveAsImageTransparentSky: true,
          saveAsImageSegmentNamesAndWidths: true
        })
      )
    ).toEqual({
      lastStreetId: null,
      lastStreetNamespacedId: null,
      lastStreetCreatorId: null,
      newStreetPreference: 1,
      saveAsImageTransparentSky: true,
      saveAsImageSegmentNamesAndWidths: true,
      saveAsImageStreetName: false,
      saveAsImageWatermark: true,
      locale: null,
      units: null
    })

    // Handle empty objects, and null or undefined values
    expect(settings(initialState, updateSettings({}))).toEqual(initialState)

    expect(settings(initialState, updateSettings(null))).toEqual(initialState)

    expect(settings(initialState, updateSettings())).toEqual(initialState)
  })

  it('should handle setUserUnits()', () => {
    expect(settings(initialState, setUserUnits(2))).toEqual({
      lastStreetId: null,
      lastStreetNamespacedId: null,
      lastStreetCreatorId: null,
      newStreetPreference: 1,
      saveAsImageTransparentSky: false,
      saveAsImageSegmentNamesAndWidths: false,
      saveAsImageStreetName: false,
      saveAsImageWatermark: true,
      units: 2,
      locale: null
    })
  })

  // TODO: Remove this test once we have type safety
  it('should handle setUserUnits() with string arguments', () => {
    expect(settings(initialState, setUserUnits('2'))).toEqual({
      lastStreetId: null,
      lastStreetNamespacedId: null,
      lastStreetCreatorId: null,
      newStreetPreference: 1,
      saveAsImageTransparentSky: false,
      saveAsImageSegmentNamesAndWidths: false,
      saveAsImageStreetName: false,
      saveAsImageWatermark: true,
      units: 2,
      locale: null
    })
  })

  it('should handle extra reducers', () => {
    expect(
      settings(
        initialState,
        changeLocale.fulfilled({
          locale: 'fi'
        })
      )
    ).toEqual({
      lastStreetId: null,
      lastStreetNamespacedId: null,
      lastStreetCreatorId: null,
      newStreetPreference: 1,
      saveAsImageTransparentSky: false,
      saveAsImageSegmentNamesAndWidths: false,
      saveAsImageStreetName: false,
      saveAsImageWatermark: true,
      units: null,
      locale: 'fi'
    })
  })
})
