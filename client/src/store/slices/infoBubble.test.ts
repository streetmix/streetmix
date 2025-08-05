import infoBubble, {
  setInfoBubbleMouseInside,
  showDescription,
  hideDescription
} from './infoBubble'
import { startPrinting } from './app'

describe('infoBubble reducer', () => {
  const initialState = {
    mouseInside: false,
    descriptionVisible: false,
    descriptionData: null
  }

  it('should handle setInfoBubbleMouseInside()', () => {
    expect(infoBubble(initialState, setInfoBubbleMouseInside(false))).toEqual({
      mouseInside: false,
      descriptionVisible: false,
      descriptionData: null
    })

    expect(
      infoBubble(
        {
          mouseInside: true,
          descriptionVisible: false,
          descriptionData: null
        },
        setInfoBubbleMouseInside(false)
      )
    ).toEqual({
      mouseInside: false,
      descriptionVisible: false,
      descriptionData: null
    })
  })

  it('should handle showDescription()', () => {
    expect(
      infoBubble(
        {
          mouseInside: false,
          descriptionVisible: false,
          descriptionData: null
        },
        showDescription({ key: 'foo', image: 'bar.jpg' })
      )
    ).toEqual({
      mouseInside: false,
      descriptionVisible: true,
      descriptionData: { key: 'foo', image: 'bar.jpg' }
    })
  })

  it('should handle hideDescription()', () => {
    expect(
      infoBubble(
        {
          mouseInside: false,
          descriptionVisible: true,
          descriptionData: null
        },
        hideDescription()
      )
    ).toEqual({
      mouseInside: false,
      descriptionVisible: false,
      descriptionData: null
    })
  })

  it('should handle extra reducers', () => {
    expect(infoBubble(initialState, startPrinting())).toEqual({
      mouseInside: false,
      descriptionVisible: false,
      descriptionData: null
    })
  })
})
