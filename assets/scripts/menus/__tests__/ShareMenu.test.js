/* eslint-env jest */
import React from 'react'
import { shallowWithIntl as shallow } from '../../../../test/helpers/intl-enzyme-test-helper.js'
import { ShareMenuWithIntl as ShareMenu } from '../ShareMenu'

jest.mock('../../app/page_title', () => {
  return {
    getPageTitle: () => {}
  }
})

describe('ShareMenu', () => {
  it('renders without crashing', () => {
    const wrapper = shallow(<ShareMenu signedIn street={{}} />)
    expect(wrapper.exists()).toEqual(true)
  })

  describe('sign-in promo', () => {
    it('shows the sign-in promo if user is not signed in', () => {
      const wrapper = shallow(<ShareMenu signedIn={false} street={{}} />)
      expect(wrapper.find('.share-sign-in-promo').length).toEqual(1)
    })

    it('does not show the sign-in promo if user is signed in', () => {
      const wrapper = shallow(<ShareMenu signedIn street={{}} />)
      expect(wrapper.find('.share-sign-in-promo').length).toEqual(0)
    })
  })
})
