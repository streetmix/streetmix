/* eslint-env jest */
import React from 'react'
import { fireEvent } from '@testing-library/react'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import MenuBar from '../MenuBar'
import { showDialog } from '../../store/slices/dialogs'

jest.mock('../../store/slices/dialogs', () => ({
  showDialog: jest.fn((id) => ({ type: 'MOCK_ACTION' }))
}))

describe('MenuBar', () => {
  it('renders', () => {
    const wrapper = renderWithReduxAndIntl(
      <MenuBar onMenuDropdownClick={jest.fn()} />
    )
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('renders minimal menu in offline mode', () => {
    const wrapper = renderWithReduxAndIntl(
      <MenuBar onMenuDropdownClick={jest.fn()} />,
      {
        initialState: {
          system: {
            noInternet: true
          }
        }
      }
    )
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('renders logged in user', () => {
    const wrapper = renderWithReduxAndIntl(
      <MenuBar onMenuDropdownClick={jest.fn()} />,
      {
        initialState: {
          user: {
            signInData: {
              details: {
                id: 'foo',
                roles: ['USER']
              }
            }
          }
        }
      }
    )
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('renders upgrade funnel and handles click', () => {
    const wrapper = renderWithReduxAndIntl(
      <MenuBar onMenuDropdownClick={jest.fn()} />,
      {
        initialState: {
          flags: {
            BUSINESS_PLAN: {
              value: true
            }
          }
        }
      }
    )

    fireEvent.click(wrapper.getByText('Upgrade'))

    expect(showDialog).toBeCalledTimes(1)
    expect(showDialog).toBeCalledWith('UPGRADE')
  })

  it('handles a menu item click', () => {
    const handler = jest.fn()
    const wrapper = renderWithReduxAndIntl(
      <MenuBar onMenuDropdownClick={handler} />
    )

    fireEvent.click(wrapper.getByText('Share'))

    expect(handler).toBeCalledTimes(1)
  })

  it.todo('handles window resize')
})
