/* eslint-env jest */
import React from 'react'
import StreetMetaDate from '../StreetMetaDate'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'

describe('StreetMetaDate', () => {
  it('renders', () => {
    const { getByText } = renderWithReduxAndIntl(<StreetMetaDate />, {
      initialState: {
        street: {
          updatedAt: '2014-01-18T12:00:00.000Z'
        }
      }
    })

    expect(getByText('January 18, 2014')).toBeInTheDocument()
  })

  it('renders nothing if there is no updated timestamp', () => {
    const { container } = renderWithReduxAndIntl(<StreetMetaDate />, {
      initialState: {
        street: {}
      }
    })

    expect(container.firstChild).toBe(null)
  })
})
