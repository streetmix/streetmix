/* eslint-env jest */
import React from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../../../../test/helpers/render'
import NewsletterDialog from '../NewsletterDialog'

describe('NewsletterDialog', () => {
  beforeEach(() => {
    fetch.resetMocks()
    fetch.doMock()
  })

  it('renders snapshot', () => {
    const { asFragment } = render(<NewsletterDialog />)
    expect(asFragment()).toMatchSnapshot()
  })

  it('disables a submit button while pending subscription', async () => {
    // Mock the response to have a delay so we can test the pending state
    fetch.mockResponse(
      () =>
        new Promise((resolve) => setTimeout(() => resolve({ status: 200 }), 2))
    )
    const user = userEvent.setup()

    render(<NewsletterDialog />)

    const input = screen.getByRole('textbox')
    await user.click(input)
    await user.keyboard('test@example.com')

    expect(screen.getByRole('textbox')).toHaveValue('test@example.com')

    await user.click(screen.getByText('Subscribe'))

    expect(screen.queryByText('Please wait...')).toBeDisabled()
  })

  it('displays content on success state', async () => {
    const user = userEvent.setup()

    render(<NewsletterDialog />)

    await user.type(screen.getByRole('textbox'), 'test@example.com')
    await user.click(screen.getByText('Subscribe'))

    expect(
      screen.queryByText('Thank you!', { exact: false })
    ).toBeInTheDocument()
    expect(screen.queryByText('Subscribe')).not.toBeInTheDocument()
    expect(screen.queryByText('Close')).toBeInTheDocument()
  })

  it('displays content on error state from subscription endpoint', async () => {
    fetch.mockResponse('', { status: 500 })
    const user = userEvent.setup()

    render(<NewsletterDialog />)

    await user.type(screen.getByRole('textbox'), 'test@foo.com')
    await user.click(screen.getByText('Subscribe'))

    expect(
      screen.queryByText('Something went wrong', { exact: false })
    ).toBeInTheDocument()
    expect(screen.queryByText('Subscribe')).toBeInTheDocument()
  })

  it('displays content on error state from client failure', async () => {
    fetch.mockReject(new Error('fake error message'))
    const user = userEvent.setup()

    render(<NewsletterDialog />)

    await user.type(screen.getByRole('textbox'), 'test@foo.com')
    await user.click(screen.getByText('Subscribe'))

    expect(
      screen.queryByText('Something went wrong', { exact: false })
    ).toBeInTheDocument()
    expect(screen.queryByText('Subscribe')).toBeInTheDocument()
  })
})
