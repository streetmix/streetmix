/* eslint-env jest */
import React from 'react'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import AboutDialog from '../AboutDialog'

jest.mock('../About/credits.json', () =>
  require('../About/__mocks__/credits.json')
)

describe('AboutDialog', () => {
  it('renders snapshot', () => {
    const { asFragment } = renderWithReduxAndIntl(<AboutDialog />)
    expect(asFragment()).toMatchSnapshot()
  })
})
