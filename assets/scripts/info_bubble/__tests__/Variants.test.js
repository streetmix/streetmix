/* eslint-env jest */
import React from 'react'
import { Variants } from '../Variants'
import { shallow } from 'enzyme'
import { IntlProvider } from 'react-intl'

import { getSegmentInfo } from '../../segments/info'
import {
  INFO_BUBBLE_TYPE_SEGMENT,
  INFO_BUBBLE_TYPE_LEFT_BUILDING,
  INFO_BUBBLE_TYPE_RIGHT_BUILDING
} from '../constants'

jest.mock('../../streets/data_model', () => {})
jest.mock('../../segments/view')
jest.mock('../../segments/info')

describe('Variants', () => {
  const intlProvider = new IntlProvider({ locale: 'en' }, {})
  const { intl } = intlProvider.getChildContext()
  let segment
  beforeEach(() => {
    segment = { variants: ['direction', 'public-transit-asphalt'] } // coming from info.json
    getSegmentInfo.mockImplementation(() => segment)
  })
  it('renders', () => {
    const type = INFO_BUBBLE_TYPE_SEGMENT
    const streetSegment = { variantString: 'inbound|regular', segmentType: 'streetcar' }
    const wrapper = shallow(<Variants intl={intl} type={type} position={0} variant={streetSegment.variantString} segmentType={streetSegment.segmentType} />)
    expect(wrapper).toMatchSnapshot()
  })
})
