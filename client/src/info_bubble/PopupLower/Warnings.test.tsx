import { render } from '~/test/helpers/render.js'
import { Warnings } from './Warnings.js'

const dummySlice = {
  id: 'slice-id',
  type: 'NONE',
}

describe('Warnings', () => {
  it('renders out of bounds warning', () => {
    const initialState = {
      warnings: {
        slices: { 'slice-id': { outOfBounds: true } },
      },
    }
    const { container } = render(<Warnings slice={dummySlice} />, {
      initialState,
    })
    expect(container).toHaveTextContent('This doesn’t fit within the street.')
  })

  it('renders too narrow warning', () => {
    const initialState = {
      warnings: {
        slices: { 'slice-id': { tooNarrow: true } },
      },
    }
    const { container } = render(<Warnings slice={dummySlice} />, {
      initialState,
    })
    expect(container).toHaveTextContent('This may not be wide enough.')
  })

  it('renders too wide warning', () => {
    const initialState = {
      warnings: {
        slices: { 'slice-id': { tooWide: true } },
      },
    }
    const { container } = render(<Warnings slice={dummySlice} />, {
      initialState,
    })
    expect(container).toHaveTextContent('This may be too wide.')
  })

  it('renders two warnings', () => {
    const initialState = {
      warnings: {
        slices: {
          'slice-id': {
            outOfBounds: true,
            tooWide: true,
            tooNarrow: false,
          },
        },
      },
    }
    const { container } = render(<Warnings slice={dummySlice} />, {
      initialState,
    })

    expect(container).toHaveTextContent('This doesn’t fit within the street.')
    expect(container).toHaveTextContent('This may be too wide.')
    expect(container).not.toHaveTextContent('This may not be wide enough.')
  })

  it('renders three warnings', () => {
    const initialState = {
      warnings: {
        slices: {
          'slice-id': {
            outOfBounds: true,
            tooWide: true,
            tooNarrow: true,
          },
        },
      },
    }

    const { container } = render(<Warnings slice={dummySlice} />, {
      initialState,
    })

    expect(container).toHaveTextContent('This doesn’t fit within the street.')
    expect(container).toHaveTextContent('This may be too wide.')
    expect(container).toHaveTextContent('This may not be wide enough.')
  })

  it('renders no warnings', () => {
    const initialState = {
      warnings: {
        slices: {
          'slice-id': {},
        },
      },
    }

    const { container } = render(<Warnings slice={dummySlice} />, {
      initialState,
    })

    expect(container).not.toHaveTextContent(
      'This doesn’t fit within the street.'
    )
    expect(container).not.toHaveTextContent('This may be too wide.')
    expect(container).not.toHaveTextContent('This may not be wide enough.')
  })

  it('renders nothing if segment is not defined', () => {
    const slice = undefined
    const { container } = render(<Warnings slice={slice} />)

    expect(container).not.toHaveTextContent(
      'This doesn’t fit within the street.'
    )
    expect(container).not.toHaveTextContent('This may be too wide.')
    expect(container).not.toHaveTextContent('This may not be wide enough.')
  })
})
