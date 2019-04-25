/* eslint-env jest */
import React from 'react'

import { fireEvent, getByTestId, wait, waitForDomChange } from 'react-testing-library'

import StreetEditable from '../StreetEditable'
import { renderWithRedux } from '../../../../test/helpers/render'
import { getSpriteDef, getSegmentInfo, getSegmentVariantInfo } from '../../segments/info'
import SEGMENT_INFO from '../../segments/info.json'
import { KEYS } from '../keys'

const connectDropTarget = (d) => d

jest.mock('react-dnd')

jest.mock('../../app/load_resources')
jest.mock('../../segments/info')

jest.mock('../../streets/data_model', () => {
  const actual = jest.requireActual('../../streets/data_model')
  return {
    ...actual,
    saveStreetToServerIfNecessary: jest.fn()
  }
})

jest.mock('react-transition-group', () => {
  return {
    TransitionGroup: jest.fn(({ children }) => (children)),
    CSSTransition: jest.fn(({ children }) => (children))
  }
})
jest.mock('../../segments/view', () => {
  const actual = jest.requireActual('../../segments/view')
  return {
    ...actual,
    getVariantInfoDimensions: jest.fn(() => ({ left: 0, right: 100, center: 50 }))
  }
})
jest.mock('../../app/routing', () => {})

describe('StreetEditable', () => {
  beforeEach(() => jest.resetModules())
  const setBuildingWidth = jest.fn()
  const updatePerspective = () => {}
  const segment = { variantString: 'inbound|regular', segmentType: 'streetcar', id: '1', width: 400, randSeed: 1 }
  beforeEach(() => {
    const variantString = 'inbound|regular'
    const type = 'streetcar'
    const variant = SEGMENT_INFO[type].details[variantString]
    const segmentInfo = { name: 'Segment', nameKey: 'key', zIndex: 1 }
    getSegmentInfo.mockImplementation(() => segmentInfo)
    getSegmentVariantInfo.mockImplementation(() => variant)
    getSpriteDef.mockImplementation(() => ({ id: 'markings--straight-inbound', width: 4, offsetY: 11.12 }))
  })
  it('calls setBuildingsWidth', () => {
    const street = {
      segments: [segment],
      width: 100
    }
    renderWithRedux(<StreetEditable connectDropTarget={connectDropTarget} setBuildingWidth={setBuildingWidth} updatePerspective={updatePerspective} />, { street })
    // expect(setBuildingWidth).toHaveBeenCalledTimes(1)
  })
  describe('segment warnings', () => {
    describe('too large', () => {
      it.only('KEY.EQUAL does not increase the width of the segment', async () => {
        const street = { width: 400, segments: [segment] }
        const wrapper = renderWithRedux(<StreetEditable connectDropTarget={connectDropTarget} setBuildingWidth={setBuildingWidth} updatePerspective={updatePerspective} />, { initialState: { street } })
        fireEvent.mouseOver(getByTestId(wrapper.container, 'segment'))
        fireEvent.keyDown(document, { key: 'Equal', keyCode: KEYS.EQUAL, code: KEYS.EQUAL, charCode: KEYS.EQUAL })
        await wait(() => {
          waitForDomChange({ container: wrapper.container })
          expect(wrapper.store.getState().street.segments[0].width).toEqual(400)
          expect(wrapper.store.getState().street.segments[0].warnings).toEqual([undefined, false, false, true])
          expect(wrapper.asFragment()).toMatchSnapshot()
        })
      })
    })
  })
  /** test
   * updatePerspective
   * props:
   *  street has segment, and has none
   * evens:
   *  wrapper.simulate('transitionEnd');
   *  - compoonentDidUpdate
   *    - resizeType
   *    - draggingState
   *    **/
})
