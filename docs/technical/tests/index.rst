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

.. _linting:

Linting
+++++++

We use `ESLint <https://eslint.org/>`_ and `Stylelint <https://stylelint.io/>`_ to lint JavaScript and CSS, respectively. There is a commit hook that automatically runs the linter on each commit. If the lint fails, you will need to fix your code and try your commit again, or force it to ignore the lint errors. For more on code style, see :ref:`code-styleguide`.

In addition, we use `JSONLint <https://github.com/zaach/jsonlint>`_ to automatically format JSON or report errors when JSON is improperly formatted.


Type safety
+++++++++++

JavaScript is notoriously not type safe: you may pass any type of object or JavaScript primitive to any function or method, which may not be able to handle them. Or you may write a function that returns values of different types, and the calling script wasn't expecting that return value. Various attempts to introduce type safety on top of JavaScript have entered the ecosystem, and here's how we use these tools.

PropTypes (React)
~~~~~~~~~~~~~~~~~

`PropTypes <https://reactjs.org/docs/typechecking-with-proptypes.html>`_ is a runtime typechecking library used for React development. Because it is a runtime checker, PropTypes will only throw errors in the console when running in the browser or in test suites. (The PropTypes library is not compiled into production code.)

We currently enforce using PropTypes for React components in development. This means that React components must declare all of its props and what types of values that prop should be. The benefit of this approach is that React components self-document what props it accepts. Sometimes, a prop can be overloaded with multiple types, but this is generally discouraged if you can avoid it. 

While PropTypes come with built-in types, the types can also be extended. Some third party libraries export its own prop types, for example, ``react-intl`` exports ``intlShape`` which can be used when its methods are injected as props via a higher-order component.

TypeScript
~~~~~~~~~~

`TypeScript <https://www.typescriptlang.org/>`_ is an extension of the JavaScript language that allows types to be checked statically (that is, reason about whether the right types are being passed around, without having to run the code itself). It's been growing steadily in popularity (based the `State of JS 2018 report <https://2018.stateofjs.com/javascript-flavors/typescript/>`_) over the past few years.

We have experimented with TypeScript in auxiliary codebases, but we've not incorporated it into Streetmix itself. Because we already compile code with Babel, adopting TypeScript piecemeal is doable. However, we have not yet run into a situation where the solution is specifically to adopt TypeScript. That being said, if and when a good case can be made for adopting it, we will likely jump on board. If a migration to TypeScript occurs in React components, it will supercede using PropTypes.


.. _unit-tests:

Device testing
++++++++++++++

We do not currently implement device testing, but this is on our to-do list. We have a `Browserstack <https://www.browserstack.com/>`_ account for this purpose.


Continuous integration (CI)
---------------------------

We use `Travis CI <https://travis-ci.org/streetmix/streetmix>`_ to automatically run tests for every commit and pull request to our repository. 

Troubleshooting CI
++++++++++++++++++

Continuous integration testing is, unfortunately, not deterministic. Because there are various moving parts and third party services involved, CI can sometimes fail, despite the code running perfectly locally (or even in production)! When CI fails, we need to examine why. **Passing CI is almost always required to maintain confidence that a deploy will not break the production site.**

Even after determining that CI is failing not because of a bug or linting problem, here are some common tips for addressing issues with the CI infrastructure.

1. **Try running the build again.** Because CI isn't deterministic, sometimes running it a second time with no changes will cause it to pass. This is commonly the issue when the Selenium smoke test fails.
2. **Check the status of third-party services.** Sometimes, TravisCI itself has issues, so also be sure to check `TravisCI status <https://www.traviscistatus.com/>`_.
3. **Check to make sure MongoDB is accepting connections.** A running MongoDB service is required for end-to-end testing. TravisCI have reported `an intermittent issue with MongoDB not accepting connections <https://docs.travis-ci.com/user/database-setup/#mongodb-does-not-immediately-accept-connections>`_, which can only be solved by injecting an artificial wait time. We have encountered this in the past, although we currently do not routinely experience this. However, there is always a possibility this issue can return.


Skipping CI
+++++++++++

CI can be skipped by appending ``[skip ci]`` to a commit message.


Automatic deployment
++++++++++++++++++++

The ``master`` branch is live: that means every commit or merged pull request that passes CI is automatically deployed to the production server.


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

- https://kentcdodds.com/blog/write-tests/

