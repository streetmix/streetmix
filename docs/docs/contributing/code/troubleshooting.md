---
sidebar_position: 8
---

# Troubleshooting

While developing Streetmix, here are solutions to some problems that may arise.

## Strategies for resolving most common issues

**Try these first!**

- Check which versions of [Node.js](https://nodejs.org/) and npm you are using and make sure it matches the versions listed in `package.json`.
- Remove the `node_modules` and `.cache` folders from the repository, if present, and [reinstall dependencies](./local-setup.md#clone-and-install-streetmix).
- Ensure that you are installing and running Streetmix with npm, not Yarn.

## Specific issues

This section is for troubleshooting specific issues.

- **The server keeps restarting in a loop** with the `EADDRINUSE` error code. We have documented a solution in [GitHub issue #983](https://github.com/streetmix/streetmix/issues/983).

## If you need more help

Talk to us in the `#tech` channel on [Discord](https://strt.mx/discord/).
