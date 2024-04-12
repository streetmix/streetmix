import React from 'react'
import { render } from '../../test/helpers/render'
import StreetMetaDate from './StreetMetaDate'

describe('StreetMetaDate', () => {
  it('renders', () => {
    const { getByText } = render(<StreetMetaDate />, {
      initialState: {
        street: {
          updatedAt: '2014-01-18T12:00:00.000Z'
        }
      }
    })

    expect(getByText('January 18, 2014')).toBeInTheDocument()
  })

  it('renders nothing if there is no updated timestamp', () => {
    const { container } = render(<StreetMetaDate />, {
      initialState: {
        street: {}
      }
    })

    expect(container.firstChild).toBe(null)
  })
})
