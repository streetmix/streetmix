import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { render } from '~/test/helpers/render.js'
import { WidthControl } from './WidthControl.js'

describe('WidthControl', () => {
  const activeElement = 0
  const initialState = {
    street: {
      boundary: { left: { elevation: 0 }, right: { elevation: 0 } },
      segments: [
        {
          type: 'streetcar',
          variantString: 'inbound|regular',
          id: '1',
          width: 3,
        },
      ],
      width: 3,
      units: 0,
    },
  }

  it('renders', () => {
    const { asFragment } = render(<WidthControl position={activeElement} />, {
      initialState,
    })
    expect(asFragment()).toMatchSnapshot()
  })

  describe('increase width', () => {
    it('increases store width', async () => {
      const { store } = render(<WidthControl position={activeElement} />, {
        initialState,
      })

      await userEvent.click(screen.getByTestId('up'))
      expect(store.getState().street.segments[activeElement].width).toEqual(3.1)
    })
  })

  describe('decrease width', () => {
    it('decreases store width', async () => {
      const { store } = render(<WidthControl position={activeElement} />, {
        initialState,
      })

      await userEvent.click(screen.getByTestId('down'))
      expect(store.getState().street.segments[activeElement].width).toEqual(2.9)
    })
  })
})
