/* eslint-env jest */
import React from 'react'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import SaveAsImageDialog from '../SaveAsImageDialog'

// Mock dependencies that could break tests
jest.mock('../../streets/image', () => {
  return {
    getStreetImage: () => {}
  }
})

const initialState = {
  locale: {
    locale: 'en'
  },
  settings: {
    saveAsImageTransparentSky: false,
    saveAsImageSegmentNamesAndWidths: false,
    saveAsImageStreetName: false,
    saveAsImageWatermark: true
  },
  street: {
    name: 'foo'
  },
  flags: {
    SAVE_AS_IMAGE_CUSTOM_DPI: { value: false },
    EXPORT_WATERMARK: { value: false }
  }
}

describe('SaveAsImageDialog', () => {
  it('renders snapshot', () => {
    const { asFragment } = renderWithReduxAndIntl(<SaveAsImageDialog />, {
      initialState
    })
    expect(asFragment()).toMatchSnapshot()
  })
})
