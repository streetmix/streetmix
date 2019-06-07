Tests
=====

.. warning::

   This page is a work in progress.


.. _running-tests:

Running tests locally
---------------------

When testing locally, the only tests we run by default are unit tests and code linting.

.. prompt:: bash $

   npm test


You can run a full browser integration test with this command. We run integration tests in our continuous integration infrastructure, so it is not required to run this locally.

.. prompt:: bash $

   npm test:full
