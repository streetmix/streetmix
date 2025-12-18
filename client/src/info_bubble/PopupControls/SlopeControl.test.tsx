import { vi, type Mock } from 'vitest'
import { userEvent } from '@testing-library/user-event'
import { getSegmentVariantInfo } from '@streetmix/parts'

import { render } from '~/test/helpers/render.js'
import { toggleSliceSlope } from '~/src/store/slices/street.js'
import { SlopeControl } from './SlopeControl.js'

vi.mock('@streetmix/parts', () => ({
  getSegmentVariantInfo: vi.fn((_type) => ({})),
}))
vi.mock('~/src/store/slices/street.js', async (importOriginal) => {
  const actual = await importOriginal<Record<string, () => unknown>>()
  return {
    ...actual,
    toggleSliceSlope: vi.fn(() => ({ type: 'MOCK_ACTION' })),
  }
})

const initialState = {
  street: {
    segments: [
      // Slice `0` is not sloped
      {
        type: 'foo',
        slope: {
          on: false,
        },
      },
      // Slice `1` is sloped
      {
        type: 'bar',
        slope: {
          on: true,
        },
      },
    ],
  },
}

describe('SlopeControl', () => {
  it('enables control when rule is `path`', () => {
    ;(getSegmentVariantInfo as Mock).mockReturnValueOnce({
      slope: 'path',
    })

    const { getByRole } = render(<SlopeControl position={0} />, {
      initialState,
    })

    const control = getByRole('switch')
    expect(control).toBeEnabled()
    expect(control).not.toBeChecked()
  })

  it('enables control when rule is `berm`', () => {
    ;(getSegmentVariantInfo as Mock).mockReturnValueOnce({
      slope: 'berm',
    })

    const { getByRole } = render(<SlopeControl position={0} />, {
      initialState,
    })

    const control = getByRole('switch')
    expect(control).toBeEnabled()
    expect(control).not.toBeChecked()
  })

  it('shows toggled control when rule is `path`', () => {
    ;(getSegmentVariantInfo as Mock).mockReturnValueOnce({
      slope: 'path',
    })

    const { getByRole } = render(<SlopeControl position={1} />, {
      initialState,
    })

    const control = getByRole('switch')
    expect(control).toBeEnabled()
    expect(control).toBeChecked()
  })

  it('shows toggled control when rule is `berm`', () => {
    ;(getSegmentVariantInfo as Mock).mockReturnValueOnce({
      slope: 'berm',
    })

    const { getByRole } = render(<SlopeControl position={1} />, {
      initialState,
    })

    const control = getByRole('switch')
    expect(control).toBeEnabled()
    expect(control).toBeChecked()
  })

  it('dispatches an action on control interaction', async () => {
    ;(getSegmentVariantInfo as Mock).mockReturnValueOnce({
      slope: 'path',
    })

    const { getByRole } = render(<SlopeControl position={0} />, {
      initialState,
    })

    const control = getByRole('switch')

    await userEvent.click(control)
    expect(toggleSliceSlope).toBeCalled()
  })

  it('disables control when rule is `off`', () => {
    ;(getSegmentVariantInfo as Mock).mockReturnValueOnce({
      rules: {
        slope: 'off',
      },
    })

    const { getByRole } = render(<SlopeControl position={1} />, {
      initialState,
    })

    const control = getByRole('switch')
    expect(control).toBeDisabled()

    // Control should not be toggled on in this scenario, even if the slice
    // data says it's on
    expect(control).not.toBeChecked()
  })

  it('disables control when rule is not defined', () => {
    const { getByRole } = render(<SlopeControl position={1} />, {
      initialState,
    })

    const control = getByRole('switch')
    expect(control).toBeDisabled()

    // Control should not be toggled on in this scenario, even if the slice
    // data says it's on
    expect(control).not.toBeChecked()
  })
})
