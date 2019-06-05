Technical guide
===============

.. warning::

   This section is a work in progress.


Updating translations on GitHub
-------------------------------

We export the translated strings from Transifex and store that snapshot in our GitHub repository. In production, and in offline deployments, we use these strings because they are more stable. In development and testing environments, we default to pulling the latest strings from Transifex.

If your system is already set up properly, you can update the translations by running this on the command line:

.. prompt:: bash $

   node ./bin/download_translations.js


To set up your system to update strings from Transifex:

- Open a terminal
- Set your current working directory to the location of the repository
- Make sure you have the latest version of the repository (``git pull`` and resolve conflicts if necessary)
- Check out a new branch
- Make sure node exists and is a recent version (test this with ``node --version`` and compare version number with the LTS version number on `nodejs.org <https://nodejs.org/en/>`_)
- Make sure dependencies are updated (``npm install``)
- Ensure that the ``TRANSIFEX_API_TOKEN`` is present in ``.env`` (Obtained via Transifex; and user must be a member of the Streetmix team in order for the token to be valid) (`See instructions <https://github.com/streetmix/streetmix/blob/master/CONTRIBUTING.md#on-all-systems>`_)
- Run ``node ./bin/download_translations.js``
- Verify that changes are what you expect (``git status`` and/or ``git diff``)
- Commit the changes
- Push changes upstream to GitHub and make a PR
