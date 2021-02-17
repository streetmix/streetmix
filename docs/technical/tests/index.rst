Tests
=====

.. toctree::
   :hidden:
   :maxdepth: 2
   :caption: Contents

   frontend/index


Tests are extremely important to the health and stability of Streetmix. We have established some systems and processes to help ensure the ongoing reliability of our platform.

We do not have a strict test-driven development (TDD) methodology, although individual engineers may use this approach if that's the development pattern they are most comfortable with. Also, while we do measure code coverage, our goal is not necessarily to reach 100%. We're looking for "enough" coverage to have confidence that new features or refactoring will not create new bugs, which can be more of a subjective approach. As Guillermo Rauch says, `"Write tests. Not too many. Mostly integration." <https://twitter.com/rauchg/status/807626710350839808>`_

.. admonition:: For context...

   We did not have *any* test infrastructure in the early phases of Streetmix. Tests have been added over time and are constantly improving. This document reflects our current thoughts about *how* we should test, but you'll find lots of moments in the codebase where tests are incomplete or non-existent. We could always use some help with writing tests!


.. _running-tests:

Running tests locally
---------------------

When testing in a local development environment, only :ref:`linting <linting>` and :ref:`unit tests <unit-tests>` are run.

.. prompt:: bash $

   npm test


Full integration tests happen in our continuous integration infrastructure. You're not required to run this locally, but if you'd like, you can do so with this command.

.. prompt:: bash $

   npm cypress:run


Frameworks
----------

.. _unit-tests:

Unit and integration tests
++++++++++++++++++++++++++

.. warning::

   This section is incomplete and should be expanded.

Our primary test framework is the `Jest <https://jestjs.io/>`_ test runner with `React Testing Library (RTL) <https://testing-library.com/docs/react-testing-library/intro>`_. (These do not do the same thing and are not interchangeable; these two systems work closely together to provide a full unit and integration test environment.) A number of resources already exist that fully document why and how we use these, see the resources list just below.

Our goal is to be as close as possible to a community-designed "best practice" in order to simplify our understanding and comprehension of tests; *do not do anything exotic in these tests if you can avoid it.*

Resources
~~~~~~~~~

- `Introducing the react-testing-library <https://kentcdodds.com/blog/introducing-the-react-testing-library>`_ [Kent C. Dodds] - why RTL instead of Enzyme?
- `How to use React Testing Library Tutorial <https://www.robinwieruch.de/react-testing-library>`_ [Robin Wieruch] - start here for the basics
- `Common mistakes with React Testing Library <https://kentcdodds.com/blog/common-mistakes-with-react-testing-library>`_ [Kent C. Dodds]


.. _e2e-tests:

End-to-end tests
++++++++++++++++

.. warning::

   This section is incomplete and should be expanded.

We use `Cypress <https://www.cypress.io/>`_ sparingly. We do eventually want more tests to exist in Cypress, when appropriate, and can replace the unit or integration tests that end-to-end tests can cover.

Cypress only runs in :ref:`our automated continuous integration test environment <continuous-integration>` by default, but can also be run locally:

.. prompt :: bash $

   npm run cypress:run


.. _linting:

Linting
+++++++

We use `ESLint <https://eslint.org/>`_ and `Stylelint <https://stylelint.io/>`_ to lint JavaScript and CSS, respectively. There is a commit hook that automatically runs the linter on each commit. If the lint fails, you will need to fix your code and try your commit again, or force it to ignore the lint errors. For more on code style, see :ref:`code-styleguide`.

.. admonition:: In the future...

   ...we may adopt `Prettier <https://github.com/prettier/prettier>`_ (or `prettier-standard <https://github.com/sheerun/prettier-standard>`_) to automatically format code. We have not introduced it yet because doing so across the entire codebase would be disruptive to existing work. We currently use Prettier to lint and format JSON. If someone wants to champion adoption of Prettier, please get in touch.


Type safety
+++++++++++

JavaScript is notoriously not type safe: you may pass any type of object or JavaScript primitive to any function or method, which may not be able to handle them. Or you may write a function that returns values of different types, and the calling script wasn't expecting that return value. Various attempts to introduce type safety on top of JavaScript have entered the ecosystem, and here's how we use these tools.


PropTypes (React)
~~~~~~~~~~~~~~~~~

`PropTypes <https://reactjs.org/docs/typechecking-with-proptypes.html>`_ is a runtime typechecking library used for React development. Because it is a runtime checker, PropTypes will only throw errors in the console when running in the browser or in test suites. (The PropTypes library is not compiled into production code.)

We currently enforce using PropTypes for React components in development. This means that React components must declare all of its props and what types of values that prop should be. The benefit of this approach is that React components self-document what props it accepts. Sometimes, a prop can be overloaded with multiple types, but this is generally discouraged if you can avoid it. 


TypeScript
~~~~~~~~~~

`TypeScript <https://www.typescriptlang.org/>`_ is an extension of the JavaScript language that allows types to be checked statically (that is, reason about whether the right types are being passed around, without having to run the code itself). It's been growing steadily in popularity (based the `State of JS 2018 report <https://2018.stateofjs.com/javascript-flavors/typescript/>`_) over the past few years.

We have experimented with TypeScript in auxiliary codebases, but we've not incorporated it into Streetmix itself. Because we already compile code with Babel, adopting TypeScript piecemeal is doable. However, we have not yet run into a situation where the solution is specifically to adopt TypeScript. That being said, if and when a good case can be made for adopting it, we will likely jump on board. If a migration to TypeScript occurs in React components, it will supercede using PropTypes.


Device testing
++++++++++++++

We do not currently implement device testing, but this is on our to-do list. We have a `Browserstack <https://www.browserstack.com/>`_ account for this purpose.


.. _continuous-integration:

Continuous integration (CI)
---------------------------

We use `Travis CI <https://travis-ci.org/streetmix/streetmix>`_ to automatically run tests for every commit and pull request to our repository. 

Troubleshooting CI
++++++++++++++++++

Continuous integration testing is, unfortunately, not deterministic. Because there are various moving parts and third party services involved, CI can sometimes fail, despite the code running perfectly locally (or even in production)! When CI fails, we need to examine why. **Passing CI is almost always required to maintain confidence that a deploy will not break the production site.**

Even after determining that CI is failing not because of a bug or linting problem, here are some common tips for addressing issues with the CI infrastructure.

1. **Try running the build again.** Because CI isn't deterministic, sometimes running it a second time with no changes will cause it to pass. This is commonly the issue when the Selenium smoke test fails.
2. **Check the status of third-party services.** Sometimes, TravisCI itself has issues, so also be sure to check `TravisCI status <https://www.traviscistatus.com/>`_.


Skipping CI
+++++++++++

CI can be skipped by appending ``[skip ci]`` to a commit message.


Automatic deployment
++++++++++++++++++++

Every commit or merged pull request to the ``main`` branch that passes CI is automatically deployed to the staging server.

Currently, there is no automatic deployment to the production server. We've noticed that each deploy introduces a small amount of lag while the server software restarts. As a result, we now manually trigger deployments to the production server.


GitHub checks
-------------

In addition to continuous integration, we use some third-party services to keep an eye on code quality and test coverage. These services should be considered "code smell" detectors, but treat them with a grain of salt. They are not required to pass before merging pull requests.

CodeClimate
+++++++++++

`CodeClimate <https://codeclimate.com/github/streetmix/streetmix>`_ measures **technical debt**, or the long-term maintainability and readability of code. It applies some heuristics to detect and track "code smells," which are opportunities to refactor code or fix potential bugs. A CodeClimate review is triggered automatically on every pull request, but some of the thresholds it uses are quite arbitrary. Here's some of the issues are raised, and how we'd address them, in order of increasing severity (as it applies to Streetmix):

- **Lines of code**. CodeClimate triggers a warning when functions and modules exceed an arbitrary line limit. This means there is a potential opportunity to separate concerns, but we will never enforce this, since we don't want to encourage "code golf" or quick workarounds instead of actually taking the time to separate logic. If something can be refactored into smaller pieces, but can't be prioritized immediately, add a ``TODO`` comment instead. If something doesn't make sense to shorten, mark the issue as :guilabel:`Wontfix`.
- **Duplicate code.** CodeClimate triggers a warning when it detects code that look the same as other code elsewhere. This can be an opportunity to refactor code, but more often than not, CodeClimate is seeing similar-looking boilerplate code or patterns. In this case, mark the issue as :guilabel:`Invalid`.
- **Cognitive complexity.** CodeClimate triggers a warning when a function contains too many conditional statements, resulting in complex branching or looping code. Not all code can be made simpler, but you may want to consider whether it can be written diffferently. However, use your best judgment here. If you don't agree with CodeClimate's assessment, mark the issue as :guilabel:`Wontfix`.
- **TODOs**. CodeClimate tracks when a ``TODO`` or a ``FIXME`` comment is written in the code. Because this is a developer's own judgment call, this takes priority above other issues and should be addressed in the future. Never mark this as :guilabel:`Wontfix` or :guilabel:`Invalid`. If it's no longer valid, instead remove the ``TODO`` or ``FIXME`` comment from the code.

Issues that should be addressed in the future, but can't or won't be addressed immediately, should be marked with :guilabel:`Confirmed.`

In spite of CodeClimate's warnings, reviewers may approve its review even if the issues it raises are not addressed right away.

Codecov
+++++++

`Codecov <https://codecov.io/gh/streetmix/streetmix>`_ measures `code coverage <https://en.wikipedia.org/wiki/Code_coverage>`_, which is the percentage of code that is covered by at least one test suite. This percentage is a commonly used metric that software projects use to show how complete its test suites are. However, the percentage itself is not necessarily a measurement of test *quality*. As a result, while we strive for higher coverage, 100% is not the goal.

A Codecov review is triggered automatically on every pull request, which allows a reviewer to see at a glance whether a pull request increases or decreases overall code coverage. It fails if a large amount of new code is added without increasing a corresponding amount of test coverage.

Because our test suite coverage is quite low at the moment, it is preferred that all new code and refactored code come with test suite coverage.


Resources
---------

These additional resources from the developer community help guide our approach to testing. This is not an exhaustive list, and we'll keep updating this over time.

- `Write tests. Not too many. Mostly integration. <https://kentcdodds.com/blog/write-tests/>`_ [Kent C. Dodds], on Guillermo Rauch's tweet.
- `JavaScript & Node.js Testing Best Practices <https://github.com/goldbergyoni/javascript-testing-best-practices>`_ [Yoni Goldberg]
