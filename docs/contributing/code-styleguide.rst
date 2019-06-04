Code styleguide
===============

.. warning::

   This page is a work in progress.

- We use `Standard JS`_.
- Keep code concise, but consider readability. Resist the urge to play `code golf`_.
- Avoid abbreviating variables. They should be readable.
  
  - It is acceptable to use single-letter variables as counters in loops (e.g. ``i``).
  - For event handlers, the variable name ``event`` is preferred, but sometimes you will see it abbreviated ``e``, which is common in JavaScript. However, never use the abbreviated form if the event handling function is not in the context of the event listener. For instance, ``window.addEventListener('click', (e) => {})`` can be acceptable, but ``export function doSomething (e) {}`` is not immediately clear that the function should only be used as an event handler.

React method ordering: refer to `the Airbnb JSX guide <https://github.com/airbnb/javascript/tree/master/react#ordering>`_ on this. (Note that we do not enforce this within the linter (yet)).

- use `is[State]` in state to indicate a UI state that expects a boolean value. This is easier to read (e.g. `if (isEditing)` and is commonly used in the React ecosystem (e.g. the `isMounted` property).
- **TODO:** JSDoc

.. admonition:: In the future...

   We may use `Prettier <https://prettier.io/>`_ to automatically format code so that we can worry less about code style. We have not introduced it yet because doing so across the entire codebase would be too disruptive to existing work.

.. _Standard JS: https://standardjs.com/
.. _code golf: https://en.wikipedia.org/wiki/Code_golf
