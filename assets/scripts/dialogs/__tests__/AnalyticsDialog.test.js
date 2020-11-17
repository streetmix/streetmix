/* eslint-env jest */
import React from 'react'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import AnalyticsDialog from '../AnalyticsDialog'

// Provide mock capacity data to prevent changes in production data from
// breaking the expected values of this test
jest.mock('../../segments/capacity.json', () =>
  require('../../segments/__mocks__/capacity.json')
)

const initialState = {
  locale: {
    locale: 'en'
  },
  street: {
    segments: [
      {
        type: 'baz'
      },
      // Include two segments (both should be added)
      {
        type: 'foo'
      },
      {
        type: 'foo'
      },
      // Include a segment without capacity (adds zero)
      {
        type: 'bar'
      },
      // Include a segment with warnings (adds zero)
      {
        type: 'baz',
        warnings: [null, true, false, false]
      }
    ]
  }
}

describe('AnalyticsDialog', () => {
  it('renders snapshot', () => {
    const wrapper = renderWithReduxAndIntl(<AnalyticsDialog />, {
      initialState
    })
    expect(wrapper.asFragment()).toMatchSnapshot()
  })
})
