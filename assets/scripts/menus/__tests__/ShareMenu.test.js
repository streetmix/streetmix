/* eslint-env jest */
import React from 'react'
import { cleanup } from '@testing-library/react'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import ShareMenu from '../ShareMenu'

describe('ShareMenu', () => {
  afterEach(cleanup)

  it('renders (user not signed in)', () => {
    const wrapper = renderWithReduxAndIntl(<ShareMenu />, { initialState: { user: { signedIn: false } } })
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('renders (user signed in)', () => {
    const wrapper = renderWithReduxAndIntl(<ShareMenu />, { initialState: { user: { signedIn: true } } })
    expect(wrapper.asFragment()).toMatchSnapshot()
  })
})
