/* eslint-env jest */
import React from 'react'
import { fireEvent } from '@testing-library/react'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'

import WidthControl from '../WidthControl'

jest.mock('../../app/routing', () => {})

describe('WidthControl', () => {
  let activeElement, segment

  beforeEach(() => {
    activeElement = 0
    segment = {
      type: 'streetcar',
      variantString: 'inbound|regular',
      segmentType: 'streetcar',
      id: '1',
      width: 200
    }
  })

  it('renders', () => {
    const wrapper = renderWithReduxAndIntl(<WidthControl />, {
      initialState: { street: { segments: [segment] } }
    })
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  describe('increase width', () => {
    it('increaeses store width', () => {
      const wrapper = renderWithReduxAndIntl(
        <WidthControl position={activeElement} />,
        { initialState: { street: { segments: [segment], units: 1 } } }
      )
      fireEvent.click(wrapper.getByTitle(/Increase width/i))
      expect(
        wrapper.store.getState().street.segments[activeElement].width
      ).toEqual(200.5)
    })
  })

  describe('decrease width', () => {
    it('decreaeses store width', () => {
      const wrapper = renderWithReduxAndIntl(
        <WidthControl position={activeElement} />,
        { initialState: { street: { segments: [segment], units: 1 } } }
      )
      fireEvent.click(wrapper.getByTitle(/Decrease width/i))
      expect(
        wrapper.store.getState().street.segments[activeElement].width
      ).toEqual(199.5)
    })
  })
})
