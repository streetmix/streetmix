import { vi, type Mock } from 'vitest'
import { getSegmentInfo, getSegmentVariantInfo } from '@streetmix/parts'

import store from '../store'
import { changeSegmentProperties } from '../store/slices/street'
import { formatMessage } from '../locales/locale'
import { getBoundaryItem } from '../boundary'
import { getLocaleSliceName, editSliceLabel, getLabel } from './labels'
import { segmentsChanged } from './view'

import type { BoundaryPosition, SliceItem, StreetJson } from '@streetmix/types'

// Mock dependencies
vi.mock('@streetmix/parts', () => ({
  getSegmentInfo: vi.fn().mockImplementation((type) => ({
    name: 'Default slice name',
    nameKey: `${type}-key`,
  })),
  getSegmentVariantInfo: vi.fn().mockImplementation((type, variant) => ({
    name: 'Default variant name',
    nameKey: `${type}-${variant}`,
  })),
}))

vi.mock('../locales/locale', () => ({
  formatMessage: vi.fn((key: string, fallback: string) => fallback),
}))

vi.mock('../store', () => ({
  default: {
    dispatch: vi.fn(),
    getState: vi.fn(),
  },
}))

vi.mock('../boundary', () => ({
  getBoundaryItem: vi.fn((_type: string) => ({
    label: 'Boundary name',
  })),
}))

vi.mock('./view', () => ({
  segmentsChanged: vi.fn(),
}))

describe('labels', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getLocaleSliceName', () => {
    it('returns variant name when variant has name', () => {
      const result = getLocaleSliceName('segment-type', 'variant-string')

      expect(result).toBe('Default variant name')
    })

    it('returns segment name when variant does not have name', () => {
      ;(getSegmentVariantInfo as Mock).mockReturnValueOnce({
        name: undefined,
        nameKey: undefined,
      })

      const result = getLocaleSliceName('segment-type', 'variant-string')

      expect(result).toBe('Default slice name')
    })
  })

  describe('editSliceLabel', () => {
    const mockSlice = {
      type: 'segment-type',
      variantString: 'variant-string',
      label: undefined,
    } as SliceItem

    it('does nothing when prompt is canceled (returns null)', () => {
      global.prompt = vi.fn().mockReturnValue(null)

      editSliceLabel(0, mockSlice)

      expect(global.prompt).toHaveBeenCalled()
      expect(store.dispatch).not.toHaveBeenCalled()
      expect(segmentsChanged).not.toHaveBeenCalled()
    })

    it('updates label when prompt returns a new value', () => {
      const position = 1
      const newLabel = 'New label'

      global.prompt = vi.fn().mockReturnValue(newLabel)

      editSliceLabel(position, mockSlice)

      expect(global.prompt).toHaveBeenCalled()
      expect(store.dispatch).toHaveBeenCalledWith(
        changeSegmentProperties(position, { label: newLabel })
      )
      expect(segmentsChanged).toHaveBeenCalled()
    })

    it('uses existing label as prompt default value', () => {
      const position = 2
      const existingLabel = 'Existing label'
      const sliceWithLabel = { ...mockSlice, label: existingLabel }

      global.prompt = vi.fn().mockReturnValue('New label')

      editSliceLabel(position, sliceWithLabel)

      expect(global.prompt).toHaveBeenCalledWith(
        expect.any(String),
        existingLabel
      )
    })

    it('uses default locale name when slice has no label', () => {
      const position = 3
      const defaultName = 'Default locale name'

      global.prompt = vi.fn().mockReturnValue('New label')
      ;(formatMessage as Mock).mockReturnValueOnce(defaultName)

      editSliceLabel(position, mockSlice)

      expect(global.prompt).toHaveBeenCalledWith(
        expect.any(String),
        defaultName
      )
    })

    it('normalizes label by trimming whitespace', () => {
      const position = 4

      global.prompt = vi.fn().mockReturnValue('  Trimmed label  ')

      editSliceLabel(position, mockSlice)

      expect(store.dispatch).toHaveBeenCalledWith(
        changeSegmentProperties(position, { label: 'Trimmed label' })
      )
    })

    it('sets label to undefined when prompt returns empty string', () => {
      const position = 5
      const existingLabel = 'Existing label'
      const sliceWithLabel = { ...mockSlice, label: existingLabel }

      global.prompt = vi.fn().mockReturnValue('')

      editSliceLabel(position, sliceWithLabel)

      expect(store.dispatch).toHaveBeenCalledWith(
        changeSegmentProperties(position, { label: undefined })
      )
    })

    it('truncates label longer than MAX_LABEL_LENGTH', () => {
      const position = 6
      const longLabel = 'a'.repeat(60)

      global.prompt = vi.fn().mockReturnValue(longLabel)

      editSliceLabel(position, mockSlice)

      expect(store.dispatch).toHaveBeenCalledWith(
        changeSegmentProperties(position, {
          label: 'a'.repeat(50) + '…',
        })
      )
    })

    it('does not update when normalized label equals previous label', () => {
      const position = 7
      const existingLabel = 'Existing label'
      const sliceWithLabel = { ...mockSlice, label: existingLabel }

      global.prompt = vi.fn().mockReturnValue('  Existing label  ')

      editSliceLabel(position, sliceWithLabel)

      expect(store.dispatch).not.toHaveBeenCalled()
      expect(segmentsChanged).not.toHaveBeenCalled()
    })
  })

  describe('getLabel', () => {
    const mockStreet: StreetJson = {
      segments: [
        {
          type: 'slice1',
          variantString: 'variant1',
          label: 'Custom label',
        } as SliceItem,
        {
          type: 'slice2',
          variantString: 'variant2',
          label: undefined,
        } as SliceItem,
      ],
      boundary: {
        left: {
          variant: 'residential',
        },
        right: {
          variant: 'commercial',
        },
      },
    } as StreetJson

    describe('for slices', () => {
      it('returns custom label when slice has label', () => {
        const position = 0
        const slice = mockStreet.segments[position]

        const result = getLabel(mockStreet, 'slice', position)

        expect(result).toBe(slice.label)
      })

      it('returns locale name when slice has no label', () => {
        const position = 1
        const slice = mockStreet.segments[position]

        const result = getLabel(mockStreet, 'slice', position)

        expect(result).toBe('Default variant name')
        expect(getSegmentInfo).toHaveBeenCalledWith(slice.type)
        expect(getSegmentVariantInfo).toHaveBeenCalledWith(
          slice.type,
          slice.variantString
        )
      })
    })

    describe('for boundaries', () => {
      it('returns formatted boundary label for left position', () => {
        const result = getLabel(mockStreet, 'boundary', 'left')

        expect(getBoundaryItem).toHaveBeenCalledWith(
          mockStreet.boundary.left.variant
        )
        expect(result).toBe('Boundary name')
      })

      it('returns formatted boundary label for right position', () => {
        const result = getLabel(mockStreet, 'boundary', 'right')

        expect(getBoundaryItem).toHaveBeenCalledWith(
          mockStreet.boundary.right.variant
        )
        expect(result).toBe('Boundary name')
      })
    })

    it('returns empty string for invalid type/position combinations', () => {
      const result1 = getLabel(mockStreet, 'slice', 'left' as unknown as number)
      expect(result1).toBe('')

      const result2 = getLabel(
        mockStreet,
        'boundary',
        0 as unknown as BoundaryPosition
      )
      expect(result2).toBe('')
    })
  })
})
