/* eslint-env jest */
import React from 'react'
import { SaveAsImageDialogWithIntl as SaveAsImageDialog } from '../SaveAsImageDialog'
import { shallowWithIntl as shallow } from '../../../../test/helpers/intl-enzyme-test-helper.js'

// Mock dependencies that could break tests
jest.mock('../../streets/image', () => {
  return {
    getStreetImage: () => {},
    saveStreetThumbnail: () => {},
    checkSaveThumbnailIncomplete: () => {}
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
      />
    )
    expect(wrapper.exists()).toEqual(true)
  })
})
