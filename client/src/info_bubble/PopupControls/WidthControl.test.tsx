import React from 'react'
import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { render } from '~/test/helpers/render'
import { WidthControl } from './WidthControl'

import type { Segment } from '@streetmix/types'

describe('WidthControl', () => {
  const activeElement = 0
  const segment: Partial<Segment> = {
    type: 'streetcar',
    variantString: 'inbound|regular',
    id: '1',
    width: 3
  }

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

      await userEvent.click(screen.getByTestId('up'))
      expect(store.getState().street.segments[activeElement].width).toEqual(3.1)
    })
  })

  describe('decrease width', () => {
    it('decreases store width', async () => {
      const { store } = render(<WidthControl position={activeElement} />, {
        initialState: { street: { segments: [segment], units: 0 } }
      })

      await userEvent.click(screen.getByTestId('down'))
      expect(store.getState().street.segments[activeElement].width).toEqual(2.9)
    })
  })
})
