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

  // Editable state is tested at the StreetNameplateContainer component level.
  // However, we do include a test here to ensure that StreetName is never
  // editable by default.
  it('is not editable by default', () => {
    const wrapper = renderWithIntl(<StreetName editable={false} />)
    fireEvent.mouseOver(wrapper.getByText('Unnamed St'))
    expect(wrapper.queryByText('Click to rename')).not.toBeInTheDocument()
  })
})
