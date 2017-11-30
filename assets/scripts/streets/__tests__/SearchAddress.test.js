/* eslint-env jest */
import React from 'react'
import ReactDOM from 'react-dom'
import { mount } from 'enzyme'
import { SearchAddress } from '../SearchAddress'

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

describe('SearchAddress', () => {
  // This is a good "smoke test" to make sure the component doesn't
  // import other modules with side effects.
  it('renders without crashing', () => {
    const div = document.createElement('div')
    ReactDOM.render(<SearchAddress />, div)
  })

  it('focuses the input after mounting', () => {
    const component = mount(<SearchAddress />)

    // Not referential equality
    expect(component.find('input').instance().className).toEqual('react-autosuggest__input')
  })

  it('displays a "clear search" button when there is input', () => {
    const component = mount(<SearchAddress />)
    const input = component.find('input')

    // The close button should not render when the input is empty
    const close1 = component.find('.geolocate-input-clear')
    expect(close1.exists()).toEqual(false)

    // Simulates input, which should also trigger events
    input.simulate('change', { target: { value: 'f' } })

    // The close button should appear after one keystroke
    const close2 = component.find('.geolocate-input-clear')
    expect(close2.exists()).toEqual(true)

    // Deletes input
    input.simulate('change', { target: { value: '' } })

    // The close button should now disappear
    const close3 = component.find('.geolocate-input-clear')
    expect(close3.exists()).toEqual(false)
  })

  it('puts a title attribute on the "clear search" button', () => {
    window.fetch = mapzenSearchMock

    const component = mount(<SearchAddress />)
    component.find('input').simulate('change', { target: { value: 'foo' } })

    const el = component.find('.geolocate-input-clear')
    expect(el.instance().getAttribute('title')).toEqual('Clear search')
  })

  it('clears and focuses input when "clear search" button is clicked', () => {
    window.fetch = mapzenSearchMock

    const component = mount(<SearchAddress />)
    const input = component.find('input')

    // Simulates input
    input.simulate('change', { target: { value: 'foo' } })

    // Simulates click on "clear search"
    component.find('.geolocate-input-clear').simulate('click')

    // The close button should be undefined now
    expect(component.find('.geolocate-input-clear').exists()).toEqual(false)

    // The input should be empty and it should be focused
    expect(input.instance().value).toEqual('')
    expect(input.instance()).toEqual(document.activeElement)
  })

  it('makes autocomplete requests for each input keystroke', () => {
    // We need a new instance of mapzenSearchMock so that the number
    // of times it's called is reset
    window.fetch = mapzenSearchMock

    const component = mount(<SearchAddress />)
    const input = component.find('input')

    // Spy on search
    component.instance().search = jest.fn(component.instance().search)
    component.instance().autocomplete = jest.fn(component.instance().autocomplete)

    // Simulates input - should not make an autocomplete request until
    // after input value is greater than 2 characters.
    input.simulate('change', { target: { value: 'f' } })
    expect(component.instance().search).toHaveBeenCalledTimes(0)
    expect(component.instance().autocomplete).toHaveBeenCalledTimes(0)

    // Makes one autocomplete call on the second letter
    input.simulate('change', { target: { value: 'fo' } })
    expect(component.instance().search).toHaveBeenCalledTimes(0)
    expect(component.instance().autocomplete).toHaveBeenCalledTimes(1)
  })

  it('makes a search request when the enter key is pressed', () => {
    window.fetch = mapzenSearchMock

    const component = mount(<SearchAddress />)

    // Spy on search
    component.instance().search = jest.fn(component.instance().search)
    component.instance().autocomplete = jest.fn(component.instance().autocomplete)

    // Set value of input
    component.setState({ value: 'baz' })

    // The `.simulate()` method does not actually create and fire events.
    // It runs event handlers directly, and we do not actually perform a search
    // by listening for a keydown event. So instead of simulating the "Enter"
    // key we simulate the form submittal instead. (This isn't ideal because
    // we may change the implementation in the future, which is also why
    // we are not calling the `.onSubmit()` directly either.)
    component.find('form').simulate('submit')

    // Search should be called, but autocomplete should not
    expect(component.instance().search).toHaveBeenCalledTimes(1)
    expect(component.instance().autocomplete).toHaveBeenCalledTimes(0)
  })

  describe('react-autosuggest integration', () => {
    it('returns feature label for getSuggestionValue()', () => {
      const component = mount(<SearchAddress />)
      const value = component.instance().getSuggestionValue({ properties: { label: 'foo' } })
      expect(value).toEqual('foo')
    })
  })
})
