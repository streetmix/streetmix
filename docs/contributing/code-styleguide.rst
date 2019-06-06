.. _code-styleguide:

Code styleguide
===============

.. warning::

   This page is a work in progress.


Code style
++++++++++

HTML
~~~~

TODO.


CSS
~~~

TODO.


JavaScript
~~~~~~~~~~

Our JavaScript code style is `Standard JS`_.

.. _Standard JS: https://standardjs.com/

.. image:: https://cdn.rawgit.com/standard/standard/master/badge.svg
   :target: https://github.com/standard/standard
   :alt: JavaScript Standard code style badge

.. admonition:: In the future...

   ...we may adopt `Prettier <https://github.com/prettier/prettier>`_ (or `prettier-standard <https://github.com/sheerun/prettier-standard>`_) to automatically format code. We have not introduced it yet because doing so across the entire codebase would be disruptive to existing work. If someone wants to champion adoption of Prettier, please get in touch.


React
~~~~~

We extend Standard JS with the `eslint-config-standard-react <https://github.com/standard/eslint-config-standard-react/>`_ package.

.. attention::

   We have only overridden one rule, ``jsx-quotes`` (`link <https://eslint.org/docs/rules/jsx-quotes>`_), to prefer double quotation marks in JSX attributes. This is because, unlike regular JavaScript, double quotation marks are *more* typical in HTML, and this convention has carried over to JSX. You can see single quotes in JavaScript and double quotes for JSX attributes coexisting in `React documentation <https://reactjs.org/docs/introducing-jsx.html>`_, and we believe developers expect this to be typical across the React ecosystem. This is a rare instance where we disagree with Standard JS's rule.


Additional guidelines
^^^^^^^^^^^^^^^^^^^^^

- **Prefer functional components.**  We'll let React developer Dan Abramov `do the talking <https://twitter.com/dan_abramov/status/993103559297204224>`_ (and `the writing <https://overreacted.io/how-are-function-components-different-from-classes/>`_). Refactor existing class components to functional components only when it's cheap to do so.
- **Lifecycle ordering.**  Refer to `the Airbnb JSX guide <https://github.com/airbnb/javascript/tree/master/react#ordering>`_ for guidance.
- **State variable naming.**  A variable that stores UI state as a boolean value should be named with the pattern ``is[State]``. For instance, that's ``state.isVisible === true``, and not ``state.visible === true`` Or ``state.isEditing``, not ``state.editing``.


Code comments
+++++++++++++

**TODO:** JSDoc


Commit style
++++++++++++

We like `semantic commit messages <https://seesparkbox.com/foundry/semantic_commit_messages>`_. This convention was adopted by the `Angular <https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#-git-commit-guidelines>`_ team, and has spread throughout the developer ecosystem.

.. admonition:: In the future...

   ...we may use commit messages to help with `automated releases <https://github.com/semantic-release/semantic-release>`_.


Other stuff
+++++++++++

- Keep code concise, but consider readability. Resist the urge to play `code golf`_.
- Avoid abbreviating variables. They should be readable.
  
  - It is acceptable to use single-letter variables as counters in loops (e.g. ``i``).
  - For event handlers, the variable name ``event`` is preferred, but sometimes you will see it abbreviated ``e``, which is common in JavaScript. However, never use the abbreviated form if the event handling function is not in the context of the event listener. For instance, ``window.addEventListener('click', (e) => {})`` can be acceptable, but ``export function doSomething (e) {}`` is not immediately clear that the function should only be used as an event handler.


.. _code golf: https://en.wikipedia.org/wiki/Code_golf
