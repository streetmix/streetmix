import React from 'react'
import { vi } from 'vitest'
import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { render } from '../../../../test/helpers/render'
import StreetMetaWidthLabel from './StreetMetaWidthLabel'

const dummyStreetObject = {
  units: 0,
  width: 10,
  occupiedWidth: 10,
  remainingWidth: 0
}

describe('StreetMetaWidthLabel', () => {
  it('renders when editable', () => {
    const { asFragment } = render(
      <StreetMetaWidthLabel
        street={dummyStreetObject}
        editable={true}
        onClick={vi.fn()}
      />
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it('renders when not editable', () => {
    const { asFragment } = render(
      <StreetMetaWidthLabel
        street={dummyStreetObject}
        editable={false}
        onClick={vi.fn()}
      />
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it('renders with remaining width', () => {
    const { asFragment } = render(
      <StreetMetaWidthLabel
        street={{
          ...dummyStreetObject,
          occupiedWidth: 9,
          remainingWidth: 1
        }}
        editable={true}
        onClick={vi.fn()}
      />
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it('renders with over available width', () => {
    const { asFragment } = render(
      <StreetMetaWidthLabel
        street={{
          ...dummyStreetObject,
          occupiedWidth: 11,
          remainingWidth: -1
        }}
        editable={true}
        onClick={vi.fn()}
      />
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it('calls onClick handler when clicked', async () => {
    const handleClick = vi.fn()
    render(
      <StreetMetaWidthLabel
        street={dummyStreetObject}
        editable={true}
        onClick={handleClick}
      />
    )

    await userEvent.click(screen.getByText('10 m width'))
    expect(handleClick).toBeCalled()
  })
})
