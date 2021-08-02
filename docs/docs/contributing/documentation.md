---
sidebar_position: 6
---

# Documentation

_You're looking at it!_

Our documentation lives in the `docs` folder of [the Streetmix repository](https://github.com/streetmix/streetmix/tree/main/docs). It's built by [Docusaurus](https://docusaurus.io/).

:::info Not all technical documentation lives here! Documentation of specific functions or components should be written in the source code itself. Documentation relating to a directory of related modules should live in a dedicated Markdown `README.md` file coexisting with those files. This helps keep narrowly-focused documentation up-to-date and easier to find.

Technical documentation pertaining to cross-cutting concerns or high-level architecture do belong here!

For guidance on writing documentation in source code, see [Code styleguide](./code/styleguide.md#code-comments). :::

## Local development setup

:::warning This is out of date, since these instructions are for the old documentation system. :::

You don't need to build documentation locally when writing code for Streetmix. However, it _is_ a good idea to document what you're working on, so we do recommend writing and updating documentation. Here's how to set up a local development instance of the documentation so you can preview any changes.

### 1. Install dependencies

First, make sure you have a working [Python development environment](https://www.python.org/doc/) on your system. Installing Python is outside of the scope of this guide.

Install [Sphinx](http://www.sphinx-doc.org/en/stable/), the [Read the Docs Sphinx theme](https://sphinx-rtd-theme.readthedocs.io/en/latest/installing.html), and extensions.

```shell-session
pip install sphinx sphinx-prompt sphinx_rtd_theme
```

### 2. Build documentation

Documentation must be built from the `./docs` working directory.

```shell-session
cd docs make dirhtml
```

:::info The directory HTML renderer will create URLs that match the path structure that we use on Read the Docs. :::

Alternatively, we've provided an `npm` package script that can build documentation from the root directory.

```shell-session
npm run docs:build
```

:::info In the future... We would like to develop a watch and livereload system that automatically rebuilds documentation locally when contents change. For now, you must manually run a local build whenever you make changes. :::

### 3. Preview

Run a static file server, such as `http-server`, to preview the built documentation. Built files are located in `./docs/_build`, and the example command below assumes you are in the `./docs` working directory.

```shell-session
http-server _build/dirhtml
```

You may use any static file server solution you wish. We've also provided an `npm` package script that assumes `http-server` is available on the system's global packages and will automatically serve the documentation locally at `http://localhost:8080/`.

```shell-session
npm run docs:serve
```

:::caution A static file server does not automatically watch and rebuild changed files. You must manually rebuild files and then reload your browser to see the changes. :::

### 4. Upload

Commit your changes and push to the upstream repository.

```shell-session
git add . git commit -m 'docs: short commit message \[skip ci\]' git
push origin
```

### 5. Deploy

Once documentation have been committed to the Streetmix `main` branch, Read the Docs will automatically build and deploy the revised documentation to <https://streetmix.readthedocs.io/>. Read the Docs does not wait for continuous integration to pass, and a production build will be triggered on each commit.
