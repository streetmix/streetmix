import React from 'react'

import { render } from '~/test/helpers/render'
import InstanceBadge from './InstanceBadge'

describe('InstanceBadge', () => {
  it('renders nothing in standard conditions', () => {
    const { container } = render(<InstanceBadge />)
    expect(container.firstChild).toBe(null)
  })

  it('renders a specific label if given', () => {
    const { asFragment } = render(<InstanceBadge label="foo" />)
    expect(asFragment()).toMatchSnapshot()
  })
})
