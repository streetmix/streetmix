/* eslint-env jest */
import React from 'react'
import { fireEvent } from '@testing-library/react'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import IdentityMenu from '../IdentityMenu'
import { showGallery } from '../../gallery/view'
import { onSignOutClick } from '../../users/authentication'

jest.mock('../../gallery/view', () => ({
  showGallery: jest.fn()
}))
jest.mock('../../users/authentication', () => ({
  onSignOutClick: jest.fn()
}))

describe('IdentityMenu', () => {
  it('renders', () => {
    const wrapper = renderWithReduxAndIntl(<IdentityMenu />)
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('shows "My streets" when its link is clicked', () => {
    const wrapper = renderWithReduxAndIntl(<IdentityMenu />)

    fireEvent.click(wrapper.getByText('My streets'))

    expect(showGallery).toBeCalledTimes(1)
  })

  it('signs the user out when its link is clicked', () => {
    const wrapper = renderWithReduxAndIntl(<IdentityMenu />)

    fireEvent.click(wrapper.getByText('Sign out'))

    expect(onSignOutClick).toBeCalledTimes(1)
  })
})
