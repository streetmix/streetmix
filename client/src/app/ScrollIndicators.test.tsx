import { vi } from 'vitest'
import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { render } from '~/test/helpers/render.js'
import { ScrollIndicators } from './ScrollIndicators.js'

const baseProps = {
  left: 1,
  right: 3,
  scrollStreet: vi.fn(),
}

describe('ScrollIndicators', () => {
  it('renders snapshot', () => {
    const { asFragment } = render(<ScrollIndicators {...baseProps} />)
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders snapshot for zero indicators', () => {
    const { asFragment } = render(
      <ScrollIndicators {...baseProps} left={0} right={0} />
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('handles scroll left on click', async () => {
    const scrollStreet = vi.fn()
    render(<ScrollIndicators {...baseProps} scrollStreet={scrollStreet} />)

    await userEvent.click(screen.getByText('‹'))

    expect(scrollStreet).toBeCalled()
  })

  it('handles scroll right on click', async () => {
    const scrollStreet = vi.fn()
    render(<ScrollIndicators {...baseProps} scrollStreet={scrollStreet} />)

    await userEvent.click(screen.getByText('›››'))

    expect(scrollStreet).toBeCalled()
  })

  // TODO: figure out how to make keypress tests work
  it.skip('handles scroll left on keypress', async () => {
    const scrollStreet = vi.fn()
    render(<ScrollIndicators {...baseProps} scrollStreet={scrollStreet} />)

    await userEvent.keyboard('{arrowleft}')

    expect(scrollStreet).toBeCalled()
  })

  it.todo('handles scroll right on keypress')
})
