.. _code-contributions:

Code contributions
==================

.. warning::

   This section is a work in progress.

.. toctree::
   :hidden:
   :maxdepth: 2
   :caption: Contents

   styleguide


If you have the capacity to write code, and wish to contribute to Streetmix, we'd love your help! **No patch is too small:** we welcome patches to fix typos, add comments, or refactor code.

We use `GitHub Flow <https://guides.github.com/introduction/flow/>`_ to make changes and proposals to our codebase.

.. tip::

   Before writing any new feature or code, it's best to have a brief conversation with the Streetmix team to make sure we're all on the same page. Please check `GitHub issues <https://github.com/streetmix/streetmix/issues>`_ to see if a feature is already being discussed or work on, and comment there to register your interest. If it hasn't been discussed, please feel free to open a new issue for it. You can also `join our Discord server <https://strt.mx/discord>`_ and talk with us there. A little bit of communication will go a long way, making it more likely that we're able to accept your work when it's ready!


Submitting a pull request
+++++++++++++++++++++++++

1. **Fork the project**, if you do not already have write access to the repository. Individuals making significant and valuable contributions will be given write access.

2. **Create a new branch.** Changes should always be made in a new feature branch. The branch should be named in the format ``username/feature-name``.

3. **Implement your feature or bug fix.** Writing code is the fun part! Before you start any work, it's a good idea to talk to the team first, so that we can be sure you're on the right track.

4. **Commit your changes.** Commit messages should follow semantic commit message format (See :ref:`code-commit-style`). When committing, we use hooks to run code style linting. If it fails, please correct (or override) the code and commit again.

5. **Push your changes.** After pushing, we run continuous integration tests in the cloud to make sure commits pass. We recommend manually running tests locally as well. See :ref:`running-tests`.

6. **Submit a pull request.** Ideally, pull requests contain small, self-contained changes with a few commits, which are easier to review. You can simplify a review and merge process by making sure your branch contains no conflicts with the ``main`` branch and is up-to-date (either by rebasing on ``main`` or merging it in) when the pull request is created. If the pull request addresses an open issue, be sure to reference it in your request's title or description.

7. **Wait for a review.** A project maintainer will review your pull request and either approve, reject, or request changes on it. A well-written, small pull request that fixes an open issue is most likely to be approved and merged quickly. Once merged, a branch is deleted.

Stale branches, especially ones that cannot be cleanly merged anymore, are likely to be deleted after some amount of time has passed.

