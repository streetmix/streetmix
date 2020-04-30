/* eslint-env jest */
import settings, { updateSettings } from './settings'

describe('settings reducer', () => {
  const initialState = {
    lastStreetId: null,
    lastStreetNamespacedId: null,
    lastStreetCreatorId: null,
    newStreetPreference: 1,
    saveAsImageTransparentSky: false,
    saveAsImageSegmentNamesAndWidths: false,
    saveAsImageStreetName: false,
    saveAsImageWatermark: true
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
      saveAsImageWatermark: true
    })

    // Handle empty objects, and null or undefined values
    expect(settings(initialState, updateSettings({}))).toEqual(initialState)

    expect(settings(initialState, updateSettings(null))).toEqual(initialState)

    expect(settings(initialState, updateSettings())).toEqual(initialState)
  })
})
