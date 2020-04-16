/* eslint-env jest */
import React from 'react'
import { fireEvent } from '@testing-library/react'
import { renderWithIntl } from '../../../../test/helpers/render'
import StreetMetaWidthMenu from '../StreetMetaWidthMenu'

describe('StreetMetaWidthMenu', () => {
  it('renders (metric units, default width selected)', () => {
    const wrapper = renderWithIntl(
      <StreetMetaWidthMenu
        street={{
          units: 0,
          width: 60,
          occupiedWidth: 10
        }}
        onChange={jest.fn()}
      />
    )

    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('renders (metric units, custom width selected)', () => {
    const wrapper = renderWithIntl(
      <StreetMetaWidthMenu
        street={{
          units: 0,
          width: 10,
          occupiedWidth: 10
        }}
        onChange={jest.fn()}
      />
    )

    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('renders (imperial units, default width selected)', () => {
    const wrapper = renderWithIntl(
      <StreetMetaWidthMenu
        street={{
          units: 1,
          width: 60,
          occupiedWidth: 10
        }}
        onChange={jest.fn()}
      />
    )

    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('calls onChange handler when selection changed', () => {
    const handleChange = jest.fn((value) => value)
    const wrapper = renderWithIntl(
      <StreetMetaWidthMenu
        street={{
          units: 0,
          width: 40,
          occupiedWidth: 10
        }}
        editable
        onChange={handleChange}
      />
    )

    fireEvent.change(wrapper.getByRole('combobox'), { target: { value: 40 } })

    // Return value is a string from <option value=""> attribute
    expect(handleChange).toHaveReturnedWith('40')
  })
})
