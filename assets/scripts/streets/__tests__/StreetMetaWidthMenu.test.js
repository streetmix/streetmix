/* eslint-env jest */
import React from 'react'
import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { render } from '../../../../test/helpers/render'
import StreetMetaWidthMenu from '../StreetMetaWidthMenu'

describe('StreetMetaWidthMenu', () => {
  it('renders (metric units, default width selected)', () => {
    const { asFragment } = render(
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
    const { asFragment } = render(
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
    const { asFragment } = render(
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

  it('calls onChange handler when selection changed', async () => {
    const handleChange = jest.fn((value) => value)
    const user = userEvent.setup()

    render(
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

    await user.selectOptions(screen.getByRole('combobox'), '40')

    // Return value is a string from <option value=""> attribute
    expect(handleChange).toHaveReturnedWith('40')
  })
})
