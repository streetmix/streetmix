/* eslint-env jest */
import React from 'react'
import { fireEvent, cleanup } from '@testing-library/react'
import { renderWithIntl as render } from '../../../../test/helpers/render'
import ScrollIndicators from '../ScrollIndicators'

const baseProps = {
  scrollIndicatorsLeft: 1,
  scrollIndicatorsRight: 3,
  scrollStreet: jest.fn(),
  scrollTop: 0
}

describe('ScrollIndicators', () => {
  afterEach(cleanup)

  it('renders snapshot', () => {
    const wrapper = render(<ScrollIndicators {...baseProps} />)
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('renders snapshot for zero indicators', () => {
    const wrapper = render(<ScrollIndicators {...baseProps} scrollIndicatorsLeft={0} scrollIndicatorsRight={0} />)
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('handles scroll left on click', () => {
    const scrollStreet = jest.fn()
    const wrapper = render(<ScrollIndicators {...baseProps} scrollStreet={scrollStreet} />)

    fireEvent.click(wrapper.getByText('‹'))

    expect(scrollStreet).toBeCalled()
  })

  it('handles scroll right on click', () => {
    const scrollStreet = jest.fn()
    const wrapper = render(<ScrollIndicators {...baseProps} scrollStreet={scrollStreet} />)

    fireEvent.click(wrapper.getByText('›››'))

    expect(scrollStreet).toBeCalled()
  })

  // TODO: figure out how to make keypress tests work
  it.skip('handles scroll left on keypress', () => {
    const scrollStreet = jest.fn()
    render(<ScrollIndicators {...baseProps} scrollStreet={scrollStreet} />)

    fireEvent.keyDown(window, { key: 'ArrowLeft', code: 37 })

    expect(scrollStreet).toBeCalled()
  })

  it.skip('handles scroll right on keypress', () => {})
})
