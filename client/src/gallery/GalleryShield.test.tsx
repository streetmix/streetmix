import { render } from '@testing-library/react'

import { GalleryShield } from './GalleryShield.js'

describe('GalleryShield', () => {
  it('renders nothing when gallery is not visible', () => {
    const { container } = render(
      <GalleryShield visible={false} onClick={() => {}} />
    )
    expect(container.firstChild).toBe(null)
  })

  // This rest of this component's functionality is covered
  // by parent component's tests.
})
