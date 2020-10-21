/* eslint-env jest */
import React from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import WidthControl from '../WidthControl'

jest.mock('../../app/routing', () => {})

describe('WidthControl', () => {
  let activeElement, segment

  beforeEach(() => {
    activeElement = 0
    segment = {
      type: 'streetcar',
      variantString: 'inbound|regular',
      segmentType: 'streetcar',
      id: '1',
      width: 200
    }
  })

  it('renders', () => {
    const { asFragment } = renderWithReduxAndIntl(
      <WidthControl position={activeElement} />,
      {
        initialState: { street: { segments: [segment] } }
      }
    )
    expect(asFragment()).toMatchSnapshot()
  })

  describe('increase width', () => {
    it('increaeses store width', () => {
      const { store } = renderWithReduxAndIntl(
        <WidthControl position={activeElement} />,
        { initialState: { street: { segments: [segment], units: 1 } } }
      )
      userEvent.click(screen.getByTitle(/Increase width/i))
      expect(store.getState().street.segments[activeElement].width).toEqual(
        200.5
      )
    })
  })

  describe('decrease width', () => {
    it('decreaeses store width', () => {
      const { store } = renderWithReduxAndIntl(
        <WidthControl position={activeElement} />,
        { initialState: { street: { segments: [segment], units: 1 } } }
      )
      userEvent.click(screen.getByTitle(/Decrease width/i))
      expect(store.getState().street.segments[activeElement].width).toEqual(
        199.5
      )
    })
  })
})
