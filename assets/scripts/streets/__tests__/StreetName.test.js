/* eslint-env jest */
import React from 'react'
import { fireEvent } from '@testing-library/react'
import { renderWithIntl } from '../../../../test/helpers/render'
import StreetName from '../StreetName'

describe('StreetName', () => {
  it('renders a name', () => {
    const wrapper = renderWithIntl(<StreetName name="foo" />)
    expect(wrapper.getByText('foo')).toBeInTheDocument()
  })

  it('truncates very long names', () => {
    const wrapper = renderWithIntl(
      <StreetName name="foobarfoobarfoobarfoobarfoobarfoobarfoobarfoobarfoobar" />
    )
    // We don't care what the actual length of string is, just that
    // it's been truncated and ends with ellipses
    expect(wrapper.getByText(/…$/)).toBeInTheDocument()
  })

  it('renders a placeholder if there is no name', () => {
    const wrapper = renderWithIntl(<StreetName />)
    expect(wrapper.getByText('Unnamed St')).toBeInTheDocument()
  })

  it('responds to an onClick handler', () => {
    const handleClick = jest.fn()
    const wrapper = renderWithIntl(<StreetName onClick={handleClick} />)
    fireEvent.click(wrapper.getByText('Unnamed St'))
    expect(handleClick).toBeCalledTimes(1)
  })

  it('shows a "Click to edit" message when mouse is hovering over it', () => {
    const wrapper = renderWithIntl(<StreetName editable />)
    fireEvent.mouseOver(wrapper.getByText('Unnamed St'))
    expect(wrapper.getByText('Click to rename')).toBeInTheDocument()
  })

  it('does not do that if the street name is not editable', () => {
    const wrapper = renderWithIntl(<StreetName editable={false} />)
    fireEvent.mouseOver(wrapper.getByText('Unnamed St'))
    expect(wrapper.queryByText('Click to rename')).not.toBeInTheDocument()
  })
})
