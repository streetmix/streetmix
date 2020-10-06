/* eslint-env jest */
import React from 'react'
import SkyContainer from '../SkyContainer'
import { renderWithRedux } from '../../../../test/helpers/render'

jest.mock('../../streets/environs.json', () =>
  require('../../streets/__mocks__/environs.json')
)

// Mock the `images` object.
// Note: in real life, this is a Map where the .get()
// method looks up an object value by the `id` key.
// The `src` property is normally a data-url.
jest.mock('../../app/load_resources', () => ({
  images: {
    get: (id) => ({
      src: 'bar.svg'
    })
  }
}))

describe('SkyContainer', () => {
  it('renders', () => {
    const { asFragment } = renderWithRedux(
      <SkyContainer scrollPos={0} height={100} />,
      {
        initialState: { street: { environment: 'foo' } }
      }
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders with objects', () => {
    const { asFragment } = renderWithRedux(
      <SkyContainer scrollPos={0} height={100} />,
      {
        initialState: { street: { environment: 'bar' } }
      }
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders background animations', () => {
    const { container } = renderWithRedux(
      <SkyContainer scrollPos={0} height={100} />,
      {
        initialState: {
          street: { environment: 'bar' },
          flags: {
            ENVIRONMENT_ANIMATIONS: { value: true }
          }
        }
      }
    )
    expect(
      container
        .querySelector('section')
        .className.includes('environment-animations')
    ).toEqual(true)
  })
})
