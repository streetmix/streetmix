Project organization
====================

.. warning::

   This page is a work in progress.

Streetmix is a Node.js and JavaScript project. We use the following frameworks:

- `Express <https://expressjs.com/>`_, a web application framework. This is basically the server side of Streetmix. It handles HTTP requests and serves files and data requested by the front end.
- `PostgreSQL <https://www.postgresql.org/>`_, a relational database. All the data on the server is stored in PostgreSQL.
- `PostGIS <https://postgis.net/>`_, PostGIS is a spatial database extender for PostgreSQL, adding support for geographic objects.
- `Parcel <https://parceljs.org/>`_, a web application bundler. When Streetmix starts, it uses Parcel to bundle all the front end JavaScript and CSS.
- `Babel <https://babeljs.io/>`_, a compiler which allows us to use modern JavaScript in browsers that do not yet support it.
- `React <https://reactjs.org/>`_, a front-end user interface framework. Most UI is rendered with React.
- `Redux <https://redux.js.org/>`_ (with `Redux Toolkit <https://redux-toolkit.js.org/>`_), a state management framework that usually works alongside React. We maintain most application state in Redux, using Redux Toolkit to help make it easier to write code for Redux.
- `SCSS <https://sass-lang.com/>`_, an extension of CSS that allows us to use variables and calculate values.
- `PostCSS <https://postcss.org/>`_, a CSS processor. We primarily use it to autoprefix certain CSS properties.


Dependency pinning
------------------

We **pin** our dependencies, which means that we specify exact dependency versions, not `version ranges <https://semver.org/>`_, in ``package.json``. This allows Streetmix to run with the greatest reliability and consistency across different computing environments.

Because Streetmix is an application, and it's not intended to be imported by other applications, we don't need the flexibility that comes from using version ranges. As a result, all developers, and any deployment environments, are running the same code for any given commit. This consistency makes obscure bugs easier to track down and resolve.

The tradeoff is that this introduces "upgrade noise". We are currently using `Greenkeeper <https://greenkeeper.io/>`_, a third-party automated service to create pull requests whenever a dependency has updated. Because we have pinned dependencies, Greenkeeper creates a new branch and opens a new pull request for *every* depedency update, no matter how minor. We're willing to accept this tradeoff for the time being, although we're open to considering any strategy to limit the noise.

**References**

  - `Should you Pin your Javascript Dependencies? <https://renovatebot.com/docs/dependency-pinning/>`_ *[Renovate Docs]*


Browser support
---------------

Because of limited resources, browser support is any of the evergreen desktop browsers (e.g. Firefox, Chrome, Safari, and Edge). We do not support Internet Explorer. (See :ref:`faq-internet-explorer`)

Mobile support is also limited, because the application was not initially designed for mobile. However, we should be supporting tablet devices such as iPads and laptops with touchscreens.
