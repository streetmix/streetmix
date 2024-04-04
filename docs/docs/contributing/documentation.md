---
sidebar_position: 6
---

# Documentation

_You're looking at it!_

Our documentation lives in the `docs` folder of [the Streetmix repository](https://github.com/streetmix/streetmix/tree/main/docs). It's built by [Docusaurus](https://docusaurus.io/), hosted by [Netlify](https://www.netlify.com/), and can be viewed at https://docs.streetmix.net/.

Not all technical documentation lives here! Documentation of specific functions or components should be written in the source code itself. Documentation relating to a directory of related modules should live in a dedicated Markdown `README.md` file coexisting with those files. This helps keep smaller-scoped documentation up-to-date and easier to find.

Technical documentation pertaining to cross-cutting concerns or high-level architecture do belong here!

For guidance on writing documentation in source code, see [Code styleguide](./code/styleguide.md#comments).

## Local development setup

You don't need to build documentation locally when writing code for Streetmix. However, it _is_ a good idea to document what you're working on, so we recommend setting up a local development instance up when you need to write or update documentation. These instructions will walk you through this process.

### 1. Install dependencies

You should already have a Node.js environment and `git` from [setting up Streetmix](./code/local-setup). If you are only working on documentation, follow the instructions there to install it for your system.

If you do not already have the repository cloned locally, do that now.

```shell-session
git clone https://github.com/streetmix/streetmix.git
```

Set your current working directory to the `docs` subdirectory inside the Streetmix repository.

```shell-session
cd streetmix/docs
```

Install Node.js dependencies.

```shell-session
npm install
```

:::note

The `docs` subdirectory is a separate Node.js application, using its own `package.json` file that's different from the main Streetmix application. This is similar to having multiple packages managed by [Lerna](https://lerna.js.org/) or a Git submodule. However, we currently do not use tooling to manage this, since nested Node.js applications work just fine, for now.

Please keep this distinction separate: try not to refer to files or packages outside of the `docs` subdirectory, or inside of the `docs` subdirectory from the main application. This is so that we can more easily create separate packages later, if we need to.

:::

### 2. Preview locally

The local development server can be started from the `docs` directory with:

```shell-session
npm start
```

This command is an alias for:

```shell-session
npx docusaurus start
```

You can use either one.

The development server automatically watches and rebuilds _most_ changed files, and refreshes the browser view for you. This makes local preview extremely efficient!

### 3. Update & deploy

Commit your changes and push to the upstream repository.

```shell-session
git add .
git commit -m 'docs: short commit message [skip ci]'
git push origin
```

:::info

Why did we add `[skip ci]` to the example commit message above?

Our continuous integration tests work on the main app, not the documentation. So running them usually doesn't serve much purpose. It's not necessary to skip them either, since running the tests also do no harm. But the point is, running continuous integration tests on documentation aren't necessary and can be skipped.

:::

If you have made changes to documentation in a branch, [create a pull request](code/overview#pull-request) so that a member of the Streetmix team can review and approve.

Once documentation have been merged or committed to the `main` branch, Netlify will automatically build and deploy the revised documentation to [https://docs.streetmix.net/](https://docs.streetmix.net/). Netlify does not wait for continuous integration to pass, and a production build will be triggered on each commit.
