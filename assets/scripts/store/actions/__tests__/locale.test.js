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
          bar: 'foo {{boop}}'
        }
      }
    }

    const expectedAction = {
      type: types.SET_LOCALE,
      locale: 'pt-BR',
      messages: {
        'foo.bar': 'baz',
        'foo.qux': 'bar',
        'qux.baz.bar': 'foo {boop}'
      }
    }

    expect(actions.setLocale('pt_BR', translation)).toEqual(expectedAction)
  })
})
