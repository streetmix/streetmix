/* eslint-env jest */
import React from 'react'
import { render } from '../../../../test/helpers/render'
import AboutDialog from '../AboutDialog'

jest.mock('../About/credits.json', () =>
  require('../About/__mocks__/credits.json')
)

describe('AboutDialog', () => {
  it('renders snapshot', () => {
    const { asFragment } = render(<AboutDialog />)
    expect(asFragment()).toMatchSnapshot()
  })
})
