/* eslint-env jest */
import React from 'react'
import { fireEvent } from '@testing-library/react'
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
    segments: [],
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
    const wrapper = renderWithReduxAndIntl(<InfoBubble />, { initialState })
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  // TODO: this passes, but it doesn't render the <Description /> child component.
  it('shows description', () => {
    const wrapper = renderWithReduxAndIntl(<InfoBubble />, {
      initialState: {
        ...initialState,
        infoBubble: {
          visible: false,
          descriptionVisible: true,
          mouseInside: false
        }
      }
    })

    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('is visible', () => {
    const wrapper = renderWithReduxAndIntl(<InfoBubble />, {
      initialState: {
        ...initialState,
        infoBubble: {
          visible: true,
          descriptionVisible: false,
          mouseInside: false
        }
      }
    })

    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('shows building left info bubble', () => {
    const wrapper = renderWithReduxAndIntl(<InfoBubble />, {
      initialState: {
        ...initialState,
        ui: {
          activeSegment: BUILDING_LEFT_POSITION
        }
      }
    })

    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('shows building right info bubble', () => {
    const wrapper = renderWithReduxAndIntl(<InfoBubble />, {
      initialState: {
        ...initialState,
        ui: {
          activeSegment: BUILDING_RIGHT_POSITION
        }
      }
    })

    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  describe('interactions', () => {
    it('set info bubble mouse inside', () => {
      const { container, store } = renderWithReduxAndIntl(<InfoBubble />, {
        initialState
      })
      fireEvent.mouseEnter(container.firstChild)

      expect(store.getState().infoBubble.mouseInside).toEqual(true)
    })

    it('does not set info bubble mouse inside', () => {
      const { container, store } = renderWithReduxAndIntl(<InfoBubble />, {
        initialState
      })
      fireEvent.mouseLeave(container.firstChild)

      expect(store.getState().infoBubble.mouseInside).toEqual(false)
    })
  })
})
