API testing
===============

Currently MongoDB needs to be running for front end tests. To remove this barrier and potential bottleneck we're moving away from using ``fetch``, to use `Axios <https://github.com/axios/axios>`. It provides us with convenient methods and a single place for API call.  Axios Mock Adapter offers the possibility to mock all API requests and eventually remove mongodb as a dependency for front end related tests.  

If you work on API-related features, consider refactoring the ``fetch`` calls to use the API in :file:`.assets/scripts/util/api.js`
