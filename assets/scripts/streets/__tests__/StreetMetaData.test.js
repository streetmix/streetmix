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

  it('does not indicate editability for location if read only', () => {
    const testStreet = {
      location: {
        hierarchy: {
          locality: 'test locality',
          country: 'test country'
        }
      }
    }

    const wrapper = shallow(
      <StreetMetaData.WrappedComponent
        street={testStreet}
        readOnly
        enableLocation
        signedIn
        locale={{}}
      />
    )

    expect(wrapper.find('.street-metadata-map a').length).toEqual(0)
  })

  it('does not display geotag label if no location and application is read only', () => {
    const wrapper = shallow(
      <StreetMetaData.WrappedComponent
        street={{}}
        readOnly
        enableLocation
        signedIn
        locale={{}}
      />
    )

    expect(wrapper.find('.street-metadata-map').length).toEqual(0)
  })
})
