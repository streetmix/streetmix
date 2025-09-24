import {
  DRAGGING_TYPE_NONE,
  DRAGGING_TYPE_MOVE,
  DRAGGING_TYPE_RESIZE
} from '../../segments/constants'
import ui, {
  setWelcomePanelVisible,
  setWelcomePanelDismissed,
  setActiveSegment,
  initDraggingState,
  updateDraggingState,
  clearDraggingState,
  setDraggingType,
  toggleToolbox
} from './ui'

describe('ui reducer', () => {
  const initialState = {
    welcomePanelVisible: false,
    welcomePanelDismissed: false,
    toolboxVisible: false,
    activeSegment: null,
    draggingState: {
      isDragging: false,
      segmentBeforeEl: null,
      segmentAfterEl: null,
      draggedSegment: null,
      withinCanvas: false
    },
    draggingType: DRAGGING_TYPE_NONE,
    resizeGuidesVisible: false
  }

  it('should handle setWelcomePanelVisible()', () => {
    expect(ui(initialState, setWelcomePanelVisible())).toEqual({
      ...initialState,
      welcomePanelVisible: true
    })
  })

  it('should handle setWelcomePanelDismissed()', () => {
    expect(ui(initialState, setWelcomePanelDismissed())).toEqual({
      ...initialState,
      welcomePanelDismissed: true
    })
  })

  it('should handle setActiveSegment()', () => {
    expect(ui(initialState, setActiveSegment(1))).toEqual({
      ...initialState,
      activeSegment: 1
    })

    // if resize guides visible, don't set active segment
    expect(
      ui(
        {
          ...initialState,
          resizeGuidesVisible: true
        },
        setActiveSegment(1)
      )
    ).toEqual({
      ...initialState,
      activeSegment: null,
      resizeGuidesVisible: true
    })
  })

  it('should handle initDraggingState()', () => {
    expect(ui(initialState, initDraggingState(1))).toEqual({
      ...initialState,
      draggingType: 1
    })
  })

  it('should handle updateDraggingState()', () => {
    expect(
      ui(
        initialState,
        updateDraggingState({
          isDragging: true,
          segmentBeforeEl: 1,
          segmentAfterEl: 3,
          draggedSegment: 2
        })
      )
    ).toEqual({
      ...initialState,
      draggingState: {
        isDragging: true,
        segmentBeforeEl: 1,
        segmentAfterEl: 3,
        draggedSegment: 2,
        withinCanvas: false
      }
    })
  })

  it('should handle clearDraggingState()', () => {
    expect(
      ui(
        {
          ...initialState,
          draggingState: {
            isDragging: true,
            segmentBeforeEl: 1,
            segmentAfterEl: 3,
            draggedSegment: 2,
            withinCanvas: true
          },
          draggingType: 1
        },
        clearDraggingState()
      )
    ).toEqual(initialState)
  })

  it('should handle setDraggingType()', () => {
    expect(ui(initialState, setDraggingType(DRAGGING_TYPE_NONE))).toEqual({
      ...initialState,
      draggingType: DRAGGING_TYPE_NONE
    })

    // For move
    expect(ui(initialState, setDraggingType(DRAGGING_TYPE_MOVE))).toEqual({
      ...initialState,
      draggingType: DRAGGING_TYPE_MOVE
    })

    // For resize
    expect(ui(initialState, setDraggingType(DRAGGING_TYPE_RESIZE))).toEqual({
      ...initialState,
      draggingType: DRAGGING_TYPE_RESIZE,
      resizeGuidesVisible: true
    })
  })

  it('should handle toggleToolbox()', () => {
    const state1 = ui(initialState, toggleToolbox())
    const state2 = ui(state1, toggleToolbox())

    expect(state1.toolboxVisible).toEqual(true)
    expect(state2.toolboxVisible).toEqual(false)
  })
})
