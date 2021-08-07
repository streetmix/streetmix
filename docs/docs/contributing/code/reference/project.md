---
sidebar_position: 1
---

# Project architecture and organization

:::caution Under construction

This page is a work in progress.

:::

## Our stack

Streetmix is a Node.js and JavaScript project. We use the following frameworks:

- **[Express](https://expressjs.com/)**, a **web application framework**. This is the server side of Streetmix. It handles HTTP requests and serves files and data requested by the front end.
- **[PostgreSQL](https://www.postgresql.org/)**, a **relational database**. All the data on the server is stored in PostgreSQL.
- **[PostGIS](https://postgis.net/)**, PostGIS is **a spatial database extender** for PostgreSQL, adding support for geographic objects.
- **[Parcel](https://parceljs.org/)**, a **web application bundler**. When Streetmix starts, it uses Parcel to bundle all the front end JavaScript and CSS.
- **[Babel](https://babeljs.io/)**, a **compiler** which allows us to use modern JavaScript in browsers that do not yet support it.
- **[React](https://reactjs.org/)**, a **front-end user interface framework**. Most UI is rendered with React.
- **[Redux](https://redux.js.org/)** (with **[Redux Toolkit](https://redux-toolkit.js.org/)**), a **state management framework** that usually works alongside React. We maintain most application state in Redux, using Redux Toolkit to help make it easier to write code for Redux.
- **[Sass](https://sass-lang.com/)**, an **extension of CSS** that allows us to use variables and calculate values.
- **[PostCSS](https://postcss.org/)**, a **CSS processor**. It provides a lot of functionality, such as the ability to automatically prefix CSS properties for browser compatibility.

## Dependency pinning

We **pin** our dependencies, which means that we specify exact dependency versions, not [version ranges](https://semver.org/), in `package.json`. This allows Streetmix to run with the greatest reliability and consistency across different computing environments.

Because Streetmix is an application, and it's not intended to be imported by other applications, we don't need the flexibility that comes from using version ranges. As a result, all developers, and any deployment environments, are running the same code for any given commit. This consistency makes obscure bugs easier to track down and resolve.

The tradeoff is that this introduces "upgrade noise". We have used [Dependabot](https://dependabot.com/) and [Greenkeeper](https://greenkeeper.io/), which are automated services that create pull requests whenever a dependency has updated. Because we have pinned dependencies, these services create a new branch and opens a new pull request for _every_ depedency update, no matter how minor. We will turn these services off when we need to limit the noise.

**References**

- [Should you Pin your Javascript Dependencies?](https://renovatebot.com/docs/dependency-pinning/) [Renovate Docs]

## Browser support

Because of limited resources, browser support is any of the evergreen desktop browsers (e.g. Firefox, Chrome, Safari, and Edge). We [do not support Internet Explorer](/user-guide/support/faq#internet-explorer).

Mobile support is also limited, because the application was not initially designed for mobile. However, we should be supporting tablet devices such as iPads and laptops with touchscreens.
