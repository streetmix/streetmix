import { render } from '~/test/helpers/render.js'
import { Warnings } from './Warnings.js'

describe('Warnings', () => {
  it('renders out of bounds warning', () => {
    const segment = {
      warnings: {
        outOfBounds: true,
      },
    }
    const { container } = render(<Warnings segment={segment} />)
    expect(container).toHaveTextContent('This doesn’t fit within the street.')
  })

  it('renders too narrow warning', () => {
    const segment = {
      warnings: {
        tooNarrow: true,
      },
    }
    const { container } = render(<Warnings segment={segment} />)
    expect(container).toHaveTextContent('This may not be wide enough.')
  })

  it('renders too wide warning', () => {
    const segment = {
      warnings: {
        tooWide: true,
      },
    }
    const { container } = render(<Warnings segment={segment} />)
    expect(container).toHaveTextContent('This may be too wide.')
  })

  it('renders two warnings', () => {
    const segment = {
      warnings: {
        outOfBounds: true,
        tooWide: true,
        tooNarrow: false,
      },
    }
    const { container } = render(<Warnings segment={segment} />)

    expect(container).toHaveTextContent('This doesn’t fit within the street.')
    expect(container).toHaveTextContent('This may be too wide.')
    expect(container).not.toHaveTextContent('This may not be wide enough.')
  })

  it('renders three warnings', () => {
    const segment = {
      warnings: {
        outOfBounds: true,
        tooWide: true,
        tooNarrow: true,
      },
    }
    const { container } = render(<Warnings segment={segment} />)

    expect(container).toHaveTextContent('This doesn’t fit within the street.')
    expect(container).toHaveTextContent('This may be too wide.')
    expect(container).toHaveTextContent('This may not be wide enough.')
  })

  it('renders no warnings', () => {
    const segment = {
      warnings: {
        outOfBounds: false,
        tooWide: false,
        tooNarrow: false,
      },
    }
    const { container } = render(<Warnings segment={segment} />)

    expect(container).not.toHaveTextContent(
      'This doesn’t fit within the street.'
    )
    expect(container).not.toHaveTextContent('This may be too wide.')
    expect(container).not.toHaveTextContent('This may not be wide enough.')
  })

  it('renders nothing if segment is not defined', () => {
    const segment = undefined
    const { container } = render(<Warnings segment={segment} />)

    expect(container).not.toHaveTextContent(
      'This doesn’t fit within the street.'
    )
    expect(container).not.toHaveTextContent('This may be too wide.')
    expect(container).not.toHaveTextContent('This may not be wide enough.')
  })

  it('renders nothing if segment warnings is undefined', () => {
    const segment = {}
    const { container } = render(<Warnings segment={segment} />)

    expect(container).not.toHaveTextContent(
      'This doesn’t fit within the street.'
    )
    expect(container).not.toHaveTextContent('This may be too wide.')
    expect(container).not.toHaveTextContent('This may not be wide enough.')
  })
})
