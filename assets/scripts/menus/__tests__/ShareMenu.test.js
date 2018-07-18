/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { ShareMenu } from '../ShareMenu'
import { mockIntl } from '../../../../test/__mocks__/react-intl'

jest.mock('../../app/page_title', () => {
  return {
    getPageTitle: () => {}
  }
})

jest.mock('../../app/config', () => {
  return {
    TWITTER_URL_SIGN_IN_CALLBACK_REL: '/twitter-sign-in-callback'
  }
})

describe('ShareMenu', () => {
  it('renders without crashing', () => {
    const wrapper = shallow(<ShareMenu signedIn street={{}} intl={mockIntl} />)
    expect(wrapper.exists()).toEqual(true)
  })

  describe('sign-in promo', () => {
    it('shows the sign-in promo if user is not signed in', () => {
      const wrapper = shallow(<ShareMenu signedIn={false} street={{}} intl={mockIntl} />)
      expect(wrapper.find('.share-sign-in-promo').length).toEqual(1)
    })

    it('does not show the sign-in promo if user is signed in', () => {
      const wrapper = shallow(<ShareMenu signedIn street={{}} intl={mockIntl} />)
      expect(wrapper.find('.share-sign-in-promo').length).toEqual(0)
    })
  })
})
