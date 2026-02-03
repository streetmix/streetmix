import { vi } from 'vitest'
import { screen } from '@testing-library/react'

import { render } from '~/test/helpers/render.js'
import { SaveAsImageDialog } from './SaveAsImageDialog.js'

// Mock dependencies that could break tests
vi.mock('../../streets/image', () => {
  return {
    getStreetImage: () => {},
  }
})

const initialState = {
  locale: {
    locale: 'en',
  },
  settings: {
    saveAsImageTransparentSky: false,
    saveAsImageSegmentNamesAndWidths: false,
    saveAsImageStreetName: false,
    saveAsImageWatermark: true,
  },
  street: {
    name: 'foo',
    weather: null,
  },
  user: {
    isSubscriber: false,
  },
  flags: {
    SAVE_AS_IMAGE_CUSTOM_DPI: { value: false },
    SAVE_AS_IMAGE_NEW_EXPORT_PIPELINE: { value: false },
  },
}

describe('SaveAsImageDialog', () => {
  it('renders snapshot', () => {
    const { asFragment } = render(<SaveAsImageDialog />, {
      initialState,
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders weather effect warning', () => {
    const testState = {
      ...initialState,
      street: {
        name: 'foo',
        weather: 'rain',
      },
    }

    render(<SaveAsImageDialog />, {
      initialState: testState,
    })

    expect(
      screen.getByText('Weather effects will not be exported', { exact: false })
    ).toBeInTheDocument()
  })
})
