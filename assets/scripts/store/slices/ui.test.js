import {
  DRAGGING_TYPE_NONE,
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
    draggingState: null,
    draggingType: 0,
    resizeGuidesVisible: false
  }

  it('should handle initial state', () => {
    expect(ui(undefined, {})).toEqual(initialState)
  })

  it('should handle setWelcomePanelVisible()', () => {
    expect(ui(initialState, setWelcomePanelVisible())).toEqual({
      welcomePanelVisible: true,
      welcomePanelDismissed: false,
      toolboxVisible: false,
      activeSegment: null,
      draggingState: null,
      draggingType: 0,
      resizeGuidesVisible: false
    })
  })

  it('should handle setWelcomePanelDismissed()', () => {
    expect(ui(initialState, setWelcomePanelDismissed())).toEqual({
      welcomePanelVisible: false,
      welcomePanelDismissed: true,
      toolboxVisible: false,
      activeSegment: null,
      draggingState: null,
      draggingType: 0,
      resizeGuidesVisible: false
    })
  })

  it('should handle setActiveSegment()', () => {
    expect(ui(initialState, setActiveSegment(1))).toEqual({
      welcomePanelVisible: false,
      welcomePanelDismissed: false,
      toolboxVisible: false,
      activeSegment: 1,
      draggingState: null,
      draggingType: 0,
      resizeGuidesVisible: false
    })

    // if resize guides visible, don't set active segment
    expect(
      ui(
        {
          welcomePanelVisible: false,
          welcomePanelDismissed: false,
          toolboxVisible: false,
          activeSegment: null,
          draggingState: null,
          draggingType: 0,
          resizeGuidesVisible: true
        },
        setActiveSegment(1)
      )
    ).toEqual({
      welcomePanelVisible: false,
      welcomePanelDismissed: false,
      toolboxVisible: false,
      activeSegment: null,
      draggingState: null,
      draggingType: 0,
      resizeGuidesVisible: true
    })
  })

  it('should handle initDraggingState()', () => {
    expect(ui(initialState, initDraggingState(1))).toEqual({
      welcomePanelVisible: false,
      welcomePanelDismissed: false,
      toolboxVisible: false,
      activeSegment: null,
      draggingState: null,
      draggingType: 1,
      resizeGuidesVisible: false
    })
  })

  it('should handle updateDraggingState()', () => {
    expect(
      ui(
        initialState,
        updateDraggingState({
          segmentBeforeEl: 1,
          segmentAfterEl: 3,
          draggedSegment: 2
        })
      )
    ).toEqual({
      welcomePanelVisible: false,
      welcomePanelDismissed: false,
      toolboxVisible: false,
      activeSegment: null,
      draggingState: {
        segmentBeforeEl: 1,
        segmentAfterEl: 3,
        draggedSegment: 2
      },
      draggingType: 0,
      resizeGuidesVisible: false
    })
  })

  it('should handle clearDraggingState()', () => {
    expect(
      ui(
        {
          welcomePanelVisible: false,
          welcomePanelDismissed: false,
          toolboxVisible: false,
          activeSegment: null,
          draggingState: {
            segmentBeforEl: 1,
            segmentAfterEl: 3,
            draggedSegment: 2
          },
          draggingType: 1,
          resizeGuidesVisible: false
        },
        clearDraggingState()
      )
    ).toEqual({
      welcomePanelVisible: false,
      welcomePanelDismissed: false,
      toolboxVisible: false,
      activeSegment: null,
      draggingState: null,
      draggingType: 0,
      resizeGuidesVisible: false
    })
  })

  it('should handle setDraggingType()', () => {
    expect(ui(initialState, setDraggingType(DRAGGING_TYPE_NONE))).toEqual({
      welcomePanelVisible: false,
      welcomePanelDismissed: false,
      toolboxVisible: false,
      activeSegment: null,
      draggingState: null,
      draggingType: DRAGGING_TYPE_NONE,
      resizeGuidesVisible: false
    })

    expect(ui(initialState, setDraggingType(DRAGGING_TYPE_RESIZE))).toEqual({
      welcomePanelVisible: false,
      welcomePanelDismissed: false,
      toolboxVisible: false,
      activeSegment: null,
      draggingState: null,
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
