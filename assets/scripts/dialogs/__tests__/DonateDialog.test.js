/* eslint-env jest */
import React from 'react'
import DonateDialog from '../DonateDialog'
import { shallow } from 'enzyme'

describe('DonateDialog', () => {
  it('renders without crashing', () => {
    const wrapper = shallow(
      <DonateDialog.WrappedComponent
        clearDialogs={jest.fn()}
      />
    )
    expect(wrapper.exists()).toEqual(true)
  })
})
