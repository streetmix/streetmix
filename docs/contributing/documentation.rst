Documentation
=============

.. warning::

   This section is a work in progress.


You're looking at it!

Our documentation lives in the Streetmix repository and it's built and hosted by `Read the Docs <https://readthedocs.org/>`_.


Setup
-----

It is not required to build documentation locally to work on Streetmix. However, it *is* a good idea to document whatever you're working on, so being able to update documentation would be a great idea! Here's how to set up a local development instance of the documentation.

0. Install python
+++++++++++++++++

TODO


1. Install dependencies
+++++++++++++++++++++++

Install `Sphinx`_, the `Read the Docs Sphinx theme`_, and extensions.

.. _Sphinx: http://www.sphinx-doc.org/en/stable/
.. _Read the Docs Sphinx theme: https://sphinx-rtd-theme.readthedocs.io/en/latest/installing.html

.. prompt:: bash $
   
   pip install sphinx sphinx-prompt sphinx_rtd_theme 


2. Set current working directory
++++++++++++++++++++++++++++++++

.. prompt:: bash $

   cd docs


3. Build documentation
++++++++++++++++++++++

.. prompt:: bash $

   make dirhtml

.. note::

   The directory HTML renderer will create URLs that match what we use on Read the Docs.


4. Preview
++++++++++

Then run a static file server like ``http-server`` to view the built documentation.

.. prompt:: bash $

   http-server _build/dirhtml

.. note::

   This is currently a very manual process. Future improvements to this process include:

   1. an ``npm`` package script for installing dependencies, and building and viewing documentation
   2. automatically watching, building, and live-reloading documentation

