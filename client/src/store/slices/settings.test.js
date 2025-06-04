import settings, { updateSettings, setUserUnits } from './settings'
import { changeLocale } from './locale'

describe('settings reducer', () => {
  const initialState = {
    colorMode: 'light',
    lastStreetId: null,
    lastStreetNamespacedId: null,
    lastStreetCreatorId: null,
    newStreetPreference: 1,
    saveAsImageTransparentSky: false,
    saveAsImageSegmentNamesAndWidths: false,
    saveAsImageStreetName: false,
    saveAsImageWatermark: true,
    locale: null,
    units: 0
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
      colorMode: 'light',
      lastStreetId: null,
      lastStreetNamespacedId: null,
      lastStreetCreatorId: null,
      newStreetPreference: 1,
      saveAsImageTransparentSky: true,
      saveAsImageSegmentNamesAndWidths: true,
      saveAsImageStreetName: false,
      saveAsImageWatermark: true,
      locale: null,
      units: 0
    })

    // Handle empty objects, and null or undefined values
    expect(settings(initialState, updateSettings({}))).toEqual(initialState)

    expect(settings(initialState, updateSettings(null))).toEqual(initialState)

    expect(settings(initialState, updateSettings())).toEqual(initialState)
  })

  it('should handle setUserUnits()', () => {
    expect(settings(initialState, setUserUnits(1))).toEqual({
      colorMode: 'light',
      lastStreetId: null,
      lastStreetNamespacedId: null,
      lastStreetCreatorId: null,
      newStreetPreference: 1,
      saveAsImageTransparentSky: false,
      saveAsImageSegmentNamesAndWidths: false,
      saveAsImageStreetName: false,
      saveAsImageWatermark: true,
      units: 1,
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
      colorMode: 'light',
      lastStreetId: null,
      lastStreetNamespacedId: null,
      lastStreetCreatorId: null,
      newStreetPreference: 1,
      saveAsImageTransparentSky: false,
      saveAsImageSegmentNamesAndWidths: false,
      saveAsImageStreetName: false,
      saveAsImageWatermark: true,
      units: 0,
      locale: 'fi'
    })
  })
})
