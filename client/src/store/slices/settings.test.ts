import settings, { updateSettings, setUserUnits } from './settings'
import { changeLocale } from './locale'

describe('settings reducer', () => {
  const initialState = {
    colorMode: 'light' as const,
    lastStreetId: null,
    lastStreetNamespacedId: null,
    lastStreetCreatorId: null,
    newStreetPreference: 1,
    saveAsImageTransparentSky: false,
    saveAsImageSegmentNamesAndWidths: false,
    saveAsImageStreetName: false,
    saveAsImageWatermark: true,
    locale: null,
    units: 0 as const,
  }

  it('should handle updateSettings()', () => {
    expect(
      settings(
        initialState,
        updateSettings({
          saveAsImageTransparentSky: true,
          saveAsImageSegmentNamesAndWidths: true,
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
      units: 0,
    })

    // Handle empty objects
    expect(settings(initialState, updateSettings({}))).toEqual(initialState)
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
      locale: null,
    })
  })

  it('should handle extra reducers', () => {
    expect(
      settings(
        initialState,
        changeLocale.fulfilled({
          locale: 'fi',
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
      locale: 'fi',
    })
  })
})
