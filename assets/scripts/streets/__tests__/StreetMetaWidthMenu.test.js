/* eslint-env jest */
import React from 'react'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithIntl } from '../../../../test/helpers/render'
import StreetMetaWidthMenu from '../StreetMetaWidthMenu'

describe('StreetMetaWidthMenu', () => {
  it('renders (metric units, default width selected)', () => {
    const { asFragment } = renderWithIntl(
      <StreetMetaWidthMenu
        street={{
          units: 0,
          width: 60,
          occupiedWidth: 10
        }}
        onChange={jest.fn()}
      />
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it('renders (metric units, custom width selected)', () => {
    const { asFragment } = renderWithIntl(
      <StreetMetaWidthMenu
        street={{
          units: 0,
          width: 10,
          occupiedWidth: 10
        }}
        onChange={jest.fn()}
      />
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it('renders (imperial units, default width selected)', () => {
    const { asFragment } = renderWithIntl(
      <StreetMetaWidthMenu
        street={{
          units: 1,
          width: 60,
          occupiedWidth: 10
        }}
        onChange={jest.fn()}
      />
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it('calls onChange handler when selection changed', () => {
    const handleChange = jest.fn((value) => value)
    renderWithIntl(
      <StreetMetaWidthMenu
        street={{
          units: 0,
          width: 40,
          occupiedWidth: 10
        }}
        editable={true}
        onChange={handleChange}
      />
    )

    // cant change to user event becuase test relies on firing the change event
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 40 } })

    // Return value is a string from <option value=""> attribute
    expect(handleChange).toHaveReturnedWith('40')
  })
})
