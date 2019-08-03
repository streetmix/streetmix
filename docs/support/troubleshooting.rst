Troubleshooting
===============

.. warning::

   This page is a work in progress.


Error codes
-----------

These are error codes that may occur while using Streetmix.

+-------------+-------------------------------+-------------------------------+
| Error code  | Reason                        | Suggested fix                 |
|             |                               |                               |
+=============+===============================+===============================+
| **9B**      | **Data error**: The server    | Load a different street.      |
|             | sent street data that had     |                               |
|             | no data in it.                |                               |
+-------------+-------------------------------+-------------------------------+


.. _troubleshooting-development-issues:

Development issues
------------------

While developing Streetmix, here are solutions to some problems that may arise.


Strategies for resolving most common issues
+++++++++++++++++++++++++++++++++++++++++++

When you run into problems, **try this first!**

- Update your global ``node`` and ``npm`` versions to the latest versions.
- Remove the :file:`node_modules` and :file:`.cache` folders, if present, and reinstall (:ref:`install-streetmix`).
- Ensure that you are installing and running Streetmix with ``npm``, not ``yarn``.


Specific issues
+++++++++++++++

This section is for troubleshooting specific issues.

- **The server keeps restarting in a loop** with the ``EADDRINUSE`` error code. We have documented a solution in `GitHub issue #983 <https://github.com/streetmix/streetmix/issues/983>`_.

