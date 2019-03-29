/* eslint-env jest */
import React from 'react'

import StreetEditable from '../StreetEditable'
import { renderWithRedux } from '../../../../test/helpers/render'

jest.mock('../../streets/data_model', () => {})

describe('StreetEditable', () => {
  it('calls setBuildingsWidth', () => {
    const setBuildingWidth = jest.fn()
    const updatePerspective = () => {}
    const segment = { variantString: 'inbound|regular', segmentType: 'streetcar', id: '1', width: 400 }
    const street = {
      segments: [segment],
      width: 100
    }
    const connectDropTarget = (d) => d
    const wrapper = renderWithRedux(<StreetEditable connectDropTarget={connectDropTarget} setBuildingWidth={setBuildingWidth} updatePerspective={updatePerspective} />, { street })
    wrapper.debug()
    // expect(setBuildingWidth).toHaveBeenCalledTimes(1)
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
