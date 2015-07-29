[![Build Status](https://img.shields.io/travis/codeforamerica/streetmix/master.svg?style=flat-square)](https://travis-ci.org/codeforamerica/streetmix)
[![Dependency Status](https://img.shields.io/david/codeforamerica/streetmix.svg?style=flat-square)](https://david-dm.org/codeforamerica/streetmix)
[![Code Climate](https://img.shields.io/codeclimate/github/codeforamerica/streetmix.svg?style=flat-square)](https://codeclimate.com/github/codeforamerica/streetmix)
[![Join the chat at https://gitter.im/codeforamerica/streetmix](https://img.shields.io/badge/gitter-join%20chat%20%E2%86%92-00d06f.svg?style=flat-square)](https://gitter.im/codeforamerica/streetmix?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Streetmix
=========

Streetmix is a browser-based interactive tool that lets you design, remix, and share your neighborhood street.  Add trees or bike paths, widen sidewalks or traffic lanes, and learn how your decisions can impact your community.

Streetmix is currently live at http://streetmix.net/

![screenshot](doc/images/screenshot-beta.jpg)

## About

#### What are street sections?

A "section" is shortened way of saying "cross-section view", a type of 2D non-perspectival drawing commonly used in engineering and architecture to show what something looks like when you take a slice of it and look at it head-on. Similarly, a street section is a cross section view of a street, showing the widths and placement of vehicle lanes, bike lanes, sidewalks, trees, street furniture or accessories (like benches or street lamps), as well as engineering information like how the road is sloped to facilitate drainage, or the locations of underground utilities. Although sections can be simplified line drawings, urban designers and landscape architects have created very colorful illustrative street sections, removing most of the engineering particulars to communicate how a street could be designed to feel safe, walkable or habitable.

![example-sections](doc/images/thumb_sections.png "Left to Right: (1) Existing conditions section of Market Street, from the Better Market Street Plan, San Francisco (2) Proposed one-way cycletrack design of Second Street, from the Great Second Street Plan, San Francisco (3)Example of an illustrative section, courtesy of Lou Huang")

#### Why does Streetmix exist?

When city planners seek input from community meetings from the public on streetscape improvements, one common engagement activity is to create paper cut-outs depicting different street components (like bike lanes, sidewalks, trees, and so on) and allow attendees to reassemble them into their desired streetscape. Planners and city officials can then take this feedback to determine a course of action for future plans. By creating an web-based version of this activity, planners can reach a wider audience than they could at meetings alone, and allow community members to share and remix each other's creations.

The goal is to promote two-way communication between planners and the public, as well. Streetmix intends to communicate not just feedback to planners but also information and consequences of actions to the users that are creating streets. Kind of like SimCity did with its in-game advisors!

Streetmix can be used as a tool to promote and engage citizens around streetscape and placemaking issues, such as [Complete Streets][completestreets] or the Project for Public Spaces' [Rightsizing Streets Guide][rightsizing].

[completestreets]: http://www.smartgrowthamerica.org/complete-streets/complete-streets-fundamentals
[rightsizing]: http://www.pps.org/reference/rightsizing/

#### Why the name "Streetmix"?

"Streets" + "remix" :-)

#### How did this project start?

Streetmix was started as a [Code for America][cfa] hackathon project in January 2013, inspired by community meetings like the one described above, and a similar CfA project in 2012 called [Blockee](http://blockee.org/).


## Development Setup

### First-time setup

#### On Mac OS X 10

These installation instructions assume that you have already installed the [Homebrew](http://brew.sh/) package manager.

1) Download and install [Node.js](http://nodejs.org/).

    brew install nodejs

2) Download, install and start [MongoDB](http://www.mongodb.org/).

    brew install mongodb

3) Download and install [Coreutils](http://www.gnu.org/software/coreutils/).

    brew install coreutils

4) Clone this remote repository to a folder on your computer.

    git clone https://github.com/codeforamerica/streetmix.git

5) Install project dependencies.

    cd streetmix
    npm install


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

    git clone https://github.com/codeforamerica/streetmix.git

You may additionally specify the name of the directory to install to, if you wish.

2) Go into the project’s root directory and install all Node libraries.

    cd streetmix
    npm install

3) Set up the MongoDB environment. [Follow the instructions under “Set up the MongoDB environment” from the MongoDB website.](http://docs.mongodb.org/manual/tutorial/install-mongodb-on-windows/#run-mongodb)

#### On all systems

1) Setup environment variables. You can either set these in your `.bash_profile` (or equivalent, on Mac OSX or *nix-based systems) or place them in a file named `.env` in the project root directory (great for development environments or Windows environments).

| Variable name                   | Description                                                                            | Required?            |
| ------------------------------- | -------------------------------------------------------------------------------------- | -------------------- |
| `SENDGRID_USERNAME`             | Your SendGrid username                                                                 | Yes                  |
| `SENDGRID_PASSWORD`             | Your SendGrid password                                                                 | Yes                  |
| `TWITTER_OAUTH_CONSUMER_KEY`    | Development Twitter OAuth consumer key, obtained from @streetmix Twitter account    | Yes                  |
| `TWITTER_OAUTH_CONSUMER_SECRET` | Development Twitter OAuth consumer secret, obtained from @streetmix Twitter account | Yes                  |
| `EMAIL_FEEDBACK_RECIPIENT`      | Your e-mail address                                                                    | No                   |
| `NO_INTERNET_MODE`              | Boolean. Set to `true` to run a local "demo" without external Internet access          | No                   |

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

1) Install test dependencies (only required once)

    grunt test:local:setup

2) Run browser tests locally

    grunt test:local


## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

[![Waffle.io stories in Ready](https://badge.waffle.io/codeforamerica/streetmix.png?label=ready&title=Issues ready)](https://waffle.io/codeforamerica/streetmix)

### Submitting an Issue
We use the [GitHub issue tracker][issues] to track bugs and features. Before
submitting a bug report or feature request, check to make sure it hasn't
already been submitted. You can indicate support for an existing issue by
voting it up. When submitting a bug report, please include  any details that may
be necessary to reproduce thebug, including your node version, npm version, and
operating system.

### Submitting a Pull Request
1. Fork the project.
2. Create a topic branch.
3. Implement your feature or bug fix.
4. Commit and push your changes.
5. Submit a pull request.

[issues]: https://github.com/codeforamerica/streetmix/issues


## Credits

The team is comprised of 2013 Code for America fellows.

* [Ans Bradford][ans], media production
* [Ezra Spier][ahhrrr], cat herder, proto-urbanist
* [Katie Lewis][katie], illustrator
* [Lou Huang][louh], project lead, research, outreach, transit fan
* [Marc Hébert][marccfa], UX researcher, design anthropologist
* [Marcin Wichary][mwichary], UX, FE, PM, sharrow whisperer
* [Shaunak Kashyap][ycombinator], rear end engineering

[cfa]: http://codeforamerica.org/
[ahhrrr]: https://github.com/ahhrrr
[louh]: https://github.com/louh
[mwichary]: https://github.com/mwichary
[ans]: https://github.com/anselmbradford
[katie]: https://github.com/katielewis
[ycombinator]: https://github.com/ycombinator
[marccfa]: https://github.com/MarcCfA

You can contact the team at streetmix@codeforamerica.org.

Also, this project was made possible by the support of Code for America staff and other 2013 fellows, as well as our network of urbanists, design and planning professionals, and testers, who have provided us countless amounts of time and feedback towards this development.


### Copyright
Copyright (c) 2013-2015 Code for America. See [LICENSE][] for details.

[license]: https://github.com/codeforamerica/streetmix/blob/master/LICENSE.md
