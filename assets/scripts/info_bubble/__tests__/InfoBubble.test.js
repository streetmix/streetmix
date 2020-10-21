/* eslint-env jest */
import React from 'react'
import userEvent from '@testing-library/user-event'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import InfoBubble from '../InfoBubble'
import {
  BUILDING_LEFT_POSITION,
  BUILDING_RIGHT_POSITION
} from '../../segments/constants'

jest.mock('../../segments/view')
jest.mock('../../segments/buildings', () => {
  return {
    prettifyHeight: jest.fn(() => 10),
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
        width: 200
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
    const { asFragment } = renderWithReduxAndIntl(<InfoBubble />, {
      initialState
    })
    expect(asFragment()).toMatchSnapshot()
  })

  // TODO: this passes, but it doesn't render the <Description /> child component.
  it('shows description', () => {
    const { asFragment } = renderWithReduxAndIntl(<InfoBubble />, {
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
    const { asFragment } = renderWithReduxAndIntl(<InfoBubble />, {
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
    const { asFragment } = renderWithReduxAndIntl(<InfoBubble />, {
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
    const { asFragment } = renderWithReduxAndIntl(<InfoBubble />, {
      initialState: {
        ...initialState,
        ui: {
          activeSegment: BUILDING_RIGHT_POSITION
        }
      }
    })

    expect(asFragment()).toMatchSnapshot()
  })

  it('sets info bubble mouse inside', () => {
    const { container, store } = renderWithReduxAndIntl(<InfoBubble />, {
      initialState
    })

    userEvent.hover(container.firstChild)
    expect(store.getState().infoBubble.mouseInside).toEqual(true)

    userEvent.unhover(container.firstChild)
    expect(store.getState().infoBubble.mouseInside).toEqual(false)
  })
})
