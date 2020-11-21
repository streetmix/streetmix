/* eslint-env jest */
import React from 'react'
import { renderWithRedux } from '../../../../test/helpers/render'
import DebugHoverPolygon from '../DebugHoverPolygon'

describe('DebugHoverPolygon', () => {
  it('renders if enabled', () => {
    const { asFragment } = renderWithRedux(<DebugHoverPolygon />, {
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

    expect(asFragment()).toMatchSnapshot()
  })

  it('renders nothing if disabled', () => {
    const { container } = renderWithRedux(<DebugHoverPolygon />, {
      initialState: {
        flags: {
          INFO_BUBBLE_HOVER_POLYGON: {
            value: false
          }
        }
      }
    })

    expect(container.firstChild).toBe(null)
  })
})
