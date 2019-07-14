/* eslint-env jest */
import React from 'react'
import { cleanup } from '@testing-library/react'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import AboutDialog from '../AboutDialog'

jest.mock('../About/credits.json', () => require('../About/__mocks__/credits.json'))

describe('AboutDialog', () => {
  afterEach(cleanup)

  it('renders snapshot', () => {
    const wrapper = renderWithReduxAndIntl(<AboutDialog />)
    expect(wrapper.asFragment()).toMatchSnapshot()
  })
})
