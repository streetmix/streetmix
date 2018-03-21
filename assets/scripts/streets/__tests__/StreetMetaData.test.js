/* eslint-env jest */
import React from 'react'
import StreetMetaData from '../StreetMetaData'
import { shallow } from 'enzyme'

jest.mock('../../streets/remix', () => {
  return {
    getRemixOnFirstEdit: () => {}
  }
})

jest.mock('../../app/load_resources', () => {})
jest.mock('../../app/routing', () => {})
jest.mock('../../app/initialization', () => {})
jest.mock('../../preinit/system_capabilities', () => {})
jest.mock('../../preinit/app_settings', () => {})

describe('StreetMetaData', () => {
  it('renders without crashing', () => {
    const wrapper = shallow(
      <StreetMetaData.WrappedComponent
        street={{}}
        signedIn
        locale={{}}
      />
    )
    expect(wrapper.exists()).toEqual(true)
  })
})
