Documentation
=============

.. warning::

   This section is a work in progress.


You're looking at it!

Our documentation lives in the Streetmix repository and it's built and hosted by `Read the Docs <https://readthedocs.org/>`_.


Setup
-----

It is not required to build documentation locally to work on Streetmix. However, it *is* a good idea to document whatever you're working on, so being able to update documentation would be a great idea! Here's how to set up a local development instance of the documentation.


1. Install dependencies
+++++++++++++++++++++++

First, make sure you have a working Python development environment on your system. Installing Python is outside of the scope of this guide.

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

   The directory HTML renderer will create URLs that match what we use on Read the Docs.


Alternatively, we've provided an ``npm`` package script that can build documentation from the root directory.

.. prompt:: bash $

   npm run docs:build


3. Preview
++++++++++

Then run a static file server, such as ``http-server``, to view the built documentation.

.. prompt:: bash $

   http-server _build/dirhtml


You may use any static file server solution you wish. We've also provided an ``npm`` package script that assumes ``http-server`` is available on the system's global packages and will automatically serve the documentation locally at ``http://localhost:8080/``.

.. prompt:: bash $

   npm run docs:serve


.. attention::

   We do not yet have a watch and livereload system for rebuilding documentation when contents change, but this would be a good project to take on.


4. Upload
+++++++++

Commit your changes.

.. prompt:: bash $

   git add docs/
   git commit -m 'docs: short commit message [skip ci]'

5. Deploy
+++++++++

Read the Docs will automatically build and deploy changed documentation to https://streetmix.readthedocs.io/.
