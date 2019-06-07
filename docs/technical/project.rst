Project organization
====================

.. warning::

   This page is a work in progress.


Dependency pinning
------------------

We **pin** our dependencies, which means that we specify exact dependency versions, not `version ranges <https://semver.org/>`_, in ``package.json``. This allows Streetmix to run with the greatest reliability and consistency across different computing environments.

Because Streetmix is an application, and it's not intended to be imported by other applications, we don't need the flexibility that comes from using version ranges. As a result, all developers, and any deployment environments, are running the same code for any given commit. This consistency makes obscure bugs easier to track down and resolve.

The tradeoff is that this introduces "upgrade noise". We are currently using `Greenkeeper <https://greenkeeper.io/>`_, a third-party automated service to create pull requests whenever a dependency has updated. Because we have pinned dependencies, Greenkeeper creates a new branch and opens a new pull request for *every* depedency update, no matter how minor. We're willing to accept this tradeoff for the time being, although we're open to considering any strategy to limit the noise.

**References**

  - `Should you Pin your Javascript Dependencies? <https://renovatebot.com/docs/dependency-pinning/>`_ *[Renovate Docs]*
