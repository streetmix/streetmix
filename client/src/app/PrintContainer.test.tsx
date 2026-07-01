import { vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'

import { render } from '~/test/helpers/render.js'
import { PrintContainer } from './PrintContainer.js'

const { getStreetImageMock } = vi.hoisted(() => ({
  getStreetImageMock: vi.fn(),
}))

vi.mock('../streets/image.js', () => ({
  getStreetImage: getStreetImageMock,
}))

describe('PrintContainer', () => {
  beforeEach(() => {
    getStreetImageMock.mockReset()
    getStreetImageMock.mockResolvedValue({
      toDataURL: () => 'foo',
    })
  })

  it('renders', async () => {
    const { asFragment } = render(<PrintContainer />, {
      initialState: { app: { printing: false } },
    })

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot()
    })
  })

  it('displays the print image', async () => {
    let resolveImage
    const image = {
      toDataURL: vi.fn(() => 'foo'),
    }

    getStreetImageMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveImage = resolve
        })
    )

    render(<PrintContainer />, {
      initialState: { app: { printing: true } },
    })

    resolveImage(image)

    await waitFor(() => {
      expect(screen.getByRole('img')).toBeInTheDocument()
      expect(screen.getByRole('img')).toHaveAttribute('src', 'foo')
    })
    expect(image.toDataURL).toHaveBeenCalledWith('image/png')
    expect(screen.queryByText('Preparing print...')).not.toBeInTheDocument()
  })

  it('displays an error when street image generation fails', async () => {
    getStreetImageMock.mockRejectedValueOnce(new Error('Nope'))

    render(<PrintContainer />, {
      initialState: { app: { printing: true } },
    })

    await waitFor(() => {
      expect(screen.getByText('Could not load image')).toBeInTheDocument()
    })
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('does nothing when the image request is cancelled on unmount', async () => {
    let resolveImage
    const image = {
      toDataURL: vi.fn(() => 'foo'),
    }

    const pending = new Promise((resolve) => {
      resolveImage = resolve
    })

    getStreetImageMock.mockReturnValueOnce(pending)

    const { unmount } = render(<PrintContainer />, {
      initialState: { app: { printing: true } },
    })

    unmount()
    resolveImage(image)
    await pending

    expect(image.toDataURL).not.toHaveBeenCalled()
  })
})
