import React from 'react'
import { vi } from 'vitest'
import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { render } from '~/test/helpers/render'
import { getSegmentInfo, getSegmentVariantInfo } from '~/src/segments/info'
import {
  INFO_BUBBLE_TYPE_SEGMENT,
  INFO_BUBBLE_TYPE_LEFT_BUILDING,
  INFO_BUBBLE_TYPE_RIGHT_BUILDING
} from '../constants'
import Variants from './Variants'

import type { SegmentDefinition } from '@streetmix/types'

// Enable mocking of the return value of `getSegmentInfo`
vi.mock('../../segments/info')

// Provide mock variant icons so that we can test icons with `enabledWithFlag`
vi.mock(
  '../../segments/variant_icons.yaml',
  async () => await import('../../segments/__mocks__/variant_icons.yaml')
)

describe('Variants', () => {
  const initialState = {
    street: {
      boundary: {
        left: {
          variant: 'residential'
        },
        right: {
          variant: 'residential'
        }
      },
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

  describe('segment variants', () => {
    let segment: Partial<SegmentDefinition>

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

      await userEvent.click(screen.getByTestId('Outbound'))
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

      await userEvent.click(screen.getByTestId('Waterfront'))
      expect(store.getState().street.boundary.left.variant).toBe('waterfront')
    })

    it('handles switching right building', async () => {
      const { store } = render(
        <Variants type={INFO_BUBBLE_TYPE_RIGHT_BUILDING} position="right" />,
        { initialState }
      )

      await userEvent.click(screen.getByTestId('Waterfront'))
      expect(store.getState().street.boundary.right.variant).toBe('waterfront')
    })
  })

  describe('feature flag', () => {
    let segment: Partial<SegmentDefinition>

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

      expect(screen.getByTestId('Flagged variant')).toBeInTheDocument()
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

      expect(screen.queryByTestId('Flagged variant')).not.toBeInTheDocument()
    })
  })
})
