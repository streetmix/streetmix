import { expect, jest } from '@jest/globals'
import React from 'react'
import { render } from '../../../../test/helpers/render'
import SkyContainer from './SkyContainer'

jest.mock('../environ-defs.json', () => require('../__mocks__/environs.json'))

// Mock the `images` object.
// Note: in real life, this is a Map where the .get()
// method looks up an object value by the `id` key.
// The `src` property is normally a data-url.
jest.mock('../../app/load_resources', () => ({
  images: {
    get: (id: string) => ({
      src: 'bar.svg'
    })
  }
}))

describe('SkyContainer', () => {
  it('renders', () => {
    const { asFragment } = render(<SkyContainer scrollPos={0} />, {
      initialState: { street: { environment: 'foo' } }
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders with objects', () => {
    const { asFragment } = render(<SkyContainer scrollPos={0} />, {
      initialState: { street: { environment: 'bar' } }
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders background animations', () => {
    const { container } = render(<SkyContainer scrollPos={0} />, {
      initialState: {
        street: { environment: 'bar' },
        flags: {
          ENVIRONMENT_ANIMATIONS: { value: true }
        }
      }
    })
    expect(
      container
        .querySelector('section')
        .className.includes('environment-animations')
    ).toEqual(true)
  })
})
