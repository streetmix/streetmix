import React from 'react'
import { vi } from 'vitest'
import { userEvent } from '@testing-library/user-event'
import { render } from '../../../../test/helpers/render'
import InfoBubble from '../InfoBubble'
import {
  BUILDING_LEFT_POSITION,
  BUILDING_RIGHT_POSITION
} from '../../segments/constants'

vi.mock('../../segments/view')
vi.mock('../../segments/buildings', () => {
  return {
    prettifyHeight: vi.fn(() => 10),
    // TODO: use mock building data
    BUILDINGS: {
      grass: {
        id: 'grass',
        label: 'Grass',
        spriteId: 'buildings--grass',
        hasFloors: false,
        sameOnBothSides: true
      }
    }
  }
})

const initialState = {
  infoBubble: {
    visible: false,
    descriptionVisible: false,
    mouseInside: false
  },
  ui: {
    activeSegment: 0
  },
  street: {
    segments: [
      {
        type: 'streetcar',
        variantString: 'inbound|regular',
        segmentType: 'streetcar',
        id: '1',
        width: 3
      }
    ],
    leftBuildingVariant: 'grass',
    rightBuildingVariant: 'grass'
  },
  system: {},
  locale: {
    locale: 'en'
  }
}

describe('InfoBubble', () => {
  it('renders', () => {
    const { asFragment } = render(<InfoBubble />, {
      initialState
    })
    expect(asFragment()).toMatchSnapshot()
  })

  // TODO: this passes, but it doesn't render the <Description /> child component.
  it('shows description', () => {
    const { asFragment } = render(<InfoBubble />, {
      initialState: {
        ...initialState,
        infoBubble: {
          visible: false,
          descriptionVisible: true,
          mouseInside: false
        }
      }
    })

    expect(asFragment()).toMatchSnapshot()
  })

  it('is visible', () => {
    const { asFragment } = render(<InfoBubble />, {
      initialState: {
        ...initialState,
        infoBubble: {
          visible: true,
          descriptionVisible: false,
          mouseInside: false
        }
      }
    })

    expect(asFragment()).toMatchSnapshot()
  })

  it('shows building left info bubble', () => {
    const { asFragment } = render(<InfoBubble />, {
      initialState: {
        ...initialState,
        ui: {
          activeSegment: BUILDING_LEFT_POSITION
        }
      }
    })

    expect(asFragment()).toMatchSnapshot()
  })

  it('shows building right info bubble', () => {
    const { asFragment } = render(<InfoBubble />, {
      initialState: {
        ...initialState,
        ui: {
          activeSegment: BUILDING_RIGHT_POSITION
        }
      }
    })

    expect(asFragment()).toMatchSnapshot()
  })

  it('sets info bubble mouse inside', async () => {
    const { container, store } = render(<InfoBubble />, {
      initialState
    })

    await userEvent.hover(container.firstChild)
    expect(store.getState().infoBubble.mouseInside).toEqual(true)

    await userEvent.unhover(container.firstChild)
    expect(store.getState().infoBubble.mouseInside).toEqual(false)
  })
})
