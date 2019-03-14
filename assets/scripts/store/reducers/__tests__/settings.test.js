/* eslint-env jest */
import reducer from '../settings'
import * as actions from '../../actions/settings'

jest.mock('../../../users/settings', () => {
  return {
    saveSettingsLocally: () => {}
  }
})

describe('settings reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual({
      lastStreetId: null,
      lastStreetNamespacedId: null,
      lastStreetCreatorId: null,
      priorLastStreetId: null,
      newStreetPreference: 1,
      saveAsImageTransparentSky: false,
      saveAsImageSegmentNamesAndWidths: false,
<<<<<<< HEAD
      saveAsImageStreetName: false
=======
      saveAsImageStreetName: false,
      saveAsImageWatermark: true
>>>>>>> 796b4612... thumbnail: update tests
    })
  })

  it('should combine new settings with previous settings', () => {
    expect(reducer(undefined, actions.updateSettings({
      saveAsImageTransparentSky: true,
      saveAsImageSegmentNamesAndWidths: true
    }))).toEqual({
      lastStreetId: null,
      lastStreetNamespacedId: null,
      lastStreetCreatorId: null,
      priorLastStreetId: null,
      newStreetPreference: 1,
      saveAsImageTransparentSky: true,
      saveAsImageSegmentNamesAndWidths: true,
<<<<<<< HEAD
      saveAsImageStreetName: false
=======
      saveAsImageStreetName: false,
      saveAsImageWatermark: true
>>>>>>> 796b4612... thumbnail: update tests
    })
  })
})
