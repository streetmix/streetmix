import React from 'react'
import { vi } from 'vitest'

import { render } from '~/test/helpers/render'
import SaveAsImageDialog from './SaveAsImageDialog'

// Mock dependencies that could break tests
vi.mock('../../streets/image', () => {
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
  user: {
    isSubscriber: false
  },
  flags: {
    SAVE_AS_IMAGE_CUSTOM_DPI: { value: false }
  }
}

describe('SaveAsImageDialog', () => {
  it('renders snapshot', () => {
    const { asFragment } = render(<SaveAsImageDialog />, {
      initialState
    })
    expect(asFragment()).toMatchSnapshot()
  })
})
