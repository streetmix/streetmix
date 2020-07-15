.. _code-styleguide:

Code styleguide
===============

You've heard it all before: code style should be consistent across a project, which helps readability and maintainability. We've done our best to automate formatting or linting of code to keep things consistent. However, we still need to set some guidelines and document some of our tooling and decision-making.

The first thing you should know is: *two-space indents everywhere; no tabs.*

Code style
++++++++++

HTML
~~~~

We don't have anything to lint HTML, so here are some basic guidelines:

- All elements and attributes should be lowercase.
- All quotation marks should be double quotes.
- We use `Handlebars <https://handlebarsjs.com/>`_ templating. In the past, we've tried using templating language that didn't look like HTML, and, long story short, we won't be doing that again.
- Comments can also be written in Handlebars so they don't get sent to the client.
- Indent nested elements.


CSS
~~~

We use `Sass <https://sass-lang.com/>`_ in the SCSS flavor, which makes it easier to interoperate with standard CSS syntax. Code style is enforced with `Stylelint <https://stylelint.io/>`_, using a combination of `stylelint-config-standard <https://github.com/stylelint/stylelint-config-standard>`_ and `Prettier <https://prettier.io/>`_ rules.

SCSS files generally live adjacent to the components that they apply to, and will be imported by each component. SCSS files are not global, so variables and mixins need to be imported from other SCSS files. However, the compiled CSS will be global, not scoped to the component. *Don't be afraid of the cascade!*

Avoid styling elements using ``id`` attribute selectors. Instead, use class names (alongside pseudo-selectors and attribute selectors, if necessary). Namespace all classnames. If there's a component called ``palette``, a good class name could be ``palette-container``. Try to avoid writing generic class names like ``large``. Because styles are not scoped, allowing generic class names without namespaces will inevitably cause collissions.

.. admonition:: In the future...

   We may make a stronger move toward `Tailwind CSS <https://tailwindcss.com/>`_-style composition of utility classes instead of relying on Sass mixins, extends, or copy-pasting duplicate CSS code across class names. Generic class names will then be used for utility classes.

Although it's popular, we do not use BEM framework/naming convention. Some good resources which have generally informed our approach to CSS organization (but have not dictated it) include `Scalable and Modular Architecture for CSS (SMACSS) <http://smacss.com/>`_ and parts of the `Reasonable System for CSS Stylesheet Structure (rscss) <https://rscss.io/>`_.


JavaScript
~~~~~~~~~~

Our JavaScript code style is `Standard JS`_. We enforce code style with a combination of `Prettier <https://prettier.io/>`_ and `ESLint <https://eslint.org/>`_.

.. _Standard JS: https://standardjs.com/

.. image:: https://cdn.rawgit.com/standard/standard/master/badge.svg
   :target: https://github.com/standard/standard
   :alt: JavaScript Standard code style badge


Import order
^^^^^^^^^^^^

Generally, external dependencies are imported first, then relative imports local to the application. Developers familiar with `Python's PEP8 guidelines <https://www.python.org/dev/peps/pep-0008/#imports>`_ will have seen this concept before.

When importing relative files, files in the local directory ("closest" to the current module) are usually imported first. Files that come from the same subdirectories elsewhere are grouped together. When in doubt, alphabetical ordering within groups is better than no order at all.

Here's a rough order of imports:

- import ``react``
- import ``prop-types``
- import other React packages (usually related packages are grouped)
- import other dependencies (usually related packages are grouped)
- import constants
- import components
- import functions from non-component modules not covered elsewhere
- import Redux-related modules (e.g. action creators) last
- import CSS

There's no technical reason to order imports. (In the past, some modules may have created side-effects when they load, meaning that import order was significant. This should no longer be the case. If you come across one, consider this a bug which should be fixed ASAP.) We order imports to make it easier for a human to understand the dependency graph of a module.


React
~~~~~

We extend the Standard JS ESLint rules with the `eslint-config-standard-react <https://github.com/standard/eslint-config-standard-react/>`_ package.

.. attention::

   We have only overridden one rule, ``jsx-quotes`` (`link <https://eslint.org/docs/rules/jsx-quotes>`_), to prefer double quotation marks in JSX attributes. This is because, unlike regular JavaScript, double quotation marks are *more* typical in HTML, and this convention has carried over to JSX. You can see single quotes in JavaScript and double quotes for JSX attributes coexisting in `React documentation <https://reactjs.org/docs/introducing-jsx.html>`_, and we believe developers expect this to be typical across the React ecosystem. This is a rare instance where we disagree with Standard JS's rule.


Additional guidelines
^^^^^^^^^^^^^^^^^^^^^

- **Prefer functional components.**  We'll let React developer Dan Abramov `do the talking <https://twitter.com/dan_abramov/status/993103559297204224>`_ (and `the writing <https://overreacted.io/how-are-function-components-different-from-classes/>`_). Refactor existing class components to functional components only when it's cheap to do so.
- **Lifecycle ordering.**  Refer to `the Airbnb JSX guide <https://github.com/airbnb/javascript/tree/master/react#ordering>`_ for guidance.
- **State variable naming.**  A variable that stores UI state as a boolean value should be named with the pattern ``is[State]``. For instance, that's ``state.isVisible === true``, and not ``state.visible === true`` Or ``state.isEditing``, not ``state.editing``.


Code comments
+++++++++++++

**TODO:** `JSDoc <https://jsdoc.app/>`_


.. _code-commit-style:

Commit style
++++++++++++

We like the `Conventional Commits specification <https://www.conventionalcommits.org/en/v1.0.0/#specification/>`_. This commit style helps us organize our changes into discrete commits by documenting them in a standard way, which helps us understand project history over time. (Previously, this is also known as `semantic commit messages <https://seesparkbox.com/foundry/semantic_commit_messages>`_ or the `Angular commit style <https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#-git-commit-guidelines>`_.)

While the Conventional Commits specification only defines the ``feat`` and ``fix`` types, we also use the following **types**:

  - **chore**: Changes to packages, configuration, external services such as CI (continuous integration) that do not affect the Streetmix application itself
  - **docs**: Changes to documentation contents
  - **style**: Changes to code style (white-space, formatting, etc)
  - **test**: Changes to tests
  - **perf**: Improvement to existing code that improves performance
  - **revert**: Reverts a previous change
  - **refactor**: All other improvements to existing code (and not ``perf``, ``fix``, or ``feat``)

A **role** can also be added optionally. For React components, the role is often the name of the component:

.. code::

   refactor(Avatar): stop using internal state


This is flexible and new types may be adopted over time. Sometimes a commit may seem to fall into one or more category. The first thing to consider is whether the commit is too large and should be split into smaller commits. If not, then pick which category seems most relevant. Make your own best judgment call here. Pull request reviews should not be held up on semantic debates of commit types, but a review should note if commit types are completely missing or very clearly used improperly.


.. note::

   We use `commitlint <https://commitlint.js.org>`_ to automatically check your commit messages for validity. If they're not valid, the check will fail. This check is hooked into each commit, and our CI test will also check your commit messages.


.. tip::

   If your development style is to make quick, small commits whenever you've made progress, there's no need to change your development workflow right away to adopt the Conventional Commit style. You can always clean up the commit history on your branch when you're ready to make a pull request. `You can use git rebase to do this (tutorial) <https://egghead.io/lessons/tools-practical-git-clean-up-commits-with-git-rebase>`_.


.. admonition:: In the future...

   ...we may use commit messages to help with `automated releases <https://github.com/semantic-release/semantic-release>`_.


GitHub issues
~~~~~~~~~~~~~

Whenever possible, use commit messages or commit comments to close automatically close GitHub issues. (This may also be done in pull requests.)

.. code::

   refactor(Avatar): stop using internal state, resolves #1337



Other stuff
+++++++++++

- Keep code concise, but consider readability. Resist the urge to play `code golf`_.
- Avoid abbreviating variables. They should be readable.
  
  - It is acceptable to use single-letter variables as counters in loops (e.g. ``i``).
  - For event handlers, the variable name ``event`` is preferred, but sometimes you will see it abbreviated ``e``, which is common in JavaScript. However, never use the abbreviated form if the event handling function is not in the context of the event listener. For instance, ``window.addEventListener('click', (e) => {})`` can be acceptable, but ``export function doSomething (e) {}`` is not immediately clear that the function should only be used as an event handler.


.. _code golf: https://en.wikipedia.org/wiki/Code_golf
