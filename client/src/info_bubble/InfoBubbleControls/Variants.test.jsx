import React from 'react'
import { vi } from 'vitest'
import { screen, act } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { render } from '~/test/helpers/render'
import { getSegmentInfo, getSegmentVariantInfo } from '~/src/segments/info'
import {
  INFO_BUBBLE_TYPE_SEGMENT,
  INFO_BUBBLE_TYPE_LEFT_BUILDING,
  INFO_BUBBLE_TYPE_RIGHT_BUILDING
} from '../constants'
import Variants from './Variants'

// Enable mocking of the return value of `getSegmentInfo`
vi.mock('../../segments/info')

// Provide mock variant icons so that we can test icons with `enabledWithFlag`
vi.mock('../../segments/variant_icons.json', () => ({
  default: require('../../segments/__mocks__/variant_icons.json')
}))

describe('Variants', () => {
  const initialState = {
    street: {
      leftBuildingVariant: 'residential',
      rightBuildingVariant: 'residential',
      segments: [
        {
          variant: {
            direction: 'inbound',
            'public-transit-asphalt': 'regular'
          },
          variantString: 'inbound|regular',
          type: 'streetcar'
        }
      ]
    }
  }

  it('does not render if props are missing', () => {
    const { container } = render(<Variants />)
    expect(container.firstChild).toBe(null)
  })

  describe('segment variants', () => {
    let segment

    beforeEach(() => {
      segment = { variants: ['direction', 'public-transit-asphalt'] }
      getSegmentInfo.mockImplementation(() => segment)
      getSegmentVariantInfo.mockImplementation(() => ({
        elevation: 0
      }))
    })

    it('renders segment buttons', () => {
      const { asFragment } = render(
        <Variants type={INFO_BUBBLE_TYPE_SEGMENT} position={0} />,
        { initialState }
      )

      expect(asFragment()).toMatchSnapshot()
    })

    it('handles switching segment variant', async () => {
      const { store } = render(
        <Variants type={INFO_BUBBLE_TYPE_SEGMENT} position={0} />,
        { initialState }
      )

      await act(async () => {
        await userEvent.click(screen.getByTitle('Outbound'))
      })
      expect(store.getState().street.segments[0].variant.direction).toBe(
        'outbound'
      )
      expect(
        store.getState().street.segments[0].variant['public-transit-asphalt']
      ).toBe('regular')
    })
  })

  describe('building variants', () => {
    it('handles switching left building', async () => {
      const { store } = render(
        <Variants type={INFO_BUBBLE_TYPE_LEFT_BUILDING} position="left" />,
        { initialState }
      )

      await act(async () => {
        await userEvent.click(screen.getByTitle('Waterfront'))
      })
      expect(store.getState().street.leftBuildingVariant).toBe('waterfront')
    })

    it('handles switching right building', async () => {
      const { store } = render(
        <Variants type={INFO_BUBBLE_TYPE_RIGHT_BUILDING} position="right" />,
        { initialState }
      )

      await act(async () => {
        await userEvent.click(screen.getByTitle('Waterfront'))
      })
      expect(store.getState().street.rightBuildingVariant).toBe('waterfront')
    })
  })

  describe('feature flag', () => {
    let segment

    beforeEach(() => {
      segment = { variants: ['flagged-variant', 'foo'] }
      getSegmentInfo.mockImplementation(() => segment)
    })

    it('renders a button if flag is true', () => {
      render(<Variants type={INFO_BUBBLE_TYPE_SEGMENT} position={0} />, {
        initialState: {
          ...initialState,
          flags: {
            FLAGGED_VARIANT: {
              value: true
            }
          }
        }
      })

      expect(screen.getByTitle('Flagged variant')).toBeInTheDocument()
    })

    it('does not render a button if flag is false', () => {
      render(<Variants type={INFO_BUBBLE_TYPE_SEGMENT} position={0} />, {
        initialState: {
          ...initialState,
          flags: {
            FLAGGED_VARIANT: {
              value: false
            }
          }
        }
      })

      expect(screen.queryByTitle('Flagged variant')).not.toBeInTheDocument()
    })
  })
})
