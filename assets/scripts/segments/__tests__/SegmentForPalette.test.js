/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { SegmentForPalette } from '../SegmentForPalette'
import { getSegmentInfo, getSegmentVariantInfo } from '../info'
import { getVariantInfoDimensions } from '../view'
import { generateRandSeed } from '../../util/random'
import { IntlProvider } from 'react-intl'

jest.mock('../../app/routing')
jest.mock('../../streets/data_model', () => {})
jest.mock('../info')
jest.mock('../view')
jest.mock('../../util/random')

function connectDropTarget (el) { return el }
function connectDragSource (el) { return el }

describe('SegmentForPalette', () => {
  const connectDragPreview = jest.fn()
  const intlProvider = new IntlProvider({ locale: 'en' }, {})
  const { intl } = intlProvider.getChildContext()
  beforeEach(() => {
    const variant = { name: 'Variant' }
    const segment = { nameKey: 'key' }
    const dimensions = { left: 100, right: 200 }
    getSegmentInfo.mockImplementation(() => segment)
    getSegmentVariantInfo.mockImplementation(() => variant)
    generateRandSeed.mockImplementation(() => 42)
    getVariantInfoDimensions.mockImplementation(() => dimensions)
  })
  describe('on mount', () => {
    it('connects to drag', () => {
      shallow(<SegmentForPalette connectDropTarget={connectDropTarget} connectDragSource={connectDragSource} connectDragPreview={connectDragPreview} type={''} variantString={''} intl={intl} />)
      expect(connectDragPreview).toHaveBeenCalledTimes(1)
    })
  })
  it('renders width correctly depending on the dimension', () => {
    const wrapper = shallow(<SegmentForPalette connectDropTarget={connectDropTarget} connectDragSource={connectDragSource} connectDragPreview={connectDragPreview} type={''} variantString={''} intl={intl} />)
    expect(wrapper).toMatchSnapshot()
  })
})
