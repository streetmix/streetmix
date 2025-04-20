import React from 'react'
import { vi } from 'vitest'
import { within } from '@testing-library/dom'
import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { render } from '~/test/helpers/render'
import { updateUnits } from '~/src/users/localization'
import StreetMetaWidth from './StreetMetaWidth'

vi.mock('~/src/users/localization', () => ({
  updateUnits: vi.fn()
}))

const dummyStreetObject = {
  units: 0,
  width: 10,
  occupiedWidth: 10,
  remainingWidth: 0
}

describe('StreetMetaWidth', () => {
  it('renders', () => {
    const { asFragment } = render(<StreetMetaWidth />)
    expect(asFragment()).toMatchSnapshot()
  })

  it('does not render interactive elements when not editable', async () => {
    const { asFragment } = render(<StreetMetaWidth />, {
      initialState: {
        app: {
          readOnly: true
        }
      }
    })

    expect(screen.queryByRole('button')).toBe(null)
    expect(asFragment()).toMatchSnapshot()
  })

  it('updates units', async () => {
    render(<StreetMetaWidth />)

    // Click the "Change street width" button
    await userEvent.click(screen.getByRole('button'))

    // Wait for dropdown, then change value from dropdown
    await userEvent.click(screen.getByText('U.S. customary / imperial'))

    // The change is made
    expect(updateUnits).toBeCalledWith(1)
  })

  it('renders label with remaining width', () => {
    render(<StreetMetaWidth />, {
      initialState: {
        street: {
          ...dummyStreetObject,
          occupiedWidth: 9,
          remainingWidth: 1
        }
      }
    })

    expect(screen.getByText('1 m room', { exact: false })).toBeInTheDocument()
  })

  it('renders label with over available width', () => {
    render(<StreetMetaWidth />, {
      initialState: {
        street: {
          ...dummyStreetObject,
          occupiedWidth: 11,
          remainingWidth: -1
        }
      }
    })

    expect(screen.getByText('1 m over', { exact: false })).toBeInTheDocument()
  })

  it('renders menu (metric units, default width selected)', async () => {
    render(<StreetMetaWidth />, {
      initialState: {
        street: {
          ...dummyStreetObject,
          width: 18,
          occupiedWidth: 3
        }
      }
    })

    await userEvent.click(screen.getByText('18 m width'))

    expect(
      within(document.querySelector('[aria-checked="true"]')).getByText('18 m')
    ).toBeInTheDocument()
  })

  it('renders menu (metric units, custom width selected)', async () => {
    render(<StreetMetaWidth />, {
      initialState: {
        street: {
          ...dummyStreetObject,
          width: 3,
          occupiedWidth: 3
        }
      }
    })

    await userEvent.click(screen.getByText('3 m width'))

    expect(
      within(document.querySelector('[aria-checked="true"]')).getByText('3 m')
    ).toBeInTheDocument()
  })

  it('renders menu (imperial units, default width selected)', async () => {
    render(<StreetMetaWidth />, {
      initialState: {
        street: {
          ...dummyStreetObject,
          units: 1,
          width: 18.288,
          occupiedWidth: 3.048
        }
      }
    })

    await userEvent.click(screen.getByText('60′ width'))

    expect(
      within(document.querySelector('[aria-checked="true"]')).getByText('60′')
    ).toBeInTheDocument()
  })
})
