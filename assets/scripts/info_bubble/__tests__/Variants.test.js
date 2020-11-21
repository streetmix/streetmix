/* eslint-env jest */
import React from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import Variants from '../Variants'
import { getSegmentInfo } from '../../segments/info'
import {
  INFO_BUBBLE_TYPE_SEGMENT,
  INFO_BUBBLE_TYPE_LEFT_BUILDING,
  INFO_BUBBLE_TYPE_RIGHT_BUILDING
} from '../constants'

// Enable mocking of the return value of `getSegmentInfo`
jest.mock('../../segments/info')

// Provide mock variant icons so that we can test icons with `enabledWithFlag`
jest.mock('../../segments/variant_icons.json', () =>
  require('../../segments/__mocks__/variant_icons.json')
)

describe('Variants', () => {
  const initialState = {
    street: {
      leftBuildingVariant: 'residential',
      rightBuildingVariant: 'residential',
      segments: [
        {
          variant: {
            direction: 'inbound',
            'public-transit-asphalt': 'regular'
          },
          variantString: 'inbound|regular',
          type: 'streetcar'
        }
      ]
    }
  }

  it('does not render if props are missing', () => {
    const { container } = renderWithReduxAndIntl(<Variants />)
    expect(container.firstChild).toBe(null)
  })

  describe('segment variants', () => {
    let segment

    beforeEach(() => {
      segment = { variants: ['direction', 'public-transit-asphalt'] } // coming from info.json
      getSegmentInfo.mockImplementation(() => segment)
    })

    it('renders segment buttons', () => {
      const { asFragment } = renderWithReduxAndIntl(
        <Variants type={INFO_BUBBLE_TYPE_SEGMENT} position={0} />,
        { initialState }
      )

      expect(asFragment()).toMatchSnapshot()
    })

    it('handles switching segment variant', () => {
      const { store } = renderWithReduxAndIntl(
        <Variants type={INFO_BUBBLE_TYPE_SEGMENT} position={0} />,
        { initialState }
      )
      userEvent.click(screen.getByTitle('Outbound'))
      expect(store.getState().street.segments[0].variant.direction).toBe(
        'outbound'
      )
      expect(
        store.getState().street.segments[0].variant['public-transit-asphalt']
      ).toBe('regular')
    })
  })

  describe('building variants', () => {
    it('handles switching left building', () => {
      const { store } = renderWithReduxAndIntl(
        <Variants type={INFO_BUBBLE_TYPE_LEFT_BUILDING} position="left" />,
        { initialState }
      )
      userEvent.click(screen.getByTitle('Waterfront'))
      expect(store.getState().street.leftBuildingVariant).toBe('waterfront')
    })

    it('handles switching right building', () => {
      const { store } = renderWithReduxAndIntl(
        <Variants type={INFO_BUBBLE_TYPE_RIGHT_BUILDING} position="right" />,
        { initialState }
      )
      userEvent.click(screen.getByTitle('Waterfront'))
      expect(store.getState().street.rightBuildingVariant).toBe('waterfront')
    })
  })

  describe('feature flag', () => {
    let segment

    beforeEach(() => {
      segment = { variants: ['flagged-variant', 'foo'] } // coming from info.json
      getSegmentInfo.mockImplementation(() => segment)
    })

    it('renders a button if flag is true', () => {
      renderWithReduxAndIntl(
        <Variants type={INFO_BUBBLE_TYPE_SEGMENT} position={0} />,
        {
          initialState: {
            ...initialState,
            flags: {
              FLAGGED_VARIANT: {
                value: true
              }
            }
          }
        }
      )

      expect(screen.getByTitle('Flagged variant')).toBeInTheDocument()
    })

    it('does not render a button if flag is false', () => {
      renderWithReduxAndIntl(
        <Variants type={INFO_BUBBLE_TYPE_SEGMENT} position={0} />,
        {
          initialState: {
            ...initialState,
            flags: {
              FLAGGED_VARIANT: {
                value: false
              }
            }
          }
        }
      )

      expect(screen.queryByTitle('Flagged variant')).not.toBeInTheDocument()
    })
  })
})
