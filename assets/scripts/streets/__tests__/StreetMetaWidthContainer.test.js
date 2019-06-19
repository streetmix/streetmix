/* eslint-env jest */
import React from 'react'
import { fireEvent, cleanup } from '@testing-library/react'
import { shallowWithIntl as shallow } from '../../../../test/helpers/intl-enzyme-test-helper.js'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import StreetMetaWidthContainer, { StreetMetaWidthContainerWithIntl } from '../StreetMetaWidthContainer'

describe('StreetMetaWidthContainer', () => {
  afterEach(cleanup)

  it('renders', () => {
    const wrapper = renderWithReduxAndIntl(<StreetMetaWidthContainer />)
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('renders selection dropdown on click', () => {
    const wrapper = renderWithReduxAndIntl(<StreetMetaWidthContainer />)
    fireEvent.click(wrapper.getByTitle('Change width of the street'))
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('updates street label on selection change', () => {
    const updateStreetWidth = jest.fn()
    const changeValue = 10
    const wrapper = shallow(
      <StreetMetaWidthContainerWithIntl street={{}} updateStreetWidth={updateStreetWidth} />
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
      <StreetMetaWidthContainerWithIntl street={{}} editable={false} updateStreetWidth={jest.fn()} />
    )

    wrapper.instance().handleClickLabel()

    // Expect render to remain label
    expect(wrapper.exists('StreetMetaWidthLabel'))
  })

  // TODO: mock updateUnits() and test if it is called
  it.skip('updates units', () => {})
})
