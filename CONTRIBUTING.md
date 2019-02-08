# Contributing to Streetmix

In the spirit of open source, **everyone** is encouraged to help
improve this project! Please keep these guidelines in mind in
order to make your contributions as useful as possible.

There are many ways to contribute to the project, not just through code.
For instance:

- Design
- Illustrations
- Writing
- Community management
- Translation and localization
- and of course, [financially](https://opencollective.com/streetmix).

Please note that this project is released with a [Contributor Code of Conduct][code_of_conduct].
By participating in this project you agree to abide by its terms.

[code_of_conduct]: https://github.com/streetmix/streetmix/blob/master/CODE_OF_CONDUCT.md


## Bug reports and feedback

We use the [GitHub issue tracker][issues] to track bugs and features
in development. We also have [a Discord server](https://discord.gg/NsKmV3S)
and [forums](https://forums.streetmix.net/) for feedback
and discussion.

### Bug reporting

If you notice any bugs while using Streetmix, let us know by [opening a new issue](https://github.com/streetmix/streetmix/issues/new).
Please check to make sure it hasn't already been reported. If there is already an
existing issue, feel free to add a comment or indicate support by voting
it up.

When submitting a new issue, please include the following information:

- What web browser you're using (i.e. MS Internet Explorer, Google
Chrome, Firefox), what version (i.e. 9.0, 27), and what operating system
you're using (i.e. Mac OS X 10.8, Windows 7, Android 4.1).
- If you are running a local copy, include details about your enviroment
that's necessary to reproduce the bug, such as your node version, npm
version, and operating system.
- What you expected to happen when you encountered the bug.
- What actually happened.
- Steps we can follow to reproduce the bug.
- Any other information you think might be at all helpful.

### Feature requests and feedback

If you have any ideas for new features or functionality for Streetmix,
we'd love to hear about them! Unfortunately, we can't promise to build
everything, but we are receptive to all thoughts you have on how
Streetmix could be more useful. You can [open an issue on GitHub](https://github.com/streetmix/streetmix/issues/new)
or [talk to us in Discord](https://discord.gg/NsKmV3S").

Again, please make sure it hasn't already been posted. Posts or issues that
are similar ones may be closed.


## Code contributions

[![Waffle.io stories in Ready](https://badge.waffle.io/streetmix/streetmix.png?label=ready&style=flat-square)](https://waffle.io/streetmix/streetmix)

If you have the capacity to write code, and wish to contribute to
Streetmix, we'd love your help!

**A request:** before you write any new feature or code, please [open an
issue][], or comment on the issue you'd like to work on. That way the
maintainers of the project can guide your work from the outset, making
it more likely that we'll be able to accept your work when it's ready.

In general, you can help by:

* Writing or editing documentation
* Writing code (**no patch is too small**: fix typos, add comments, clean up
  inconsistent whitespace)
* Refactoring code
* Closing [issues][]
* Reviewing patches

Once your code is ready, please push your work to a feature branch on
your fork of the Streetmix repo, and submit a pull request to us.

### Code style

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

### Submitting a pull request

1. **Fork the project**, if you do not already have write access to the repository. Individuals making significant and valuable contributions will be given write access.
2. **Create a new branch.** Changes should always be made in a new feature branch. The branch should be named in the format `username/feature-name`.
3. **Implement your feature or bug fix.** Writing code is the fun part! Before you start any work, it's a good idea to note your interest in GitHub issues, or talk to us on Discord or the forums so that we can be sure you're on the right track.
4. **Commit and push your changes.** We have local hooks to verify code style during the commit stage. After pushing, we run tests in the cloud to make sure commits pass. We recommend manually running tests locally as well. See below for more information.
5. **Submit a pull request.** Ideally, pull requests contain small, self-contained changes with a few commits, which are easier to review. You can simplify a review and merge process by making sure your branch contains no conflicts with the `master` branch and is up-to-date (either by rebasing on `master` or merging it in) when the pull request is created. If the pull request addresses an open issue, be sure to reference it in your request's title or description.
6. **Wait for a review.** A project maintainer will review your pull request and either approve, reject, or request changes on it. A well-written, small pull request that fixes an open issue is most likely to be approved and merged quickly. Once merged, a branch is deleted.

Stale branches, especially ones that cannot be cleanly merged anymore, are likely to be deleted after some amount of time has passed.


## Design / illustration contributions

If you would like to contribute illustrations, or have feedback on existing
illustrations, please talk to us on [Discord](https://discord.gg/NsKmV3S)
or on the [forums](https://forums.streetmix.net/)!

## Development setup

### First-time setup

#### On Mac OS X

These installation instructions assume that you have already installed the [Homebrew](http://brew.sh/) package manager.

1) Download and install [Node.js](http://nodejs.org/).

    ```sh
    brew install nodejs
    ```

2) Download, install and start [MongoDB v3.4](http://www.mongodb.org/).

    ```sh
    brew install mongodb@3.4
    ```

3) Set up the [MongoDB data directory](https://docs.mongodb.org/manual/tutorial/install-mongodb-on-os-x/#run-mongodb). The easiest set up is this (you may need `sudo`):

    ```sh
    mkdir -p /data/db
    chmod 777 /data/db
    ```

4) Add MongoDB binaries to the PATH environment variable. The most common way this can be done by editing `~/.bash_profile`. Using a text editor, open that file and add this line at the bottom of it:

    ```
    export PATH="/usr/local/opt/mongodb@3.4/bin:$PATH"
    ```

5) Clone this remote repository to a folder on your computer.

    ```sh
    git clone https://github.com/streetmix/streetmix.git
    ```

5) Install project dependencies.

    ```sh
    cd streetmix
    npm install
    ```


#### On Windows

Streetmix was not developed on a Windows platform, and testing is limited. We've been able to successfully stand up a local installation on 64-bit Windows 7-based Dell laptops for an event without Internet access. These instructions below will assume that the user has basic familiarity with Git, GitHub, and the Windows Terminal command line interface, and has administrative permissions to install software on the machine.


##### Installing core dependencies

You may skip each of these steps if a fairly recent stable version is already present on the system.

* Install [Git](http://git-scm.com/download/win).
* Install [node.js](http://nodejs.org/). The site should detect your system and provide you with the correct installer, but you may specify the package at http://nodejs.org/download/ (e.g. Windows 64-bit installer).
* Install [MongoDB](http://www.mongodb.org/downloads). Select the appropriate Windows installer package from their downloads page.
* Install [a modern browser](http://browsehappy.com/). Streetmix has been tested in Chrome (preferred), Firefox, Safari, and Internet Explorer 11. (Previous versions of Internet Explorer will not work.)

##### Installing Streetmix

1) In the command line terminal, clone a copy of the Streetmix repository to your local machine:

    ```sh
    git clone https://github.com/streetmix/streetmix.git
    ```

You may additionally specify the name of the directory to install to, if you wish.

2) Go into the project’s root directory and install all Node libraries.

    ```sh
    cd streetmix
    npm install
    ```

3) Go into `package.json` and remove  `"prestart": "npm run mongo:start"` and `"mongo:start": "mongod --fork --logpath /dev/null"`

4) Set up the MongoDB environment. [Follow the instructions under “Set up the MongoDB environment” from the MongoDB website.](http://docs.mongodb.org/manual/tutorial/install-mongodb-on-windows/#run-mongodb)

5) Add MongoDB binaries to your system path. Open the Start Menu and type in "environment variables", and select _Edit the system environment variables_. You should see the _Advanced_ tab of _System Properties_. Click "Environment Variables..." at the lower right corner of the panel. In the user variables, select or create a variable called "Path", then edit it and add a new entry containing `C:\Program Files\MongoDB\Server\3.6\bin` (or the path you installed MongoDB to). Click OK until you return to the _System Properties_ window, click Apply then click OK to exit.

6) Run `mongod.exe` and `mongo.exe`

#### On all systems

1) Setup environment variables. You can either set these in your `.bash_profile` (or equivalent, on Mac OSX or *nix-based systems) or place them in a file named `.env` in the project root directory (great for development environments or Windows environments).

| Variable name                   | Description                   | Required?            |
| ------------------------------- | ----------------------------- | -------------------- |
| `AUTH0_CLIENT_ID`               | Auth0 client ID               | Yes                  |
| `AUTH0_CLIENT_SECRET`           | Auth0 client secret           | Yes                  |
| `PELIAS_API_KEY`                | Geocoding (Pelias) API key    | No                   |
| `IPSTACK_API_KEY`               | Geolocation (IPStack) API key | No                   |
| `TRANSIFEX_API_TOKEN`           | Your Transifex API token      | No                   |
| `TWITTER_OAUTH_CONSUMER_KEY`    | Twitter OAuth consumer key    | (deprecated)         |
| `TWITTER_OAUTH_CONSUMER_SECRET` | Twitter OAuth consumer secret | (deprecated)         |

A sample `.env` file will look like this:

```
AUTH0_CLIENT_ID=1234567890
AUTH0_CLIENT_SECRET=abcdefghij
PELIAS_API_KEY=a2c4e6g8i
```


#### Setup in a no-internet environment

Set your `NODE_ENV` environment variable to `demo`.

*Note:* When you are running Streetmix on a platform without Internet access, you do not need to provide authentication keys for third-party services like Twitter.


### HOWTO: Start the application

1) Start the web server. (This also automatically starts MongoDB in the background.) In the Streetmix project directory, run:

    ```sh
    npm start
    ```

2) Load the application in your web browser by navigating to `http://localhost:8000` or by running in your terminal:

    ```sh
    open http://127.0.0.1:8000
    ```


### HOWTO: Run tests locally

1) By default, local tests are unit tests, with CSS and JavaScript linting.

    ```sh
    npm test
    ```

2) You can run a full browser integration test with this command. By default, we run tests similar to this in our continuous integration infrastructure on commits and pull requests to GitHub, so it is not required to run this locally.

    ```sh
    npm test:full
    ```


[issues]: https://github.com/streetmix/streetmix/issues
[open an issue]: https://github.com/streetmix/streetmix/issues/new
