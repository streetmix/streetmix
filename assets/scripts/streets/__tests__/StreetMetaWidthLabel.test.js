/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import StreetMetaWidthLabel from '../StreetMetaWidthLabel'

const formatMessage = jest.fn(({ defaultMessage }) => defaultMessage)
const dummyStreetObject = {
  units: 0,
  width: 10,
  occupiedWidth: 10,
  remainingWidth: 0
}

describe('StreetMetaWidthLabel', () => {
  it('renders when editable', () => {
    const wrapper = shallow(
      <StreetMetaWidthLabel
        formatMessage={formatMessage}
        street={dummyStreetObject}
        editable
        onClick={jest.fn()}
      />
    )
    expect(wrapper).toMatchSnapshot()
  })

  it('renders when not editable', () => {
    const wrapper = shallow(
      <StreetMetaWidthLabel
        formatMessage={formatMessage}
        street={dummyStreetObject}
        editable={false}
        onClick={jest.fn()}
      />
    )
    expect(wrapper).toMatchSnapshot()
  })

  it('renders with remaining width', () => {
    const wrapper = shallow(
      <StreetMetaWidthLabel
        formatMessage={formatMessage}
        street={{
          ...dummyStreetObject,
          occupiedWidth: 9,
          remainingWidth: 1
        }}
        editable
        onClick={jest.fn()}
      />
    )
    expect(wrapper).toMatchSnapshot()
  })

  it('renders with over available width', () => {
    const wrapper = shallow(
      <StreetMetaWidthLabel
        formatMessage={formatMessage}
        street={{
          ...dummyStreetObject,
          occupiedWidth: 11,
          remainingWidth: -1
        }}
        editable
        onClick={jest.fn()}
      />
    )
    expect(wrapper).toMatchSnapshot()
  })

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn()
    const wrapper = shallow(
      <StreetMetaWidthLabel
        formatMessage={formatMessage}
        street={dummyStreetObject}
        editable
        onClick={handleClick}
      />
    )

    wrapper.simulate('click')
    expect(handleClick).toBeCalled()
  })
})
