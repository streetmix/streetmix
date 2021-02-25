Component Tests
===============

When it comes to testing React components, we need a way to test components in isolation without needing to mount the entire application. We use `React Testing Library <https://testing-library.com/docs/react-testing-library/intro>`_ (`more information <https://kentcdodds.com/blog/introducing-the-react-testing-library>`_) to help us write tests.

.. tip::

   Many of our React components use Redux and react-intl, which are required in the component's context to render properly. If a component has either (or both) in its context, use the helper functions in :file:`./test/helpers/` which wrap React Testing Library's `render()` with mock ``<Provider />`` and ``<IntlProvider />`` components.

How to test components
--------------------------

React Testing Library works directly with the rendered DOM. It provides utilities for querying the DOM in the same way the user would. Finding for elements by their label text (just like a user would), finding links and buttons from their text (like a user would).

Test the interaction rather than the way it looks. For example use ``fireAction`` from React Testing Library to simulate Mouse and Keyboard events.

Use the render method, be aware that you need to ``wait`` for changes when the store is used. Due to the asynchronous nature of the store.
The helper method ``render`` provides you with a wrapper around ``Provider`` and you can provide ``initialState``.


Snapshot testing
--------------------------

Snapshots should be used with caution. They tend to break, and developers tend to update them without examining why a snapshot might have changed unexpectedly.
Please be careful when snapshots fail and when to add new ones.

Snapshots are good when you test different results, like error messages. Take a look at :file:`./assets/scripts/app/__tests__/StreetEditable.test.js` for an example how snapshots can be used with error messages.

Mocks
--------------------------

Be aware of mocks. A few files and functions are mocked globally. For example ``load_resources`` is mocked globally and if you need to use that file in your tests/components be sure to check the mock.  
Otherwise use ``jest.mock`` to mock modules, classes, etc.
