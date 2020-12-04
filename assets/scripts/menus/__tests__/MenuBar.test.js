/* eslint-env jest */
import React from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import MenuBar from '../MenuBar'
import { showDialog } from '../../store/slices/dialogs'

jest.mock('../../store/slices/dialogs', () => ({
  showDialog: jest.fn((id) => ({ type: 'MOCK_ACTION' }))
}))

describe('MenuBar', () => {
  it('renders', () => {
    const { asFragment } = renderWithReduxAndIntl(
      <MenuBar onMenuDropdownClick={jest.fn()} />
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders minimal menu in offline mode', () => {
    const { asFragment } = renderWithReduxAndIntl(
      <MenuBar onMenuDropdownClick={jest.fn()} />,
      {
        initialState: {
          system: {
            offline: true
          }
        }
      }
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders logged in user', () => {
    const { asFragment } = renderWithReduxAndIntl(
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
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders upgrade funnel and handles click', () => {
    const { asFragment } = renderWithReduxAndIntl(
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
    expect(asFragment()).toMatchSnapshot()
    userEvent.click(screen.getByText('Upgrade'))

    expect(showDialog).toBeCalledTimes(1)
    expect(showDialog).toBeCalledWith('UPGRADE')
  })

  it('handles a menu item click', () => {
    const handler = jest.fn()
    renderWithReduxAndIntl(<MenuBar onMenuDropdownClick={handler} />)

    userEvent.click(screen.getByText('Share'))

    expect(handler).toBeCalledTimes(1)
  })

  it.todo('handles window resize')
})
