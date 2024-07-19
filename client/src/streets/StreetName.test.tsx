import React from 'react'
import { vi } from 'vitest'
import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { render } from '~/test/helpers/render'
import StreetName from './StreetName'

describe('StreetName', () => {
  it('renders a name', () => {
    const { asFragment } = render(<StreetName name="foo" />)
    expect(asFragment()).toMatchSnapshot()
    expect(screen.getByText('foo')).toBeInTheDocument()
  })

  it('truncates very long names', () => {
    render(
      <StreetName name="foobarfoobarfoobarfoobarfoobarfoobarfoobarfoobarfoobar" />
    )
    // We don't care what the actual length of string is, just that
    // it's been truncated and ends with ellipses

    expect(screen.getByText(/…$/)).toBeInTheDocument()
  })

  it('renders a placeholder if there is no name', () => {
    render(<StreetName name={null} />)
    expect(screen.getByText('Unnamed St')).toBeInTheDocument()
  })

  it('responds to an onClick handler', async () => {
    const handleClick = vi.fn()
    render(<StreetName name="foo" onClick={handleClick} />)

    await userEvent.click(screen.getByText('foo'))
    expect(handleClick).toBeCalledTimes(1)
  })

  // Editable state is tested at the StreetNameplateContainer component level.
  // However, we do include a test here to ensure that StreetName is never
  // editable by default.
  it('is not editable by default', async () => {
    render(<StreetName name="foo" editable={false} />)

    await userEvent.hover(screen.getByText('foo'))
    expect(screen.queryByText('Click to rename')).not.toBeInTheDocument()
  })
})
