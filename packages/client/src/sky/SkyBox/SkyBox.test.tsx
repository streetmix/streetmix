import React from 'react'
import { vi } from 'vitest'
import { render } from '../../test/helpers/render'
import SkyBox from './SkyBox'

vi.mock('../skybox-defs.json', () => ({
  default: require('../__mocks__/skybox-defs.json')
}))

// Mock the `images` object.
// Note: in real life, this is a Map where the .get()
// method looks up an object value by the `id` key.
// The `src` property is normally a data-url.
vi.mock('../../app/load_resources', () => ({
  images: {
    get: (id: string) => ({
      src: 'bar.svg'
    })
  }
}))

describe('SkyBox', () => {
  it('renders', () => {
    const { asFragment } = render(<SkyBox scrollPos={0} />, {
      initialState: { street: { skybox: 'foo' } }
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders with objects', () => {
    const { asFragment } = render(<SkyBox scrollPos={0} />, {
      initialState: { street: { skybox: 'bar' } }
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders background animations', () => {
    const { container } = render(<SkyBox scrollPos={0} />, {
      initialState: {
        street: { skybox: 'bar' },
        flags: {
          SKY_ANIMATED_CLOUDS: { value: true }
        }
      }
    })
    expect(
      container.querySelector('section')?.className.includes('sky-animations')
    ).toEqual(true)
  })
})
