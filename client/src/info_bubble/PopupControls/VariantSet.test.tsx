import { vi, type Mock } from 'vitest'
import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { getSegmentInfo } from '@streetmix/parts'

import { render } from '~/test/helpers/render.js'
import { VariantSet } from './VariantSet.js'

import type { SegmentDefinition } from '@streetmix/types'

// Enable mocking of the return value of `getSegmentInfo`
vi.mock('@streetmix/parts', () => {
  return {
    getSegmentInfo: vi.fn(),
    getSegmentVariantInfo: vi.fn().mockReturnValue({
      elevation: 0,
    }),
  }
})

// Provide mock variant icons so that we can test icons with `enabledWithFlag`
vi.mock(
  '../../segments/variant_icons.yaml',
  async () => await import('../../segments/__mocks__/variant_icons.yaml')
)

describe('VariantSet', () => {
  const initialState = {
    street: {
      width: 10,
      boundary: {
        left: {
          variant: 'residential',
        },
        right: {
          variant: 'residential',
        },
      },
      segments: [
        {
          width: 3,
          variant: {
            direction: 'inbound',
            'public-transit-asphalt': 'regular',
          },
          variantString: 'inbound|regular',
          type: 'streetcar',
        },
      ],
    },
  }

  describe('segment variants', () => {
    let segment: Partial<SegmentDefinition>

    beforeEach(() => {
      segment = { variants: ['direction', 'public-transit-asphalt'] }
      ;(getSegmentInfo as Mock).mockImplementation(() => segment)
    })

    it('renders segment buttons', () => {
      const { asFragment } = render(<VariantSet type="slice" position={0} />, {
        initialState,
      })

      expect(asFragment()).toMatchSnapshot()
    })

    it('handles switching segment variant', async () => {
      const { store } = render(<VariantSet type="slice" position={0} />, {
        initialState,
      })

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
      const { store } = render(<VariantSet type="boundary" position="left" />, {
        initialState,
      })

      await userEvent.click(screen.getByTestId('Waterfront'))
      expect(store.getState().street.boundary.left.variant).toBe('waterfront')
    })

    it('handles switching right building', async () => {
      const { store } = render(
        <VariantSet type="boundary" position="right" />,
        {
          initialState,
        }
      )

      await userEvent.click(screen.getByTestId('Waterfront'))
      expect(store.getState().street.boundary.right.variant).toBe('waterfront')
    })
  })

  describe('feature flag', () => {
    let segment: Partial<SegmentDefinition>

    beforeEach(() => {
      segment = { variants: ['flagged-variant'] }
      ;(getSegmentInfo as Mock).mockImplementation(() => segment)
    })

    it('renders a button if flag is true', () => {
      render(<VariantSet type="slice" position={0} />, {
        initialState: {
          ...initialState,
          flags: {
            FLAGGED_VARIANT: {
              value: true,
            },
          },
        },
      })

      expect(screen.getByTestId('Flagged variant')).toBeInTheDocument()
    })

    it('does not render a button if flag is false', () => {
      render(<VariantSet type="slice" position={0} />, {
        initialState: {
          ...initialState,
          flags: {
            FLAGGED_VARIANT: {
              value: false,
            },
          },
        },
      })

      expect(screen.queryByTestId('Flagged variant')).not.toBeInTheDocument()
    })
  })
})
