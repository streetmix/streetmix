/* eslint-env jest */
import React from 'react'
import StreetMetaGeotag from '../StreetMetaGeotag'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'

describe('StreetMetaGeotag', () => {
  it('renders without crashing', () => {
    const { container } = renderWithReduxAndIntl(
      <StreetMetaGeotag.WrappedComponent street={{}} />
    )
    expect(container.childNodes).toBeDefined()
  })

  describe('geotag label', () => {
    it('does not indicate editability for location if read only', () => {
      const testStreet = {
        location: {
          hierarchy: {
            locality: 'foo',
            country: 'bar'
          }
        }
      }

      const { container } = renderWithReduxAndIntl(
        <StreetMetaGeotag.WrappedComponent
          street={testStreet}
          editable={false}
          enableLocation
          locale={{}}
        />
      )
      expect(
        container.querySelectorAll('.street-metadata-map a').length
      ).toEqual(0)
    })

    it('does not display geotag label if no location and application is read only', () => {
      const { container } = renderWithReduxAndIntl(
        <StreetMetaGeotag.WrappedComponent
          street={{}}
          editable={false}
          enableLocation
          locale={{}}
        />
      )
      expect(container.querySelectorAll('.street-metadata-map').length).toEqual(
        0
      )
    })

    it.todo('displays the correct label for a given location hierarchy')
    it.todo('displays a placeholder label if location hierarchy does not exist')
  })
})
