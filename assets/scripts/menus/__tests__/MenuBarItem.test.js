/* eslint-env jest */
import React from 'react'
import { fireEvent } from '@testing-library/react'
import { renderWithIntl } from '../../../../test/helpers/render'
import MenuBarItem from '../MenuBarItem'

describe('MenuBarItem', () => {
  it('renders', () => {
    const wrapper = renderWithIntl(
      <MenuBarItem label="foo" translation="foo" />
    )

    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('handles the click on a button', () => {
    const handleClick = jest.fn()
    const wrapper = renderWithIntl(
      <MenuBarItem onClick={handleClick}>label</MenuBarItem>
    )

    fireEvent.click(wrapper.getByRole('button'))

    expect(handleClick).toBeCalled()
  })

  it('handles the click on a link', () => {
    const handleClick = jest.fn()
    const wrapper = renderWithIntl(
      <MenuBarItem url="#" onClick={handleClick}>
        label
      </MenuBarItem>
    )

    // Expect an anchor tag element to be present, then click it
    fireEvent.click(wrapper.getByRole('link'))

    expect(handleClick).toBeCalled()
  })

  it('renders children instead of default label if provided', () => {
    const wrapper = renderWithIntl(
      <MenuBarItem>
        <span data-testid="foo">bar</span>
      </MenuBarItem>
    )

    expect(wrapper.getByTestId('foo')).toHaveTextContent('bar')
    expect(wrapper.getByText('bar')).toBeInTheDocument()
  })

  it('passes unhandled props to child elements', () => {
    const wrapper = renderWithIntl(<MenuBarItem foo="bar">child</MenuBarItem>)

    expect(wrapper.getByText('child')).toHaveAttribute('foo', 'bar')
  })
})
