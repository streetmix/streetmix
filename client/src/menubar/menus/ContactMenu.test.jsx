import React from 'react'
import { vi } from 'vitest'
import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { render } from '~/test/helpers/render'
import { showDialog } from '~/src/store/slices/dialogs'
import ContactMenu from './ContactMenu'

vi.mock('../../store/slices/dialogs', () => ({
  default: {},
  showDialog: vi.fn(() => ({ type: 'MOCK_ACTION' }))
}))

describe('ContactMenu', () => {
  it('renders', () => {
    const { asFragment } = render(<ContactMenu isActive={true} />)
    expect(asFragment()).toMatchSnapshot()
  })

  it('handles clicked menu items', async () => {
    render(<ContactMenu isActive={true} />)

    await userEvent.click(screen.getByText('Discord', { exact: false }))
    await userEvent.click(screen.getByText('GitHub', { exact: false }))
    await userEvent.click(screen.getByText('newsletter', { exact: false }))

    expect(showDialog).toBeCalledTimes(1)
  })
})
