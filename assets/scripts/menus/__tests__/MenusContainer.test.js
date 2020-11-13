/* eslint-env jest */
import React from 'react'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import MenusContainer from '../MenusContainer'

describe('MenusContainer', () => {
  it('renders', () => {
    const { asFragment } = renderWithReduxAndIntl(<MenusContainer />)
    expect(asFragment()).toMatchSnapshot()
  })
})
