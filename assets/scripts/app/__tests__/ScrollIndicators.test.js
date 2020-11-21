/* eslint-env jest */
import React from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithIntl as render } from '../../../../test/helpers/render'
import ScrollIndicators from '../ScrollIndicators'

const baseProps = {
  left: 1,
  right: 3,
  scrollStreet: jest.fn()
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

  it('handles scroll left on click', () => {
    const scrollStreet = jest.fn()
    render(<ScrollIndicators {...baseProps} scrollStreet={scrollStreet} />)

    userEvent.click(screen.getByText('‹'))

    expect(scrollStreet).toBeCalled()
  })

  it('handles scroll right on click', () => {
    const scrollStreet = jest.fn()
    render(<ScrollIndicators {...baseProps} scrollStreet={scrollStreet} />)

    userEvent.click(screen.getByText('›››'))

    expect(scrollStreet).toBeCalled()
  })

  // TODO: figure out how to make keypress tests work
  it.skip('handles scroll left on keypress', () => {
    const scrollStreet = jest.fn()
    render(<ScrollIndicators {...baseProps} scrollStreet={scrollStreet} />)

    userEvent.type('{arrowleft}')

    expect(scrollStreet).toBeCalled()
  })

  it.todo('handles scroll right on keypress')
})
