.. _documentation:

Documentation
=============

*You're looking at it!*

Our documentation lives in the ``docs`` folder of `the Streetmix repository <https://github.com/streetmix/streetmix/tree/main/docs>`_. It's built and hosted by `Read the Docs <https://readthedocs.org/>`_.

We use the `reStructuredText (reST) syntax <http://www.sphinx-doc.org/en/master/usage/restructuredtext/index.html>`_. While Markdown is a very common alternative, it's harder to format extensive technical documentation with it. 

.. important::

   Not all technical documentation lives here! Documentation of specific functions or components should be written in the source code itself. Documentation relating to a directory of related modules should live in a dedicated Markdown ``README.md`` file coexisting with those files. This helps keep narrowly-focused documentation up-to-date and easier to find.

   Technical documentation pertaining to cross-cutting concerns or high-level architecture do belong here!

   For guidance on writing documentation in source code, see :ref:`code-styleguide`.


Local development setup
-----------------------

You don't need to build documentation locally when writing code for Streetmix. However, it *is* a good idea to document what you're working on, so we do recommend writing and updating documentation. Here's how to set up a local development instance of the documentation so you can preview any changes.


1. Install dependencies
+++++++++++++++++++++++

First, make sure you have a working `Python development environment <https://www.python.org/doc/>`_ on your system. Installing Python is outside of the scope of this guide.

Install `Sphinx`_, the `Read the Docs Sphinx theme`_, and extensions.

.. _Sphinx: http://www.sphinx-doc.org/en/stable/
.. _Read the Docs Sphinx theme: https://sphinx-rtd-theme.readthedocs.io/en/latest/installing.html

.. prompt:: bash $
   
   pip install sphinx sphinx-prompt sphinx_rtd_theme


2. Build documentation
++++++++++++++++++++++

Documentation must be built from the ``./docs`` working directory.

.. prompt:: bash $

   cd docs
   make dirhtml

.. note::

   The directory HTML renderer will create URLs that match the path structure that we use on Read the Docs.


Alternatively, we've provided an ``npm`` package script that can build documentation from the root directory.

.. prompt:: bash $

   npm run docs:build


.. admonition:: In the future...

   We would like to develop a watch and livereload system that automatically rebuilds documentation locally when contents change. For now, you must manually run a local build whenever you make changes.


3. Preview
++++++++++

Run a static file server, such as ``http-server``, to preview the built documentation. Built files are located in ``./docs/_build``, and the example command below assumes you are in the ``./docs`` working directory.

.. prompt:: bash $

   http-server _build/dirhtml


You may use any static file server solution you wish. We've also provided an ``npm`` package script that assumes ``http-server`` is available on the system's global packages and will automatically serve the documentation locally at ``http://localhost:8080/``.

.. prompt:: bash $

   npm run docs:serve

.. attention::

   A static file server does not automatically watch and rebuild changed files. You must manually rebuild files and then reload your browser to see the changes.


4. Upload
+++++++++

Commit your changes and push to the upstream repository.

.. prompt:: bash $

   git add .
   git commit -m 'docs: short commit message [skip ci]'
   git push origin


5. Deploy
+++++++++

Once documentation have been committed to the Streetmix ``main`` branch, Read the Docs will automatically build and deploy the revised documentation to https://streetmix.readthedocs.io/. Read the Docs does not wait for continuous integration to pass, and a production build will be triggered on each commit.
