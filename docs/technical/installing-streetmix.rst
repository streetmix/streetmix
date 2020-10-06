.. _install-streetmix:

Installing Streetmix
====================

These instructions are for first-time setup on a "local" or "development" environment.


.. contents:: Contents
   :local:
   :depth: 1


.. _install-macosx:

On Mac OS X
-----------

Prerequisites
+++++++++++++

You may already have some of these prerequisites installed. Skip or update the packages that already exist.

1. Install the `XCode Developer Tools <https://itunes.apple.com/us/app/xcode/id497799835?mt=12>`_.
2. Optionally, install the `Homebrew <http://brew.sh/>`_ package manager. This makes installing other software packages easier, but you can use any other package installation method you wish. In this example and in the following steps, we will use the command line to set up your development environment.

   .. prompt:: bash $

      /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

3. Install `Node.js <https://nodejs.org/en/>`_. In production, Streetmix uses the latest "Active LTS" release. Locally, you should be able to use any version of Node.js in the "Current" or "Active" state. In the example command below, we will install Node.js with Homebrew:

   .. prompt:: bash $

      brew install nodejs

4. Install PostgreSQL. You can `download MacOSX packages here <https://www.postgresql.org/download/macosx/>`_ or use the `Postgress app <https://postgresapp.com/>`_, but the easiest method would be to use Homebrew, again:

   .. prompt:: bash $

      brew install postgres

5. Install PostGIS. You can `download MacOSX packages here <https://postgis.net/install/>`_ but just like above the easiest method would be to use Homebrew:

   .. prompt:: bash $

      brew install postgis

Clone and install Streetmix
+++++++++++++++++++++++++++

1. Clone the Streetmix repository to a folder on your computer.

   .. prompt:: bash $

      git clone https://github.com/streetmix/streetmix.git


2. Change the directory to Streetmix's root directoy, and install project dependencies.

   .. prompt:: bash $

      cd streetmix
      npm install

.. caution::

   We do not currently use the **Yarn** package manager. Installing with Yarn may have unpredictable results.


3. Initialize Postgres database.

   .. prompt:: bash $

      npx sequelize db:create
      npx sequelize db:migrate


Run Streetmix
+++++++++++++

See :ref:`install-all`, below.


.. _install-windows:

On Windows
----------

These instructions below will assume that the user has basic familiarity with Git, GitHub, and the Windows Terminal command line interface, and has administrative permissions to install software on the machine.

.. warning::

   Streetmix was not developed on a Windows platform, and testing is limited. Although our users have successfully stood up Streetmix on Windows machines in the past, these instructions may be out of date.


Prerequisites
+++++++++++++

You may already have some of these prerequisites installed. Skip or update the packages that already exist.

1. Install `a modern browser <http://browsehappy.com/>`_. We recommend Firefox or Chrome. Internet Explorer is not supported. (See :ref:`faq-internet-explorer`).

2. Install `Git <http://git-scm.com/download/win>`_.

3. Install `Node.js`_. The site should detect your system and provide you with the correct install executable, but you may download a specific package at http://nodejs.org/download/ (e.g. Windows 64-bit installer). In production, Streetmix uses the latest “Active LTS” release. Locally, you should be able to use any version of Node.js in the “Current” or “Active” state.

4. Install PostgreSQL. You can `download Windows packages here <https://www.postgresql.org/download/windows/>`_.

5. Install PostGIS. You can `download Windows packages here <https://postgis.net/windows_downloads/>`_.


Clone and install Streetmix
+++++++++++++++++++++++++++

1. In the command line terminal, clone the Streetmix repository to a folder on your computer.

   .. prompt:: bash $

      git clone https://github.com/streetmix/streetmix.git


2. Change the directory to Streetmix's root directoy, and install project dependencies.

   .. prompt:: bash $

      cd streetmix
      npm install

.. caution::

   We do not currently use the **Yarn** package manager. Installing with Yarn may cause unpredictable errors.

3. Initialize Postgres database.

   .. prompt:: bash $

      npx sequelize db:create
      npx sequelize db:migrate

.. tip::
  In general, sequelize should offer some sort of confirmation or error after completing these commands. If creating the database is successful, you should be able to see the database listed on your system by introspecting your databases using psql, PgAdmin, or other tools. The database needs to successfully exist before migrations can occur.
  Currently, there is not a reliable way to run the application without having a successfully created database, so this is an important step!

Run Streetmix
+++++++++++++

See :ref:`install-all`, below.


.. _install-linux:

On Linux
----------

The primary requirements for this project are Node.js, PostgreSQL and PostGIS. You will need those installed if you do not have them already.

`Installing Node.js <https://www.ostechnix.com/install-node-js-linux/>`_

`Installing Postgres <http://postgresguide.com/setup/install.html>`_

`Installing PostGIS <https://postgis.net/install/>`_

If you haven't installed Postgres on your machine before, you may need to set up some intial configuration. `Here is an example for ArchLinux <https://wiki.archlinux.org/index.php/PostgreSQL>`_.

You may need to look for instructions more specific to your distro for setting up Postgres.

We also welcome contributions to our documentation, so if you get Streetmix up and running on a different distro and would like to share how, please feel free!


.. _install-all:

Instructions for all systems
----------------------------


.. _install-env-vars:

Setting environment variables
+++++++++++++++++++++++++++++

Environment variables store secret values (like authentication keys and passwords) used to connect to third-party services. Just like regular passwords, secrets should never be revealed to the public, so we store them in a :file:`.env` file that isn't committed to the repository.

You can create a :file:`.env` by renaming the starter :file:`.env.example` in the Streetmix root directory.

To obtain keys for local development, you should be able to create your own free-tier accounts at each service and refer to their documentation for more information. To obtain keys to production resources, you will need to ask the project maintainers.


Required environment variables
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The only required environment variables are the keys used for the Auth0 authentication service. Streetmix will run without this, but a lot of functionality is only available to signed-in users, and you will need these keys to sign in.

+-----------------------------------+----------------------------------------------+-----------+
| Variable name                     | Description                                  | Required  |
+===================================+==============================================+===========+
| ``AUTH0_CLIENT_ID``               | Authentication service (Auth0) client ID     | Yes       |
+-----------------------------------+----------------------------------------------+-----------+
| ``AUTH0_CLIENT_SECRET``           | Authentication service (Auth0) client secret | Yes       |
+-----------------------------------+----------------------------------------------+-----------+


Optional environment variables
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Streetmix will run without these keys. Some functionality will be limited, but they are not critical.

+-----------------------------------+----------------------------------------------+-----------+
| Variable name                     | Description                                  | Required  |
+===================================+==============================================+===========+
| ``PELIAS_API_KEY``                | Geocoding (Pelias) API key                   | No        |
+-----------------------------------+----------------------------------------------+-----------+
| ``IPSTACK_API_KEY``               | Geolocation (IPStack) API key                | No        |
+-----------------------------------+----------------------------------------------+-----------+
| ``TRANSIFEX_API_TOKEN``           | Translations (Transifex) API token           | No        |
+-----------------------------------+----------------------------------------------+-----------+
| ``CLOUDINARY_API_KEY``            | Image cloud storage (Cloudinary) key         | No        |
+-----------------------------------+----------------------------------------------+-----------+
| ``CLOUDINARY_API_SECRET``         | Image cloud storage (Cloudinary) secret      | No        |
+-----------------------------------+----------------------------------------------+-----------+
| ``TWITTER_OAUTH_CONSUMER_KEY``    | Twitter OAuth consumer key *(deprecated)*    | No        |
+-----------------------------------+----------------------------------------------+-----------+
| ``TWITTER_OAUTH_CONSUMER_SECRET`` | Twitter OAuth consumer secret *(deprecated)* | No        |
+-----------------------------------+----------------------------------------------+-----------+


Optional database configuration (Postgres)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Environment variables are the preferred way for Postgres to access the database. If you have a local database that are not using default values, you can set these here as well. Usually, you won't need to specify these at all.

+-----------------------------------+------------------------------+---------------------------+
| Variable name                     | Description                  | Default value             |
+===================================+==============================+===========================+
| ``PGUSER``                        | Postgres username            | (none)                    |
+-----------------------------------+------------------------------+---------------------------+
| ``PGPASSWORD``                    | Postgres password            | (none)                    |
+-----------------------------------+------------------------------+---------------------------+
| ``PGDATABASE``                    | Postgres database name       | ``streetmix_dev``         |
+-----------------------------------+------------------------------+---------------------------+
| ``PGHOST``                        | Postgres server host IP      | ``127.0.0.1``             |
+-----------------------------------+------------------------------+---------------------------+
| ``PGPORT``                        | Postgres server post         | ``5432``                  |
+-----------------------------------+------------------------------+---------------------------+


Sample .env
~~~~~~~~~~~

A sample :file:`.env` file looks like this:

.. code::

   AUTH0_CLIENT_ID=1234567890
   AUTH0_CLIENT_SECRET=abcdefghij
   PELIAS_API_KEY=a2c4e6g8i


Starting the application
++++++++++++++++++++++++

1. Start Postgres.

2. Start the web server. In the Streetmix project directory, run:

   .. prompt:: bash $

      npm start

3. Load the application in your web browser by navigating to ``http://localhost:8000`` or by running in your terminal:

   .. prompt:: bash $

      open http://localhost:8000


Stopping the application
++++++++++++++++++++++++

To stop running Streetmix, press :kbd:`Ctrl-C`.

In case it doesn't work, you can run this command to manually clean up background tasks:

.. prompt:: bash $

   npm stop


Updating the application
++++++++++++++++++++++++

Every so often, you will need to update the project.

1. Pull the latest code from the repository.

   .. prompt:: bash $

      git pull

2. Install the latest version of all dependencies.

   .. prompt:: bash $

      npm install

3. Update the database schema.

   .. prompt:: bash $

      npx sequelize db:migrate

.. tip::

   If you run into issues migrating the database, you can access Sequelize's "verbose" debug output with the command ``DEBUG=sequelize* npx sequelize db:migrate``. (This feature is not well-documented by Sequelize, which is why we're mentioning it ourselves.)

   Debug a migration on a Heroku application instance like so: ``heroku run 'DEBUG=sequelize* npx sequelize db:migrate' --app <heroku app id>`` (Note the quotation marks surrounding the command.)


Setup in a no-internet environment
----------------------------------

This is for a special case where you may need to deploy Streetmix onto machines that are going to be running in an environment without Internet access, such as a public space without Wi-Fi, or a conference center with very limited Wi-Fi. To put Streetmix into "no Internet mode", set your :envvar:`NODE_ENV` environment variable to ``demo``.

You may do this by editing the :file:`.env` file (see :ref:`install-env-vars` for more information about this file).

You can also do it one time by starting the server like this:

.. prompt:: bash $

   NODE_ENV=demo npm start


.. caution::

   "No Internet mode" is not a well-supported feature of Streetmix. Use it with care.


.. tip::

   When you are running Streetmix on a device without Internet access, you do not need to provide environment variables for to authenticate third-party services such as Auth0.


Troubleshooting
---------------

If you run into problems, please see the :ref:`troubleshooting-development-issues` section.
