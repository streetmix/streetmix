/* eslint-env jest */
import React from 'react'
import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { render } from '../../../../test/helpers/render'
import { updateStreetWidthAction as updateStreetWidth } from '../../store/actions/street'
import { updateUnits } from '../../users/localization'
import StreetMetaWidthContainer from './StreetMetaWidthContainer'

jest.mock('../../store/actions/street', () => ({
  updateStreetWidthAction: jest.fn(() => ({ type: 'MOCK_ACTION' }))
}))
jest.mock('../../users/localization', () => ({
  updateUnits: jest.fn()
}))

describe('StreetMetaWidthContainer', () => {
  it('renders', () => {
    const { asFragment } = render(<StreetMetaWidthContainer />)
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders selection dropdown on click', async () => {
    const { asFragment } = render(<StreetMetaWidthContainer />)
    await userEvent.click(screen.getByText('0 m width'))
    expect(asFragment()).toMatchSnapshot()
  })

  it('updates street label on selection change', async () => {
    render(<StreetMetaWidthContainer />)

    // Click the "Change street width" button
    await userEvent.click(screen.getByRole('button'))

    // Change value from dropdown
    await userEvent.selectOptions(screen.getByRole('combobox'), '12')

    // The change is made
    expect(updateStreetWidth).toBeCalledWith(12)

    // Finally, render returns to label again (and not select dropdown)
    expect(screen.queryByRole('combobox')).toBe(null)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('does not render selection dropdown on click when not editable', async () => {
    render(<StreetMetaWidthContainer />, {
      initialState: {
        app: {
          readOnly: true
        }
      }
    })
    await userEvent.click(screen.getByText('width', { exact: false }))

    expect(screen.queryByRole('combobox')).toBe(null)
    expect(screen.getByText('width', { exact: false })).not.toBe(null)
  })

  it('updates units', async () => {
    render(<StreetMetaWidthContainer />)

    // Click the "Change street width" button
    await userEvent.click(screen.getByRole('button'))

    // Change value from dropdown
    await userEvent.selectOptions(
      screen.getByRole('combobox'),
      'Switch to imperial units (feet)'
    )

    // The change is made
    expect(updateUnits).toBeCalledWith(1)
  })
})
