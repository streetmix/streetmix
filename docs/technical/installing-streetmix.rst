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

1. Install `XCode Developer Tools <https://itunes.apple.com/us/app/xcode/id497799835?mt=12>`_.

2. Optionally, install the `Homebrew <http://brew.sh/>`_ package manager. This makes installing other software packages easier, but you can use any other package installation method you wish. In this example and in the following steps, we will use Homebrew on the command line to set up your development environment.

   .. prompt:: bash $

      /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

3. Install `Node.js <https://nodejs.org/en/>`_. In production, Streetmix uses the latest "Active LTS" release. Locally, you should be able to use any version of Node.js in the "Current" or "Active" state. While you can download installers and binaries from the website, Homebrew makes it easier to keep Node.js up to date in the future. Let's install Node.js with Homebrew:

   .. prompt:: bash $

      brew install nodejs

4. Install PostgreSQL. You can `download MacOSX packages here <https://www.postgresql.org/download/macosx/>`_ or use the `Postgres app <https://postgresapp.com/>`_, but the easiest method would be to use Homebrew, again:

   .. prompt:: bash $

      brew install postgres

5. Install PostGIS. You can `download MacOSX packages here <https://postgis.net/install/>`_ but just like above the easiest method would be to use Homebrew:

   .. prompt:: bash $

      brew install postgis


Install and run Streetmix
+++++++++++++++++++++++++

See :ref:`install-all`, below.


.. _install-windows:

On Windows
----------

These instructions below will assume that the user has basic familiarity with Git, GitHub, and the Git Bash or Windows Powershell command line interface, and has administrative permissions to install software on the machine.

.. warning::

   Streetmix was not developed on a Windows platform, and testing is limited. Although our users have successfully stood up Streetmix on Windows machines in the past, these instructions may be out of date.


Prerequisites
+++++++++++++

You may already have some of these prerequisites installed. Skip or update the packages that already exist.

1. Install `a modern browser <http://browsehappy.com/>`_. We recommend Firefox or Chrome. Internet Explorer is not supported. (See :ref:`faq-internet-explorer`).

2. Install `Git <http://git-scm.com/download/win>`_. You may want to consider following Microsoft's guide to `Windows Subsystem for Linux <https://docs.microsoft.com/en-us/windows/wsl/tutorials/wsl-git>`_, which helps us provide similar command line instructions to Mac OSX and Linux environments.

3. Install `Node.js`_. The site should detect your Windows system and provide you with the correct install executable, but you may download a specific package at http://nodejs.org/download/ (e.g. Windows 64-bit installer). In production, Streetmix uses the latest “Active LTS” release. Locally, you should be able to use any version of Node.js in the “Current” or “Active” state.

4. Install PostgreSQL. You can `download Windows packages here <https://www.postgresql.org/download/windows/>`_.

5. Install PostGIS. You can `download Windows packages here <https://postgis.net/windows_downloads/>`_.


Install and run Streetmix
+++++++++++++++++++++++++

See :ref:`install-all`, below.


.. _install-linux:

On Linux
--------

The Linux ecosystem can vary greatly depending on distribution (or "distro") and developer preferences, which makes it challenging to maintain accurate and up-to-date installation instructions that will be perfect for every instance. Consequently, our instructions must assume that the user has basic familiarity with their own system, that common developer tools such as :code:`git` are already installed or that the user knows how to obtain them on their own, and that the user has the necessary permissions to install software on the machine.

Here, our goal is to provide quick-start instructions that should work in most cases, with minimal configuration. However, experienced developers should feel free to modify any of the instructions as necessary according to their own preferences (e.g. database usernames, etc.).


Prerequisites
+++++++++++++

The primary requirements for this project are Node.js, PostgreSQL and PostGIS. You will need those installed if you do not have them already.

1. Install `Node.js`_. There are different methods for installing Node.js, and you will need to choose a method depending on your own preference. In production, Streetmix uses the latest “Active LTS” release. Locally, you should be able to use any version of Node.js in the “Current” or “Active” state.

   - **Method 1: install with nvm (recommended).** :code:`nvm` is a command-line tool to manage multiple Node.js versions on a machine. This is effective for development and troubleshooting with multiple Node.js versions, and also makes it easy to install and upgrade Node.js versions over time. `Learn how to install and use nvm from the repository: https://github.com/nvm-sh/nvm <https://github.com/nvm-sh/nvm>`_.

   - **Method 2: package manager installation.** Many Linux distributions have package managers from where you can install Node.js. The Node.js documentation provides `a list of package managers and installation instructions <https://nodejs.org/en/download/package-manager/>`_, but please note the disclaimer that package manager versions are maintained by the Linux community, not by the Node.js team. As a result, not all package managers have the latest Node.js versions at all times.

   - **Method 3: source download.** `Download the latest source tarball from the Node.js homepage <https://nodejs.org/>`_ or `choose a specific package from the Node.js download page <https://nodejs.org/download/>`_. Instructions for installing from source are sparse and is only recommended for expert Node.js users.

2. Install PostgreSQL. From the `PostgreSQL download page <https://www.postgresql.org/download/>`_ select Linux, then your Linux distribution, for installation instructions.

3. Install PostGIS. `Linux instructions (per distribution) are available here <https://postgis.net/install/>`_.

4. Configure PostgreSQL. If this is your first time installing PostgreSQL, you may need to set up some initial configuration, in the next section.


PostgreSQL configuration
++++++++++++++++++++++++

ArchLinux
~~~~~~~~~

Here is `additional setup instructions for ArchLinux <https://wiki.archlinux.org/index.php/PostgreSQL>`_.

Debian/Ubuntu
~~~~~~~~~~~~~

In our experience, the Debian or Ubuntu package restricts the authentication methods such that one must set up a username with a password in order for Streetmix to be able to access the database. If you experience login problems, check the pg_hba.conf file (`see documentation <https://www.postgresql.org/docs/12/auth-pg-hba-conf.html>`_) to see if the ``trust`` authentication method isn't present for the user. You can either modify that configuration file, or follow these basic instructions for setting up a new user.

   .. prompt:: bash $

      # Switch to the PostgreSQL administrator user
      sudo -iu postgres
      
      # Create a new username
      # Tip: if you create a user with the same name as your Linux
      # username, you won't need to set the username in Streetmix
      createuser streetmix_user
      
      # Enter the PostgreSQL console
      psql

      # Give your user permission to create and migrate the database
      ALTER USER streetmix_user WITH CREATEDB SUPERUSER;

      # Set a user password
      ALTER USER streetmix_user WITH PASSWORD 'password';
      
      # Leave the database
      # Note: if prompted, type \q
      exit
      
      # Switch back to original user
      exit

The user created here only needs the ``SUPERUSER`` role during migration. After a successful initial migration, you may remove the ``SUPERUSER`` role.


Other
~~~~~

You may need to look for instructions more specific to your distro for setting up PostgreSQL.

We also welcome contributions to our documentation, so if you get Streetmix up and running on a different distro and would like to share how, please feel free!



Install and run Streetmix
+++++++++++++++++++++++++

See :ref:`install-all`, below.


.. _install-all:

Instructions for all systems
----------------------------

After installing all prerequisites (depending on your platform, see above), you can now install and run Streetmix. Assuming all the prerequisites are installed correctly, the instructions below should work on most platforms in the command line terminal. (Note: for Windows platforms, we recommend using Git Bash or Windows Powershell to use these commands.)


Clone and install Streetmix
+++++++++++++++++++++++++++

1. In the command line terminal, clone the Streetmix repository to a folder on your computer.

   .. prompt:: bash $

      git clone https://github.com/streetmix/streetmix.git


2. Change the directory to Streetmix's root directory, and install project dependencies.

   .. prompt:: bash $

      cd streetmix
      npm install

   .. caution::

      We are not using the **Yarn** package manager. Installing with Yarn may cause unpredictable errors.


3. (Optional) If necessary, create a :file:`.env` file and set PosgreSQL credentials. **Note: By default, most environments will not require PostgreSQL credentials.** For more information, including instructions for setting third-party tokens to run services like authentication or localization, see :ref:`install-env-vars`.

   .. prompt:: bash $

      # Make a copy of the environment variables file
      cp .env.example .env

      # Using vim, but replace with your editor
      vim .env

   You may use any editor you wish in place of vim. Set your username and password, as well as other database credentials, as necessary, by uncommenting the appropriate lines and setting the environment variables. The following is an example:

   .. code::

      PGUSER=streetmix_user
      PGPASSWORD=streetmix

   .. tip::

      If the PostgreSQL username is the same as your operating system's current username, ``PGUSER`` is assumed to be that username by default, and you won't need to set it explicitly.


4. Initialize the PostgreSQL database.

   .. prompt:: bash $

      npx sequelize db:create
      npx sequelize db:migrate
      NODE_ENV=test npx sequelize db:create
      NODE_ENV=test npx sequelize db:migrate

   .. tip::

      If you run into issues creating or migrating the database, you can access Sequelize's "verbose" debug output with the command ``DEBUG=sequelize* npx sequelize db:migrate``. (This feature is not well-documented by Sequelize.)

      Debug a migration on a Heroku application instance like so: ``heroku run 'DEBUG=sequelize* npx sequelize db:migrate' --app <heroku app id>`` (Note the quotation marks surrounding the command.)

   In general, Sequelize will print a confirmation or an error after completing each command. If creating the database is successful, you should be able to see the database using psql, PgAdmin, or other tools. A modern, open source, and cross-platform database GUI tool is `Beekeeper Studio <https://www.beekeeperstudio.io/>`_. The database needs to successfully exist before migrations can occur.

   Notice that the database create and migrate commands are run a second time prepended with ``NODE_ENV=test``. This is because your local environment and a test environment use different database instances, and both of them need to be set up.

   You cannot run Streetmix without successfully creating a database, so this is an important step!


.. _install-env-vars:

Setting environment variables
+++++++++++++++++++++++++++++

Environment variables store secret values (like authentication keys and passwords) used to connect to third-party services. Just like regular passwords, secrets should never be revealed to the public, so we store them in a :file:`.env` file that isn't committed to the repository.

You can create a :file:`.env` by copying the starter :file:`.env.example` in the Streetmix root directory.

To obtain keys for local development, you should be able to create your own free-tier accounts at each service and refer to their documentation for more information. To obtain keys to production resources, you will need to ask the project maintainers.


Required environment variables
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The only required environment variables are the keys used for the Auth0 authentication service. Streetmix will run without this, but a lot of functionality is only available to signed-in users, and you will need these keys to sign in.

+-----------------------------------+----------------------------------------------+-----------+
| Variable name                     | Description                                  | Required  |
+===================================+==============================================+===========+
| ``AUTH0_DOMAIN``                  | Authentication service (Auth0) domain        | Yes       |
+-----------------------------------+----------------------------------------------+-----------+
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
| ``TRANSIFEX_API_TOKEN``           | Translations (Transifex) API token           | No        |
+-----------------------------------+----------------------------------------------+-----------+
| ``CLOUDINARY_API_KEY``            | Image cloud storage (Cloudinary) key         | No        |
+-----------------------------------+----------------------------------------------+-----------+
| ``CLOUDINARY_API_SECRET``         | Image cloud storage (Cloudinary) secret      | No        |
+-----------------------------------+----------------------------------------------+-----------+


Optional database configuration (PostgreSQL)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Environment variables are the preferred way for PostgreSQL to access the database. If you have a local database that are not using default values, you can set these here as well. Usually, you won't need to specify these at all.

+-----------------------------------+------------------------------+---------------------------+
| Variable name                     | Description                  | Default value             |
+===================================+==============================+===========================+
| ``PGUSER``                        | PostgreSQL username          | (your system username)    |
+-----------------------------------+------------------------------+---------------------------+
| ``PGPASSWORD``                    | PostgreSQL password          | (none)                    |
+-----------------------------------+------------------------------+---------------------------+
| ``PGDATABASE``                    | PostgreSQL database name     | ``streetmix_dev``         |
+-----------------------------------+------------------------------+---------------------------+
| ``PGHOST``                        | PostgreSQL server host IP    | ``127.0.0.1``             |
+-----------------------------------+------------------------------+---------------------------+
| ``PGPORT``                        | PostgreSQL server post       | ``5432``                  |
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

1. Start the PostgreSQL service. (Note: the method for doing this may differ depending on your operating system and how you installed PostgreSQL.)

2. Start the web server. In the Streetmix project directory, run:

   .. prompt:: bash $

      npm start

3. Load the application in your web browser by navigating to ``http://localhost:8000`` or by running in your terminal:

   .. prompt:: bash $

      open http://localhost:8000


Stopping the application
++++++++++++++++++++++++

To stop running Streetmix, press :kbd:`Ctrl-C`.


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


Setup in an offline environment
-------------------------------

This is for a special case where you may need to deploy Streetmix onto machines that are going to be running in an environment without Internet access, such as a public space without Wi-Fi, or a conference center with very limited Wi-Fi. To put Streetmix into "offline mode", set your :envvar:`NODE_ENV` environment variable to ``demo``.

You may do this by editing the :file:`.env` file (see :ref:`install-env-vars` for more information about this file).

You can also do it one time by starting the server like this:

.. prompt:: bash $

   NODE_ENV=demo npm start


.. caution::

   "Offline mode" is not a well-supported feature of Streetmix. Use it with care.


.. tip::

   When you are running Streetmix on a device without Internet access, you do not need to provide environment variables for to authenticate third-party services such as Auth0.


Troubleshooting
---------------

If you run into problems, please see the :ref:`troubleshooting-development-issues` section.
