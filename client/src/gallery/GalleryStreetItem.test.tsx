import { vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { render } from '~/test/helpers/render.js'
import { MOCK_STREET } from '~/test/fixtures'
import { GalleryStreetItem } from './GalleryStreetItem.js'

// Mock dependencies
vi.mock('../streets/thumbnail.js', () => ({
  drawStreetThumbnail: vi.fn(),
}))

const baseProps = {
  street: MOCK_STREET,
  showStreetOwner: true,
  selected: false,
  allowDelete: true,
  doSelect: () => {},
  doDelete: () => {},
}

describe('GalleryStreetItem', () => {
  it('renders', () => {
    // This uses jsdom + canvas packages under the hood to render
    const { asFragment } = render(<GalleryStreetItem {...baseProps} />)
    expect(asFragment()).toMatchSnapshot()
  })

  it('does not display street owner when we ask it not to', () => {
    render(<GalleryStreetItem {...baseProps} showStreetOwner={false} />)

    expect(screen.queryByText(MOCK_STREET.creatorId!)).not.toBeInTheDocument()
  })

  it('displays "Unnamed St" without a street name', () => {
    render(
      <GalleryStreetItem
        {...baseProps}
        street={{
          ...MOCK_STREET,
          name: null,
        }}
      />
    )

    expect(screen.getByText('Unnamed St')).toBeInTheDocument()
  })

  it('displays "Anonymous" for anonymous streets', async () => {
    render(
      <GalleryStreetItem
        {...baseProps}
        street={{
          ...MOCK_STREET,
          creatorId: null,
        }}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Anonymous')).toBeInTheDocument()
    })
  })

  it('handles select', async () => {
    const doSelect = vi.fn()
    render(<GalleryStreetItem {...baseProps} doSelect={doSelect} />)

    await userEvent.click(screen.getByText(MOCK_STREET.name!))
    expect(doSelect).toBeCalled()
  })

  it('handles delete when confirmed', async () => {
    const doDelete = vi.fn()
    window.confirm = vi.fn(() => true)

    render(<GalleryStreetItem {...baseProps} doDelete={doDelete} />)

    await userEvent.click(screen.getByTitle('Delete street'))
    expect(doDelete).toBeCalled()
  })

  it('does not delete when confirmation is cancelled', async () => {
    const doDelete = vi.fn()
    window.confirm = vi.fn(() => false)

    render(<GalleryStreetItem {...baseProps} doDelete={doDelete} />)

    await userEvent.click(screen.getByTitle('Delete street'))
    expect(doDelete).not.toBeCalled()
  })
})
