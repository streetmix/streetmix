import React from 'react'
import { vi } from 'vitest'
import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { render } from '~/test/helpers/render'
import FloatingPanel from './FloatingPanel'

describe('FloatingPanel', () => {
  const props = {
    icon: 'sun' as const,
    title: 'foo',
    show: true,
    className: 'cx',
    handleClose: vi.fn(),
    children: <span>bar</span>,
  }

  it('calls handleClose when close button is clicked', async () => {
    render(<FloatingPanel {...props} />)

    await userEvent.click(screen.getByTitle('Dismiss'))

    expect(props.handleClose).toBeCalled()
  })
})
