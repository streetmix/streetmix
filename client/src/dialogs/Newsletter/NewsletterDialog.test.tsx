import { screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { render } from '~/test/helpers/render.js'
import { NewsletterDialog } from './NewsletterDialog.js'

describe('NewsletterDialog', () => {
  it('renders snapshot', () => {
    const { asFragment } = render(<NewsletterDialog />)
    expect(asFragment()).toMatchSnapshot()
  })

  it('disables a submit button while pending subscription', async () => {
    const user = userEvent.setup()

    render(<NewsletterDialog />)

    const input = screen.getByRole('textbox')
    await user.click(input)
    await user.keyboard('test_pending@example.com')

    expect(screen.getByRole('textbox')).toHaveValue('test_pending@example.com')

    await user.click(screen.getByText('Subscribe'))

    // Wait for changes to DOM
    // `waitFor` isn't always required, but this test is fails without it in
    // CI, so it seems best to leave in place
    waitFor(() => {
      expect(screen.queryByText('Please wait...')).toBeDisabled()
    })
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
    const user = userEvent.setup()

    render(<NewsletterDialog />)

    await user.type(screen.getByRole('textbox'), 'error_500@foo.com')
    await user.click(screen.getByText('Subscribe'))

    expect(
      screen.queryByText('Something went wrong', { exact: false })
    ).toBeInTheDocument()
    expect(screen.queryByText('Subscribe')).toBeInTheDocument()
  })

  it('displays content on error state from client failure', async () => {
    const user = userEvent.setup()

    render(<NewsletterDialog />)

    await user.type(screen.getByRole('textbox'), 'error_client@foo.com')
    await user.click(screen.getByText('Subscribe'))

    expect(
      screen.queryByText('Something went wrong', { exact: false })
    ).toBeInTheDocument()
    expect(screen.queryByText('Subscribe')).toBeInTheDocument()
  })
})
