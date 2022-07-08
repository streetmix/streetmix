/* eslint-env jest */
import React from 'react'
import { screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../../../../test/helpers/render'
import NewsletterDialog from '../NewsletterDialog'

describe('NewsletterDialog', () => {
  beforeEach(() => {
    fetch.resetMocks()
    fetch.doMock()
    jest.useFakeTimers()
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

    // Our actions must be wrapped in `act` because of state changes
    act(() => {
      render(<NewsletterDialog />)
      userEvent.type(screen.getByRole('textbox'), 'lou@louhuang.com')
      userEvent.click(screen.getByText('Subscribe'))
      jest.advanceTimersByTime(1)
    })

    await waitFor(() => {
      expect(screen.queryByText('Please wait...')).toBeDisabled()
    })
  })

  it('displays content on success state', async () => {
    render(<NewsletterDialog />)

    userEvent.type(screen.getByRole('textbox'), 'lou@louhuang.com')
    userEvent.click(screen.getByText('Subscribe'))

    await waitFor(() => {
      expect(
        screen.queryByText('Thank you!', { exact: false })
      ).toBeInTheDocument()
      expect(screen.queryByText('Subscribe')).not.toBeInTheDocument()
      expect(screen.queryByText('Close')).toBeInTheDocument()
    })
  })

  it('displays content on error state from subscription endpoint', async () => {
    fetch.mockResponse('', { status: 500 })
    render(<NewsletterDialog />)

    userEvent.type(screen.getByRole('textbox'), 'test@foo.com')
    userEvent.click(screen.getByText('Subscribe'))

    await waitFor(() => {
      expect(
        screen.queryByText('Something went wrong', { exact: false })
      ).toBeInTheDocument()
      expect(screen.queryByText('Subscribe')).toBeInTheDocument()
    })
  })

  it('displays content on error state from client failure', async () => {
    fetch.mockReject(new Error('fake error message'))
    render(<NewsletterDialog />)

    userEvent.type(screen.getByRole('textbox'), 'test@foo.com')
    userEvent.click(screen.getByText('Subscribe'))

    await waitFor(() => {
      expect(
        screen.queryByText('Something went wrong', { exact: false })
      ).toBeInTheDocument()
      expect(screen.queryByText('Subscribe')).toBeInTheDocument()
    })
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })
})
