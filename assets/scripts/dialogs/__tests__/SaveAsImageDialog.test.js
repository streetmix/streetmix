/* eslint-env jest */
import React from 'react'
import { SaveAsImageDialog } from '../SaveAsImageDialog'
import { shallow } from 'enzyme'
import { mockIntl } from '../../../../test/__mocks__/react-intl'

// Mock dependencies that could break tests
jest.mock('../../streets/image', () => {
  return {
    getStreetImage: () => {}
  }
})
jest.mock('../../users/settings', () => {})

describe('SaveAsImageDialog', () => {
  it('renders without crashing', () => {
    const wrapper = shallow(
      <SaveAsImageDialog
        transparentSky={false}
        segmentNames={false}
        streetName={false}
        street={{}}
        intl={mockIntl}
      />
    )
    expect(wrapper.exists()).toEqual(true)
  })
})
