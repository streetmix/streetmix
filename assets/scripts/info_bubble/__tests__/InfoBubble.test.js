/* eslint-env jest */
import React from 'react'
import { fireEvent } from '@testing-library/react'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import InfoBubble from '../InfoBubble'
import {
  setInfoBubbleMouseInside,
  updateHoverPolygon
} from '../../store/actions/infoBubble'

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

// Spy on action creators
jest.mock('../../store/actions/infoBubble', () => ({
  // Require the actual action creators so that other stuff works
  ...jest.requireActual('../../store/actions/infoBubble'),
  // We don't use these actions for anything, but they must return
  // a plain object or the dispatch() throws an error
  setInfoBubbleMouseInside: jest.fn(() => ({ type: 'MOCK_ACTION' })),
  updateHoverPolygon: jest.fn(() => ({ type: 'MOCK_ACTION' }))
}))

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
  afterEach(() => {
    // Resets mock call counter between tests
    setInfoBubbleMouseInside.mockClear()
    updateHoverPolygon.mockClear()
  })

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
          activeSegment: 'left'
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
          activeSegment: 'right'
        }
      }
    })

    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('updates hover polygon', () => {
    const wrapper = renderWithReduxAndIntl(<InfoBubble />, { initialState })
    const showInfoBubble = jest.fn(() => ({ type: 'SHOW_INFO_BUBBLE' }))
    wrapper.store.dispatch(showInfoBubble())
    expect(updateHoverPolygon).toHaveBeenCalledTimes(1)
  })

  describe('interactions', () => {
    it('set info bubble mouse inside', () => {
      const wrapper = renderWithReduxAndIntl(<InfoBubble />, { initialState })
      fireEvent.mouseEnter(wrapper.container.firstChild)

      expect(setInfoBubbleMouseInside).toHaveBeenCalledTimes(1)
      expect(setInfoBubbleMouseInside).toHaveBeenCalledWith(true)
    })

    it('does not set info bubble mouse inside', () => {
      const wrapper = renderWithReduxAndIntl(<InfoBubble />, { initialState })
      fireEvent.mouseLeave(wrapper.container.firstChild)

      expect(setInfoBubbleMouseInside).toHaveBeenCalledTimes(1)
      expect(setInfoBubbleMouseInside).toHaveBeenCalledWith(false)
    })
  })
})
