import React from 'react'
import { vi } from 'vitest'

import { render } from '~/test/helpers/render'
import AnalyticsDialog from './AnalyticsDialog'

// Provide mock capacity data to prevent changes in production data from
// breaking the expected values of this test
vi.mock('../../segments/capacity_data.json', () => ({
  default: require('../../segments/__mocks__/capacity_data.json')
}))

const initialState = {
  locale: {
    locale: 'en'
  },
  street: {
    segments: [
      {
        type: 'baz',
        warnings: []
      },
      // Include two segments (both should be added)
      {
        type: 'foo',
        warnings: []
      },
      {
        type: 'foo',
        warnings: []
      },
      // Include a segment without capacity (adds zero)
      {
        type: 'bar',
        warnings: []
      },
      // Include a segment with warnings (adds zero)
      {
        type: 'baz',
        warnings: [false, true, false, false]
      }
    ]
  }
}

describe('AnalyticsDialog', () => {
  it('renders snapshot', () => {
    const wrapper = render(<AnalyticsDialog />, {
      initialState
    })
    expect(wrapper.asFragment()).toMatchSnapshot()
  })
})
