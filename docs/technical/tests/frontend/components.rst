Component Tests
===============

When it comes to testing React components, we need a way to test components in isolation without needing to mount the entire application. Many of our current React components are tested with `Enzyme <https://airbnb.io/enzyme/>`_, but more recently, our tests have started to use `React Testing Library <https://testing-library.com/docs/react-testing-library/intro>`_ instead. (See `this blog post by Kent Dodds for more information <https://kentcdodds.com/blog/introducing-the-react-testing-library>`_.)

We adopted React Testing Library to avoid testing implementation details. , especially for React components. You want your tests to be maintainable and less susceptible to breaking, which slows you down when you refactor components. With React Testing Library we're testing the actual DOM and not React-specific implementation details, like ``props`` or ``state``.

React Testing Library is intended as a replacement for Enzyme. When writing new tests, or ugprading old tests, try React Testing Library first. Please don't use both in a single test suite, choose one or the other. Eventually, our hope is that Enzyme can be removed from the infrastructure.

.. tip::

   Many of our React components use Redux and react-intl, which are required in the component's context to render properly. For both Enzyme and React Testing Library, we have replacement mounting utility functions in :file:`./test/helpers/` that mock the ``<Provider />`` and ``<IntlProvider />`` wrapping components, which you should use when testing components.

How to test components
--------------------------

React Testing Library works directly with the rendered DOM. It provides utilities for querying the DOM in the same way the user would. Finding for elements by their label text (just like a user would), finding links and buttons from their text (like a user would).

Test the interaction rather than the way it looks. For example use ``fireAction`` from React Testing Library to simulate Mouse and Keyboard events.

Use the render method, be aware that you need to ``wait`` for changes when the store is used. Due to the asynchronous nature of the store.
The helper method ``renderWithRedux`` provides you with a wrapper around ``Provider`` and you can provide ``initialState``.


Snapshot testing
--------------------------

Snapshots should be used with caution. They tend to break, and developers tend to update them without examining why a snapshot might have changed unexpectedly.
Please be careful when snapshots fail and when to add new ones.

Snapshots are good when you test different results, like error messages. Take a look at :file:`./assets/scripts/app/__tests__/StreetEditable.test.js` for an example how snapshots can be used with error messages.

Mocks
--------------------------

Be aware of mocks. A few files and functions are mocked globally. For example ``load_resources`` is mocked globally and if you need to use that file in your tests/components be sure to check the mock.  
Otherwise use ``jest.mock`` to mock modules, classes, etc.
