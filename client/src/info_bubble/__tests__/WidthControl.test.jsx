import React from 'react'
import { screen, act } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { render } from '~/test/helpers/render'
import WidthControl from '../WidthControl'

describe('WidthControl', () => {
  let activeElement, segment

  beforeEach(() => {
    activeElement = 0
    segment = {
      type: 'streetcar',
      variantString: 'inbound|regular',
      segmentType: 'streetcar',
      id: '1',
      width: 3
    }
  })

  it('renders', () => {
    const { asFragment } = render(<WidthControl position={activeElement} />, {
      initialState: { street: { segments: [segment] } }
    })
    expect(asFragment()).toMatchSnapshot()
  })

  describe('increase width', () => {
    it('increases store width', async () => {
      const { store } = render(<WidthControl position={activeElement} />, {
        initialState: { street: { segments: [segment], units: 0 } }
      })

      await act(async () => {
        await userEvent.click(screen.getByTitle(/Increase width/i))
      })
      expect(store.getState().street.segments[activeElement].width).toEqual(
        3.05
      )
    })
  })

  describe('decrease width', () => {
    it('decreases store width', async () => {
      const { store } = render(<WidthControl position={activeElement} />, {
        initialState: { street: { segments: [segment], units: 0 } }
      })

      await act(async () => {
        await userEvent.click(screen.getByTitle(/Decrease width/i))
      })
      expect(store.getState().street.segments[activeElement].width).toEqual(
        2.95
      )
    })
  })
})
