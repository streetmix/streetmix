import React from 'react'

import { render } from '~/test/helpers/render'
import DebugHoverPolygon from '../DebugHoverPolygon'

describe('DebugHoverPolygon', () => {
  it('renders if enabled', () => {
    const { asFragment } = render(<DebugHoverPolygon />, {
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
    const { container } = render(<DebugHoverPolygon />, {
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
