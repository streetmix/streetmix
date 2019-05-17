/* eslint-env jest */
import React from 'react'
import { mountWithIntl as mount } from '../../../../../test/helpers/intl-enzyme-test-helper.js'
import { GeoSearchWithIntl as GeoSearch } from '../GeoSearch'

import autocompleteResponse from './fixtures/autocomplete.json'
import searchResponse from './fixtures/search.json'

// Mocks an Mapzen Search request
const mapzenSearchMock = jest.fn(url => {
  let response
  if (url.indexOf('/autocomplete?') > 0) {
    response = autocompleteResponse
  } else if (url.indexOf('/search?') > 0) {
    response = searchResponse
  }

  if (response) {
    return Promise.resolve(new window.Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-type': 'application/json'
      }
    }))
  } else {
    return Promise.resolve(new window.Response(undefined, {
      status: 500
    }))
  }
})

describe('GeoSearch', () => {
  window.fetch = mapzenSearchMock

  it('focuses the input after mounting', () => {
    const component = mount(<GeoSearch />)

    // Not referential equality
    expect(component.find('input').instance().className).toEqual('geotag-input')
  })

  it('displays a "clear search" button when there is input', () => {
    const component = mount(<GeoSearch />)
    const input = component.find('input')

    // The close button should not render when the input is empty
    const close1 = component.find('.geotag-input-clear')
    expect(close1.exists()).toEqual(false)

    // Simulates input, which should also trigger events
    input.simulate('change', { target: { value: 'f' } })

    // The close button should appear after one keystroke
    const close2 = component.find('.geotag-input-clear')
    expect(close2.exists()).toEqual(true)

    // Deletes input
    input.simulate('change', { target: { value: '' } })

    // The close button should now disappear
    const close3 = component.find('.geotag-input-clear')
    expect(close3.exists()).toEqual(false)
  })

  it('puts a title attribute on the "clear search" button', () => {
    const component = mount(<GeoSearch />)
    component.find('input').simulate('change', { target: { value: 'foo' } })

    const el = component.find('.geotag-input-clear')
    expect(el.instance().getAttribute('title')).toEqual('Clear search')
  })

  it('clears and focuses input when "clear search" button is clicked', () => {
    const component = mount(<GeoSearch />)
    const input = component.find('input')

    // Simulates input
    input.simulate('change', { target: { value: 'foo' } })

    // Simulates click on "clear search"
    component.find('.geotag-input-clear').simulate('click')

    // The close button should be undefined now
    expect(component.find('.geotag-input-clear').exists()).toEqual(false)

    // The input should be empty and it should be focused
    expect(input.instance().value).toEqual('')
    expect(input.instance()).toEqual(document.activeElement)
  })
})
