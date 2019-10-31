/* eslint-env jest */
import React from 'react'
import { renderWithRedux } from '../../../../test/helpers/render'
import DebugHoverPolygon from '../DebugHoverPolygon'

describe('DebugHoverPolygon', () => {
  it('renders if enabled', () => {
    const wrapper = renderWithRedux(<DebugHoverPolygon />, {
      initialState: {
        flags: {
          INFO_BUBBLE_HOVER_POLYGON: {
            value: true
          }
        },
        infoBubble: {
          hoverPolygon: []
        }
      }
    })

    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('renders nothing if disabled', () => {
    const wrapper = renderWithRedux(<DebugHoverPolygon />, {
      initialState: {
        flags: {
          INFO_BUBBLE_HOVER_POLYGON: {
            value: false
          }
        }
      }
    })

    expect(wrapper.container.firstChild).toBeNull()
  })
})
