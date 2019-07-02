/* eslint-env jest */
import React from 'react'
import { shallowWithIntl as shallow } from '../../../../test/helpers/intl-enzyme-test-helper.js'
import { StreetMetaWidthContainerWithIntl as StreetMetaWidthContainer } from '../StreetMetaWidthContainer'

describe('StreetMetaWidthContainer', () => {
  it('renders', () => {
    const wrapper = shallow(
      <StreetMetaWidthContainer street={{}} updateStreetWidth={jest.fn()} />
    )
    expect(wrapper.exists('StreetMetaWidthLabel'))
  })

  it('renders selection dropdown on click', () => {
    const wrapper = shallow(
      <StreetMetaWidthContainer street={{}} updateStreetWidth={jest.fn()} />
    )
    wrapper.instance().handleClickLabel()
    expect(wrapper.exists('StreetMetaWidthMenu'))
  })

  it('updates street label on selection change', () => {
    const updateStreetWidth = jest.fn()
    const changeValue = 10
    const wrapper = shallow(
      <StreetMetaWidthContainer street={{}} updateStreetWidth={updateStreetWidth} />
    )
    wrapper.instance().handleClickLabel()
    expect(wrapper.exists('StreetMetaWidthMenu'))
    wrapper.instance().handleChangeMenuSelection(changeValue)
    expect(updateStreetWidth).toBeCalledWith(changeValue)

    // Expect render to be label again
    expect(wrapper.exists('StreetMetaWidthLabel'))
  })

  it('does not render selection dropdown on click when not editable', () => {
    const wrapper = shallow(
      <StreetMetaWidthContainer street={{}} editable={false} updateStreetWidth={jest.fn()} />
    )

    wrapper.instance().handleClickLabel()

    // Expect render to remain label
    expect(wrapper.exists('StreetMetaWidthLabel'))
  })

  // TODO: mock updateUnits() and test if it is called
  it.skip('updates units', () => {})
})
