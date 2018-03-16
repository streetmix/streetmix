/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { ShareMenu } from '../ShareMenu'

jest.mock('../../app/page_title', () => {
  return {
    getPageTitle: () => {}
  }
})

describe('ShareMenu', () => {
  it('renders without crashing', () => {
    const wrapper = shallow(<ShareMenu showDialog={jest.fn()} signedIn street={{}} />)
    expect(wrapper.exists()).toEqual(true)
  })

  describe('sign-in promo', () => {
    it('shows the sign-in promo if user is not signed in', () => {
      const wrapper = shallow(<ShareMenu showDialog={jest.fn()} signedIn={false} street={{}} />)
      expect(wrapper.find('.share-sign-in-promo').length).toEqual(1)
    })

    it('does not show the sign-in promo if user is signed in', () => {
      const wrapper = shallow(<ShareMenu showDialog={jest.fn()} signedIn street={{}} />)
      expect(wrapper.find('.share-sign-in-promo').length).toEqual(0)
    })
  })
})
