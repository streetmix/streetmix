/* eslint-env jest */
import React from 'react'
import { cleanup, fireEvent } from '@testing-library/react'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import GalleryStreetItem from '../GalleryStreetItem'

// Mock dependencies
jest.mock('../thumbnail', () => ({
  drawStreetThumbnail: jest.fn()
}))
jest.mock('../../app/page_url', () => ({
  getStreetUrl: jest.fn()
}))

const MOCK_STREET_DATA = {
  name: 'Street Name',
  data: {},
  creatorId: 'creatorFoo',
  updatedAt: '2018-04-27T20:47:03.477Z'
}

describe('GalleryStreetItem', () => {
  afterEach(cleanup)

  it('renders', () => {
    // This uses jsdom + canvas packages under the hood to render canvas element
    const wrapper = renderWithReduxAndIntl(
      <GalleryStreetItem street={MOCK_STREET_DATA} />
    )
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('does not display street owner when not provided', () => {
    const wrapper = renderWithReduxAndIntl(
      <GalleryStreetItem
        street={MOCK_STREET_DATA}
        showStreetOwner={false}
      />
    )

    expect(wrapper.queryByText('creatorFoo')).not.toBeInTheDocument()
  })

  it('handles select', () => {
    const doSelect = jest.fn()
    const wrapper = renderWithReduxAndIntl(
      <GalleryStreetItem
        street={MOCK_STREET_DATA}
        doSelect={doSelect}
      />
    )

    fireEvent.click(wrapper.getByText('Street Name'))
    expect(doSelect).toBeCalled()
  })

  it('handles delete when confirmed', () => {
    const doDelete = jest.fn()
    window.confirm = jest.fn(() => true)

    const wrapper = renderWithReduxAndIntl(
      <GalleryStreetItem
        street={MOCK_STREET_DATA}
        doDelete={doDelete}
        allowDelete
      />
    )

    fireEvent.click(wrapper.getByTitle('Delete street'))
    expect(doDelete).toBeCalled()
  })

  it('does not delete when confirmation is cancelled', () => {
    const doDelete = jest.fn()
    window.confirm = jest.fn(() => false)

    const wrapper = renderWithReduxAndIntl(
      <GalleryStreetItem
        street={MOCK_STREET_DATA}
        doDelete={doDelete}
        allowDelete
      />
    )

    fireEvent.click(wrapper.getByTitle('Delete street'))
    expect(doDelete).not.toBeCalled()
  })
})
