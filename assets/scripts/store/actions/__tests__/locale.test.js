/* eslint-env jest */
import * as actions from '../locale'
import * as types from '../index'

describe('locale action creators', () => {
  it('should create an action to save translation in react-intl message format', () => {
    const translation = {
      foo: {
        bar: 'baz',
        qux: 'bar'
      },
      qux: {
        baz: {
          bar: 'foo'
        }
      }
    }

    const expectedAction = {
      type: types.SET_LOCALE,
      locale: 'en',
      messages: {
        'foo.bar': 'baz',
        'foo.qux': 'bar',
        'qux.baz.bar': 'foo'
      }
    }

    expect(actions.setLocale('en', translation)).toEqual(expectedAction)
  })
})
