/**
 * Components using the react-intl module require access to the intl context.
 * This is not available when mounting single components in Enzyme.
 * These helper functions aim to address that and wrap a valid,
 * English-locale intl context around them.
 *
 * https://github.com/formatjs/react-intl/blob/master/docs/Testing-with-React-Intl.md#helper-function-1
 */

import { mount, shallow } from 'enzyme'
import { IntlProvider } from 'react-intl'

// You can pass your messages to the IntlProvider. Optional: remove if unneeded.
const messages = require('../../assets/locales/en/main.json')

export function mountWithIntl (node) {
  return mount(node, {
    wrappingComponent: IntlProvider,
    wrappingComponentProps: {
      locale: 'en',
      defaultLocale: 'en',
      messages
    }
  })
}

export function shallowWithIntl (node) {
  return shallow(node, {
    wrappingComponent: IntlProvider,
    wrappingComponentProps: {
      locale: 'en',
      defaultLocale: 'en',
      messages
    }
  })
}
