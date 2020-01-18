Technical guide
===============


Updating translation snapshots on GitHub
----------------------------------------

We export a snapshot of the translated strings from Transifex and store them in our GitHub repository. In production, and in offline deployments, we use the snapshots because they are stable; changes in Transifex are not automatically available on those environments. In development and testing environments, we will use the latest strings on Transifex so that you can see all of the latest translations as they are written.

You can update your local snapshot by running this on the command line:

.. prompt:: bash $

   node ./bin/download_translations.js

.. note::

   A valid ``TRANSIFEX_API_TOKEN`` must be set in :ref:`environment variables <install-env-vars>` in order to retrieve translations. This environment variable can be obtained from the Transifex platform and it must correspond to a user who is a member of the Streetmix team.
