/* eslint-env jest */
import React from 'react'
import { fireEvent } from '@testing-library/react'
import { renderWithIntl } from '../../../../test/helpers/render'
import StreetMetaWidthLabel from '../StreetMetaWidthLabel'

const dummyStreetObject = {
  units: 0,
  width: 10,
  occupiedWidth: 10,
  remainingWidth: 0
}

describe('StreetMetaWidthLabel', () => {
  it('renders when editable', () => {
    const wrapper = renderWithIntl(
      <StreetMetaWidthLabel
        street={dummyStreetObject}
        editable
        onClick={jest.fn()}
      />
    )

    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('renders when not editable', () => {
    const wrapper = renderWithIntl(
      <StreetMetaWidthLabel
        street={dummyStreetObject}
        editable={false}
        onClick={jest.fn()}
      />
    )

    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('renders with remaining width', () => {
    const wrapper = renderWithIntl(
      <StreetMetaWidthLabel
        street={{
          ...dummyStreetObject,
          occupiedWidth: 9,
          remainingWidth: 1
        }}
        editable
        onClick={jest.fn()}
      />
    )

    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('renders with over available width', () => {
    const wrapper = renderWithIntl(
      <StreetMetaWidthLabel
        street={{
          ...dummyStreetObject,
          occupiedWidth: 11,
          remainingWidth: -1
        }}
        editable
        onClick={jest.fn()}
      />
    )

    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn()
    const wrapper = renderWithIntl(
      <StreetMetaWidthLabel
        street={dummyStreetObject}
        editable
        onClick={handleClick}
      />
    )

    fireEvent.click(wrapper.getByTitle('Change width of the street'))
    expect(handleClick).toBeCalled()
  })
})
