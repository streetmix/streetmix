import infoBubble, {
  show,
  hide,
  updateHoverPolygon,
  setInfoBubbleMouseInside,
  showDescription,
  hideDescription
} from './infoBubble'
import { startPrinting } from './app'

describe('infoBubble reducer', () => {
  const initialState = {
    visible: false,
    mouseInside: false,
    descriptionVisible: false,
    hoverPolygon: []
  }

  it('should handle initial state', () => {
    expect(infoBubble(undefined, {})).toEqual(initialState)
  })

  it('should handle show()', () => {
    expect(
      infoBubble(
        {
          visible: false,
          mouseInside: false,
          descriptionVisible: false,
          hoverPolygon: []
        },
        show()
      )
    ).toEqual({
      visible: true,
      mouseInside: false,
      descriptionVisible: false,
      hoverPolygon: []
    })
  })

  it('should handle hide()', () => {
    expect(
      infoBubble(
        {
          visible: true,
          mouseInside: false,
          descriptionVisible: false,
          hoverPolygon: []
        },
        hide()
      )
    ).toEqual({
      visible: false,
      mouseInside: false,
      descriptionVisible: false,
      hoverPolygon: []
    })
  })

  it('should handle updateHoverPolygon()', () => {
    expect(
      infoBubble(
        initialState,
        updateHoverPolygon([
          [1, 1],
          [2, 2],
          [3, 3]
        ])
      )
    ).toEqual({
      visible: false,
      mouseInside: false,
      descriptionVisible: false,
      hoverPolygon: [
        [1, 1],
        [2, 2],
        [3, 3]
      ]
    })
  })

  it('should handle setInfoBubbleMouseInside()', () => {
    expect(infoBubble(initialState, setInfoBubbleMouseInside(false))).toEqual({
      visible: false,
      mouseInside: false,
      descriptionVisible: false,
      hoverPolygon: []
    })

    expect(
      infoBubble(
        {
          visible: false,
          mouseInside: true,
          descriptionVisible: false,
          hoverPolygon: []
        },
        setInfoBubbleMouseInside(false)
      )
    ).toEqual({
      visible: false,
      mouseInside: false,
      descriptionVisible: false,
      hoverPolygon: []
    })
  })

  it('should handle showDescription()', () => {
    expect(
      infoBubble(
        {
          visible: true,
          mouseInside: false,
          descriptionVisible: false,
          hoverPolygon: []
        },
        showDescription()
      )
    ).toEqual({
      visible: true,
      mouseInside: false,
      descriptionVisible: true,
      hoverPolygon: []
    })
  })

  it('should handle hideDescription()', () => {
    expect(
      infoBubble(
        {
          visible: true,
          mouseInside: false,
          descriptionVisible: true,
          hoverPolygon: []
        },
        hideDescription()
      )
    ).toEqual({
      visible: true,
      mouseInside: false,
      descriptionVisible: false,
      hoverPolygon: []
    })
  })

  it('should handle extra reducers', () => {
    expect(infoBubble(initialState, startPrinting())).toEqual({
      visible: false,
      mouseInside: false,
      descriptionVisible: false,
      hoverPolygon: []
    })
  })
})
