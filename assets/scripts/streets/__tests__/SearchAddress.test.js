import React from 'react'
import ReactDOM from 'react-dom'
import { SearchAddress } from '../SearchAddress'

describe('SearchAddress', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div')
    ReactDOM.render(<SearchAddress />, div)
  })
})
