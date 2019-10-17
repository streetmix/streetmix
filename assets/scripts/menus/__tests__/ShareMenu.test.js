/* eslint-env jest */
import React from 'react'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import ShareMenu from '../ShareMenu'

describe('ShareMenu', () => {
  it('renders (user not signed in)', () => {
    const wrapper = renderWithReduxAndIntl(<ShareMenu />, {
      initialState: { user: { signedIn: false, copied: false } }
    })
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('renders (user signed in)', () => {
    const wrapper = renderWithReduxAndIntl(<ShareMenu />, {
      initialState: { user: { signedIn: true, copied: false } }
    })
    expect(wrapper.asFragment()).toMatchSnapshot()
  })
})
