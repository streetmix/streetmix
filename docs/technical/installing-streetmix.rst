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

4. Install `MongoDB version 3.4 <https://www.mongodb.com/download-center/community>`_. Newer versions of MongoDB may introduce breaking changes, and we have a long term plan to migrate away from MongoDB and towards PostgreSQL. In the example command below, we will install MongoDB with Homebrew:

   .. prompt:: bash $

      brew install mongodb@3.4

5. `Set up MongoDB's data directory <https://docs.mongodb.org/manual/tutorial/install-mongodb-on-os-x/#run-mongodb>`_.

   .. prompt:: bash $

      mkdir -p /data/db
      chmod 777 /data/db

.. tip::

   You may run into permissions issues, even if you are an administrator on your machine. You may need to run ``chown`` to give yourself ownership over any directories that you are manipulating. Alternatively, you may need to use ``sudo`` to run commands as a superuser.

6. Add MongoDB binaries to the PATH environment variable. The most common way this can be done by editing ``~/.bash_profile``. Using a text editor, open that file and add this line at the bottom of it:

   .. code::

      export PATH="/usr/local/opt/mongodb@3.4/bin:$PATH"

   Save the file, then restart your Terminal. You can double check if this worked like so:

   .. prompt:: bash $

      echo $PATH

.. note::

   Some systems are set up differently and may have other methods for setting environment variables.


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

   We do not currently use the **Yarn** package manager. Installing with Yarn may cause unpredictable errors.


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

1. Install `a modern browser <http://browsehappy.com/>`_. We recommend Firefox or Chrome. Internet explorer is not supported. (See :ref:`faq-internet-explorer`).

2. Install `Git <http://git-scm.com/download/win>`_.

3. Install `Node.js`_. The site should detect your system and provide you with the correct install executable, but you may download a specific package at http://nodejs.org/download/ (e.g. Windows 64-bit installer). In production, Streetmix uses the latest “Active LTS” release. Locally, you should be able to use any version of Node.js in the “Current” or “Active” state.

4. Install `MongoDB version 3.4 <https://www.mongodb.com/download-center/community>`_. Newer versions of MongoDB may introduce breaking changes, and we have a long term plan to migrate away from MongoDB and towards PostgreSQL. Select the appropriate Windows installer package from their downloads page.

5. Set up the MongoDB environment. `Follow the instructions under “Set up the MongoDB environment” from the MongoDB website. <http://docs.mongodb.org/manual/tutorial/install-mongodb-on-windows/#run-mongodb>`_

6. Add MongoDB binaries to your system path. Open the Start Menu and type in "environment variables", and select *Edit the system environment variables*. You should see the *Advanced* tab of *System Properties*. Click "Environment Variables..." at the lower right corner of the panel. In the user variables, select or create a variable called "Path", then edit it and add a new entry containing ``C:\Program Files\MongoDB\Server\3.4\bin`` (or the path you installed MongoDB to). Click OK until you return to the *System Properties* window, click Apply then click OK to exit.


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

3. Open ``package.json`` and remove the following line:

   .. code::

      "prestart": "npm run mongo:start"` and `"mongo:start": "mongod --fork --logpath /dev/null"

   We can't automatically start MongoDB with ``npm start`` on Windows, so we remove this line to prevent errors.

4. Run MongoDB's ``mongod.exe`` and ``mongo.exe``. This will need to be run manually in the background before running Streetmix (see below).


Run Streetmix
+++++++++++++

See :ref:`install-all`, below.


.. _install-linux:

On Linux
----------

.. admonition:: TODO

   This section has not yet been written.


.. _install-all:

Instructions for all systems
----------------------------

.. _install-env-vars:

Setting environment variables
+++++++++++++++++++++++++++++

Environment variables store secret values (like authentication keys and passwords) to third-party services. We can't commit these keys to the repository, or they might be stolen and abused by strangers. To obtain keys for environment variables, you should refer to each service's documentation. Your team may also have keys to share.

We recommend setting environment variables in a file named ``.env`` in the Streetmix root directory. The ``.env`` file is ignored by Git, so you won't accidentally commit secret keys into the repository.

+-----------------------------------+----------------------------------------------+-----------+
| Variable name                     | Description                                  | Required  |
+===================================+==============================================+===========+
| ``AUTH0_CLIENT_ID``               | Auth0 client ID                              | Yes       |
+-----------------------------------+----------------------------------------------+-----------+
| ``AUTH0_CLIENT_SECRET``           | Auth0 client secret                          | Yes       |
+-----------------------------------+----------------------------------------------+-----------+
| ``PELIAS_API_KEY``                | Geocoding (Pelias) API key                   | No        |
+-----------------------------------+----------------------------------------------+-----------+
| ``IPSTACK_API_KEY``               | Geolocation (IPStack) API key                | No        |
+-----------------------------------+----------------------------------------------+-----------+
| ``TRANSIFEX_API_TOKEN``           | Your Transifex API token                     | No        |
+-----------------------------------+----------------------------------------------+-----------+
| ``TWITTER_OAUTH_CONSUMER_KEY``    | Twitter OAuth consumer key *(deprecated)*    | No        |
+-----------------------------------+----------------------------------------------+-----------+
| ``TWITTER_OAUTH_CONSUMER_SECRET`` | Twitter OAuth consumer secret *(deprecated)* | No        |
+-----------------------------------+----------------------------------------------+-----------+

A sample ``.env`` file looks like this:

.. code::

   AUTH0_CLIENT_ID=1234567890
   AUTH0_CLIENT_SECRET=abcdefghij
   PELIAS_API_KEY=a2c4e6g8i


Starting the application
++++++++++++++++++++++++

1. Start the web server. In the Streetmix project directory, run:

   .. prompt:: bash $

      npm start


   On Mac OS X, this also automatically starts MongoDB in the background.

.. note ::

   On Mac OS X, if MongoDB is already running, you may need to stop it before starting the server again.

   On Windows, be sure to run MongoDB manually before starting Streetmix.


2. Load the application in your web browser by navigating to ``http://localhost:8000`` or by running in your terminal:

   .. prompt:: bash $

      open http://localhost:8000


Stopping the application
++++++++++++++++++++++++

To stop running Streetmix, press ``Ctrl-C``.

On Mac OS X, this should also automatically stop the MongoDB server. In case it doesn't work, you can run this command to manually clean up background tasks:

.. prompt:: bash $

   npm stop


Setup in a no-internet environment
----------------------------------

This is for a special case where you may need to deploy Streetmix onto machines that are going to be running in an environment without Internet access, such as a public space without Wi-Fi, or a conference center with very limited Wi-Fi. To put Streetmix into "no Internet mode", set your ``NODE_ENV`` environment variable to ``demo``.

You may do this by editing the ``.env`` file (see :ref:`install-env-vars` for more information about this file).

You can also do it one time by starting the server like this:

.. prompt:: bash $

   NODE_ENV=demo npm start


.. caution::

   "No Internet mode" is not a well-supported feature of Streetmix. Use it with care.


.. tip::

   When you are running Streetmix on a device without Internet access, you do not need to provide environment variables for to authenticate third-party services such as Auth0.


Troubleshooting
---------------

If you run into problems, please reach out to us. :ref:`contact`.
