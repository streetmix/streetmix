# Contributing to Streetmix

In the spirit of open source, **everyone** is encouraged to help
improve this project! Please keep these guidelines in mind in
order to make your contributions as useful as possible.

Please note that this project is released with a [Contributor Code of Conduct][code_of_conduct].
By participating in this project you agree to abide by its terms.

[code_of_conduct]: https://github.com/codeforamerica/streetmix/blob/master/CODE_OF_CONDUCT.md

## Bug reports and feedback

We use the [GitHub issue tracker][issues] to track bugs and features
in development. If you notice any bugs while [using Streetmix](http://streetmix.net), please let us know by opening a new issue.

**Note:** before suggesting a new feature or reporting a bug, please check
to make sure it hasn't already been reported. If there is already an
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


## Feature requests

If you have any ideas for new features or functionality for Streetmix,
we'd love to hear about them! Unfortunately, we can't promise to build
everything, but we are receptive to all thoughts you have on how
Streetmix could be more useful. Shoot us
[an email](mailto:streetmix@codeforamerica.org) or [open an issue][].


## Code contributions

[![Waffle.io stories in Ready](https://badge.waffle.io/codeforamerica/streetmix.png?label=ready&title=Issues ready)](https://waffle.io/codeforamerica/streetmix)

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

### Submitting a Pull Request

1. Fork the project.
2. Create a topic branch.
3. Implement your feature or bug fix.
4. Commit and push your changes.
5. Submit a pull request.

Individuals making significant and valuable contributions are made _Collaborators_ and given commit-access to the project.


## Design / illustration contributions

Unfortunately, we are not accepting illustration contributions at this
time. If you have feedback on our illustrations, or if you think we
should consider adding new elements, please follow the [instructions for
feature requests/feedback](#feedback) above.


## Development Setup

### First-time setup

#### On Mac OS X 10

These installation instructions assume that you have already installed the [Homebrew](http://brew.sh/) package manager.

1) Download and install [Node.js](http://nodejs.org/).

    brew install nodejs

2) Download and install [Yarn](https://yarnpkg.com/en/docs/install) (optional).

    brew install yarn

Yarn is preferred because it guarantees that the dependency versions will be the same across different environments. However, if you choose not to use `yarn`, the `npm` equivalent commands will continue to work (without the benefits that `yarn` brings).

3) Download, install and start [MongoDB](http://www.mongodb.org/).

    brew install mongodb

You'll also need to set up the [MongoDB data directory](https://docs.mongodb.org/manual/tutorial/install-mongodb-on-os-x/#run-mongodb). The easiest set up would be (you may need `sudo`):

    mkdir -p /data/db
    chmod 777 /data/db

4) Clone this remote repository to a folder on your computer.

    git clone https://github.com/codeforamerica/streetmix.git

5) Install project dependencies.

    cd streetmix
    yarn

If you did not install Yarn, use `npm install` instead.


#### On Windows

Streetmix was not developed on a Windows platform, and testing is limited. We've been able to successfully stand up a local installation on 64-bit Windows 7-based Dell laptops for an event without Internet access. These instructions below will assume that the user has basic familiarity with Git, GitHub, and the Windows Terminal command line interface, and has administrative permissions to install software on the machine.


##### Installing core dependencies

You may skip each of these steps if a fairly recent stable version is already present on the system.

* Install [Git](http://git-scm.com/download/win).
* Install [node.js](http://nodejs.org/). The site should detect your system and provide you with the correct installer, but you may specify the package at http://nodejs.org/download/ (e.g. Windows 64-bit installer).
* Install [MongoDB](http://www.mongodb.org/downloads). Select the appropriate Windows installer package from their downloads page.
* Install [Yarn](https://yarnpkg.com/en/docs/install). Use the Windows installer from their downloads page or follow their instructions for other methods.
* Install [a modern browser](http://browsehappy.com/). Streetmix has been tested in Chrome (preferred), Firefox, Safari, and Internet Explorer 11. (Previous versions of Internet Explorer will not work.)

##### Installing Streetmix

1) In the command line terminal, clone a copy of the Streetmix repository to your local machine:

    git clone https://github.com/codeforamerica/streetmix.git

You may additionally specify the name of the directory to install to, if you wish.

2) Go into the project’s root directory and install all Node libraries.

    cd streetmix
    yarn

You may use the usual `npm install` if you wish.

3) Set up the MongoDB environment. [Follow the instructions under “Set up the MongoDB environment” from the MongoDB website.](http://docs.mongodb.org/manual/tutorial/install-mongodb-on-windows/#run-mongodb)

#### On all systems

1) Setup environment variables. You can either set these in your `.bash_profile` (or equivalent, on Mac OSX or *nix-based systems) or place them in a file named `.env` in the project root directory (great for development environments or Windows environments).

| Variable name                   | Description                   | Required?            |
| ------------------------------- | ----------------------------- | -------------------- |
| `SENDGRID_USERNAME`             | Your SendGrid username        | Yes                  |
| `SENDGRID_PASSWORD`             | Your SendGrid password        | Yes                  |
| `TWITTER_OAUTH_CONSUMER_KEY`    | Twitter OAuth consumer key    | Yes                  |
| `TWITTER_OAUTH_CONSUMER_SECRET` | Twitter OAuth consumer secret | Yes                  |
| `EMAIL_FEEDBACK_RECIPIENT`      | Your e-mail address           | No                   |
| `NO_INTERNET_MODE`              | Boolean. Set to `true` to run a local "demo" without external Internet access | No                   |

A sample `.env` file will look like this:

```
SENDGRID_USERNAME=username@domain.com
SENDGRID_PASSWORD=p@$$w0rD
TWITTER_OAUTH_CONSUMER_KEY=twitteroauthconsumerkey
TWITTER_OAUTH_CONSUMER_SECRET=twitteroauthsecrettoken
EMAIL_FEEDBACK_RECIPIENT=test@domain.com
NO_INTERNET_MODE=true
```

*Note:* If `NO_INTERNET_MODE` is true, you do not need the Sendgrid or Twitter authentication keys, as those will be disabled due to lack of Internet.


### HOWTO: Start the application

1) Start the web server. (This also automatically starts MongoDB in the background.)

    cd streetmix
    npm start

2) Load the application in your web browser.

    open http://127.0.0.1:8000


### HOWTO: Run browser integration tests

1) Run browser tests locally

    npm test


[issues]: https://github.com/codeforamerica/streetmix/issues
[open an issue]: https://github.com/codeforamerica/streetmix/issues/new
