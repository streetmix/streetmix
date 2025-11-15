---
sidebar_position: 2
---

# Local setup

These instructions are for first-time setup on a "local" or "development" environment.

## On Mac OS X {#setup-macosx}

### Prerequisites

You may already have some of these prerequisites installed. Skip or update the packages that already exist.

1. Install **[XCode Developer Tools](https://itunes.apple.com/us/app/xcode/id497799835?mt=12)**.

2. (Optional) Install the **[Homebrew](http://brew.sh/) package manager**. This makes installing other software packages easier, but you can use any other package installation method you wish. In this example and in the following steps, we will use Homebrew on the command line to set up your development environment.

```shell-session
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

3. Install **[Node.js](https://nodejs.org/en/)**. In production, Streetmix uses the latest "Active LTS" release. Locally, you should be able to use any version of Node.js in the "Current" or "Active" state. While you can download installers and binaries from the website, Homebrew makes it easier to keep Node.js up to date in the future. Let's install Node.js with Homebrew:

```shell-session
brew install nodejs
```

:::tip

If you do a lot of Node.js development and want to manage multiple versions (e.g. for working on different projects) we recommend installing Node.js with [nvm](https://github.com/nvm-sh/nvm) instead of Homebrew.

:::

4. Install **PostgreSQL**. You can [download a MacOSX package](https://www.postgresql.org/download/macosx/) or use the [Postgres app](https://postgresapp.com/), but the easiest method would be to use Homebrew, again:

```shell-session
brew install postgres
```

5. Install **PostGIS**. You can [download a MacOSX package](https://postgis.net/install/) but just like above the easiest method would be to use Homebrew:

```shell-session
brew install postgis
```

### Install and run Streetmix

After prerequisites are installed, continue to [Instructions for all systems](#setup-all).

## On Windows {#setup-windows}

These instructions below will assume that the user has basic familiarity with Git, GitHub, and the Git Bash or Windows Powershell command line interface, and has administrative permissions to install software on the machine.

:::warning

Streetmix was not developed on a Windows platform, and testing is limited. These instructions may go out of date without warning.

:::

### Prerequisites

You may already have some of these prerequisites installed. Skip or update the packages that already exist.

1. Install [a modern browser](http://browsehappy.com/). We recommend **Firefox** or **Chrome**. [Internet Explorer is not supported](/user-guide/support/faq#internet-explorer).
2. Install **[Git](http://git-scm.com/download/win)**. You may want to consider following Microsoft's guide to [Windows Subsystem for Linux](https://docs.microsoft.com/en-us/windows/wsl/tutorials/wsl-git), which helps us provide similar command line instructions to Mac OSX and Linux environments.
3. Install **[Node.js](http://nodejs.org/)**. The site should detect your Windows system and provide you with the correct install executable, or you can choose to download [a specific package or installer](http://nodejs.org/en/download/). In production, Streetmix uses the latest "Active LTS" release. Locally, you should be able to use any version of Node.js in the "Current" or "Active" state.
4. Install **PostgreSQL**. You can [download a Windows package here](https://www.postgresql.org/download/windows/).
5. Install **PostGIS**. You can [download a Windows package here](https://postgis.net/windows_downloads/).

### Install and run Streetmix

After prerequisites are installed, continue to [Instructions for all systems](#setup-all).

## On Linux {#setup-linux}

The Linux ecosystem can vary greatly depending on distribution (or _distro_) and developer preferences, which makes it challenging to maintain accurate and up-to-date installation instructions that will be perfect for every instance. Consequently, our instructions must assume that the user has basic familiarity with their own system, that common developer tools such as `git` are already installed or that the user knows how to obtain them on their own, and that the user has the necessary permissions to install software on the machine.

Here, our goal is to provide quick-start instructions that should work in most cases, with minimal configuration. However, experienced developers should feel free to modify any of the instructions as necessary according to their own preferences (e.g. database usernames, etc.).

### Prerequisites

The primary requirements for this project are Node.js, PostgreSQL and PostGIS. You will need those installed if you do not have them already.

1. Install **[Node.js](http://nodejs.org/)**. There are different methods for installing Node.js, and you will need to choose a method depending on your own preference. In production, Streetmix uses the latest "Active LTS" release. Locally, you should be able to use any version of Node.js in the "Current" or "Active" state.
   - **Method 1: install with nvm (recommended).** `nvm` is a command-line tool that manages multiple Node.js versions on a machine. [Learn how to install and use nvm](https://github.com/nvm-sh/nvm).
   - **Method 2: package manager installation.** You can use install Node.js from most Linux distributions' [package managers](https://nodejs.org/en/download/package-manager/). Please keep in mind that package manager repositories are maintained by the Linux community, not by the Node.js team. As a result, package manager versions may lag behind the latest Node.js versions.
   - **Method 3: source download.** [Download the latest source tarball from the Node.js homepage](https://nodejs.org/) or [choose a specific package from the Node.js download page](https://nodejs.org/download/). Instructions for installing from source are sparse and is only recommended for expert Linux users.
2. Install **PostgreSQL**. From the [PostgreSQL download page](https://www.postgresql.org/download/), select Linux, then your Linux distribution, for installation instructions.
   - You may need to do some additional [distro-specific configuration](#configure-postgresql).
3. Install **PostGIS**. [Linux instructions (per distro) are available here](https://postgis.net/install/).

### Configure PostgreSQL {#configure-postgresql}

Different Linux distros may require an additional configuration step for PostgreSQL to function. The following instructions apply to distros we have encountered.

#### ArchLinux

Here are [additional setup instructions for ArchLinux](https://wiki.archlinux.org/index.php/PostgreSQL).

#### Debian/Ubuntu

The Debian or Ubuntu package restricts authentication methods, so a username and password must be set in order for Streetmix to access the database. If you experience login problems, [check the `pg_hba.conf` file](https://www.postgresql.org/docs/12/auth-pg-hba-conf.html) to see if the `trust` authentication method is present for the user. You can either modify that configuration file, or follow these basic instructions for setting up a new user.

```shell-session
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
# Note: if prompted, type q
exit

# Switch back to original user
exit
```

The user created here only needs the `SUPERUSER` role during migration. After a successful initial migration, you may remove the `SUPERUSER` role.

#### Other

If you experience issues with PostgreSQL on a distro not covered here, you may need to look for help in that distro's community. We [welcome contributions to our documentation](../documentation.md) to help We also welcome contributions to our documentation, so if you get Streetmix up and running on a different distro and would like to share how, please feel free!

### Install and run Streetmix

After prerequisites are installed, continue to [Instructions for all systems](#setup-all).

## Instructions for all systems {#setup-all}

After installing all prerequisites, you can now install and run Streetmix. The following command-line instructions below should be common for all platforms.

:::tip Tip for Windows

We recommend using [Git Bash](https://gitforwindows.org/) or [Windows Powershell](https://docs.microsoft.com/en-us/powershell/), instead of the default Command Prompt, for command-line interactions.

:::

### Clone and install Streetmix

1. In the command line terminal, clone the Streetmix repository to your computer.

```shell-session
git clone https://github.com/streetmix/streetmix.git
```

2. Change the directory to Streetmix's root directory, and install project dependencies.

```shell-session
cd streetmix && npm install
```

:::caution

We are not using the **Yarn** package manager. Installing with Yarn may cause unpredictable errors.

:::

3. (Optional) If necessary, create a `.env` file and set PostgreSQL credentials. _By default, this is not required by most environments._ For more information, see [Setting environment variables](#env-vars).

Set your username and password, as well as any other database credentials you have, by uncommenting the appropriate lines and setting the environment variables. For example:

```bash title=".env"
PGUSER=streetmix_user
PGPASSWORD=streetmix
```

:::tip

If the PostgreSQL username is the same as your operating system's current username, `PGUSER` will be set to it by default, and you won't need to specify it explicitly.

:::

4. Initialize the PostgreSQL database.

```shell-session
npx sequelize db:create
npx sequelize db:migrate
NODE_ENV=test npx sequelize db:create
NODE_ENV=test npx sequelize db:migrate
```

We create two databases, one for your development environment and one for a test environment. Both of them need to be set up. You cannot run Streetmix without a database, so this is an important step!

Sequelize will print a confirmation or an error message after completing each command. Once this is completed, you should be able to inspect the databases using `psql` or [pgAdmin](https://www.pgadmin.org/). A modern, open source, and cross-platform database GUI tool is [Beekeeper Studio](https://www.beekeeperstudio.io/).

:::tip

If you run into issues creating or migrating the database, you can access "verbose" debug output from Sequelize (which is, unfortunately, not well-documented). Prepend the affected command with the `DEBUG` variable, like so:

```
DEBUG=sequelize* npx sequelize db:migrate
```

To debug a migration on a Heroku application instance, use:

```
heroku run 'DEBUG=sequelize* npx sequelize db:migrate' --app <heroku app id>
```

:::

### Setting environment variables {#env-vars}

Environment variables store configuration data for each instance of Streetmix. It's also where we put secret values like authentication keys and passwords used to connect to third-party services. Just like regular passwords, secrets should never be revealed to the public, so we store them in a `.env` file that isn't committed to the repository.

You can create a new `.env` by copying the template `.env.example` in the Streetmix root directory.

```shell-session
cp .env.example .env
```

Edit the file with the text editor of your choice.

```shell-session
vim .env
```

For local development, you can obtain your own keys from each third-party service by creating a free-tier account at each one. If you need the secret keys to services used in production instances, you will need to ask the Streetmix maintainers.

#### Required environment variables

The only required environment variables are the keys used for the [Auth0](https://auth0.com/) authentication service. Streetmix will run without this, but a lot of functionality is only available to signed-in users, and you will need these keys to sign in.

| Variable name         | Description                                  | Required |
| --------------------- | -------------------------------------------- | -------- |
| `AUTH0_DOMAIN`        | Authentication service (Auth0) domain        | Yes      |
| `AUTH0_CLIENT_ID`     | Authentication service (Auth0) client ID     | Yes      |
| `AUTH0_CLIENT_SECRET` | Authentication service (Auth0) client secret | Yes      |

#### Server configuration environment variables

These environment variables configure the Node.js environment and the URL (hostname, port, and protocol) used for creating canonical URLs to an instance of Streetmix. By default, Streetmix assumes it is running in a local, development environment.

| Variable name  | Description                                                                                                                           | Default value                                         | Required |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | -------- |
| `NODE_ENV`     | Name of the Node.js environment. `production` is used for live services. `test` is used for local testing and continuous integration. | `development`                                         | No       |
| `APP_DOMAIN`   | Domain name hosting this instance                                                                                                     | `localhost`                                           | No       |
| `APP_PROTOCOL` | URL protocol for this instance, either `http` or `https`.                                                                             | `http` for `localhost`; `https` for all other domains | No       |
| `PORT`         | Domain port for this instance                                                                                                         | `8000`                                                | No       |

#### Optional environment variables for third-party services

Streetmix will run without these keys. Some non-critical functionality may be limited.

| Variable name                      | Description                                       | Required |
| ---------------------------------- | ------------------------------------------------- | -------- |
| `CLOUDINARY_API_KEY`               | Image cloud storage (Cloudinary) key              | No       |
| `CLOUDINARY_API_SECRET`            | Image cloud storage (Cloudinary) secret           | No       |
| `FACEBOOK_APP_ID`                  | Facebook app ID for social sharing                | No       |
| `NEW_RELIC_LICENSE_KEY`            | New Relic monitoring API key                      | No       |
| `PELIAS_API_KEY`                   | Geocoding (Pelias) API key                        | No       |
| `PELIAS_HOST_NAME`                 | Geocoding (Pelias) API server                     | No       |
| `PLAUSIBLE_DOMAIN`                 | Analytics (Plausible) domain to track             | No       |
| `TRANSIFEX_API_TOKEN`              | Translations (Transifex) API token                | No       |
| `WEB_MONETIZATION_PAYMENT_POINTER` | Payment pointer for Web Monetization API payments | No       |

#### Optional environment variables for PostgreSQL database configuration

Environment variables are the preferred way for PostgreSQL to access the database. If you have a local database that are not using default values, you can set these here as well. Usually, you won't need to specify these at all.

| Variable name  | Description               | Default value          |
| -------------- | ------------------------- | ---------------------- |
| `PGUSER`       | PostgreSQL username       | (your system username) |
| `PGPASSWORD`   | PostgreSQL password       | (none)                 |
| `PGDATABASE`   | PostgreSQL database name  | `streetmix_dev`        |
| `PGHOST`       | PostgreSQL server host IP | `127.0.0.1`            |
| `PGPORT`       | PostgreSQL server port    | `5432`                 |
| `DATABASE_URL` | Database connection URL   | (none)                 |

:::info

A `DATABASE_URL` may be provided by hosting services with database add-ons, like Heroku. If a URL is provided, its properties will take precedence over any PostgreSQL configuration variables.

:::

#### Optional environment variables for additional configuration

These optional keys may be set to adjust functionality.

| Variable name           | Description                                                                                                                       | Required |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `COOKIE_SESSION_SECRET` | A secret key for verifying the integrity of signed cookies. If your environment can securely generate or rotate secrets, do that. | No       |
| `DEBUG`                 | If `true`, turns on verbose debug logging.                                                                                        | No       |
| `OFFLINE_MODE`          | If `true`, set ["offline mode"](#offline-mode) to make the app work without Internet access.                                      | No       |
| `STREETMIX_INSTANCE`    | Streetmix instance identifier                                                                                                     | No       |

#### Sample .env

A sample `.env` file looks like this:

```bash title=".env"
AUTH0_CLIENT_ID=1234567890
AUTH0_CLIENT_SECRET=abcdefghij
PELIAS_API_KEY=a2c4e6g8i
PELIAS_HOST_NAME=api.geocode.earth
```

#### Resources

- [Store config in the environment](https://12factor.net/config) [The Twelve-Factor App] &mdash; This is why we use environment variables, and not configuration files, to configure each instance of Streetmix.

### Starting the application

1. Start the PostgreSQL service. (Note: the method for doing this may differ depending on your operating system and how you installed PostgreSQL.)

2. Start the web server. In the Streetmix project directory, run:

```shell-session
npm start
```

3. Load the application in your web browser by navigating to `http://localhost:8000` or by running in your terminal:

```shell-session
open http://localhost:8000
```

### Stopping the application

To stop running Streetmix, press `Ctrl-C` in your terminal.

### Updating the application

Every so often, you will need to update the project.

1. Pull the latest code from the repository.

```shell-session
git pull
```

2. Install the latest version of all dependencies.

```shell-session
npm install
```

3. Update the database schema.

```shell-session
npx sequelize db:migrate
```

## Setup in an offline environment {#offline-mode}

:::caution

"Offline mode" is not a well-supported feature of Streetmix. Use it with care.

:::

This is for a special case where you may need to deploy Streetmix onto machines that are going to be running in an environment without Internet access, such as a public space without Wi-Fi, or a conference center with very limited Wi-Fi. To put Streetmix into "offline mode", set the `OFFLINE_MODE` environment variable to `true`.

You may do this by editing the `.env` file (see [Setting environment variables](#env-vars) for more information).

You can also do it one time by starting the server like this:

```shell-session
OFFLINE_MODE=true npm start
```

:::tip

When you are running Streetmix offline, you do not need to provide environment variables for external third-party services such as Auth0.

:::

## Troubleshooting

If you run into problems, please see [Troubleshooting](./troubleshooting.md).
