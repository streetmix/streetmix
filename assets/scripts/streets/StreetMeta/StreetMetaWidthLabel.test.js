/* eslint-env jest */
import React from 'react'
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
        onClick={jest.fn()}
      />
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it('renders when not editable', () => {
    const { asFragment } = render(
      <StreetMetaWidthLabel
        street={dummyStreetObject}
        editable={false}
        onClick={jest.fn()}
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
        onClick={jest.fn()}
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
        onClick={jest.fn()}
      />
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it('calls onClick handler when clicked', async () => {
    const handleClick = jest.fn()
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
