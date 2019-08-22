/* eslint-env jest */
import React from 'react'
import { cleanup } from '@testing-library/react'
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
  afterEach(cleanup)

  it('renders snapshot', () => {
    const wrapper = renderWithReduxAndIntl(<SaveAsImageDialog />, { initialState })
    expect(wrapper.asFragment()).toMatchSnapshot()
  })
})
