
Content Security Policy
=======================

Streetmix adopts a `Content Security Policy (CSP) <https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP>`_, which permits only approved content to appear or run on the application. The intent is to mitigate certain types of malicious attacks, like `cross-site scripting (XSS) <https://developer.mozilla.org/en-US/docs/Glossary/Cross-site_scripting>`_ and data injection attacks. As we become a bigger platform, with user accounts and access to user data, it's important we adopt good security practices, and CSP is a web standard that is within our reach.

However, CSP can also be quite limiting. Third-party service integrations, cloud-hosted assets like fonts and images, and browser plugins can break, if they're not explicitly whitelisted. Currently, our CSP directives are very strict.

This section details more information about the way we implement CSP.

- **CSP directives are sent in HTTP headers.** This is the most secure way to set a CSP directive. We use `helmet <https://www.npmjs.com/package/helmet>`_ to help write the directive string. This is set up when the Express server is starting.
- **We write the most restrictive directive we can.** Currently we avoid allowing "any" content of any type, if possible.
- **Inline scripts require a nonce value.** Since arbitrary inline scripts are not allowed, we "approve" inline scripts `by giving them a unique ID <https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src#Unsafe_inline_script>`_. A nonce value can be anything, but our recommendation is to generate a :code:`uuid`, and make it available to both the CSP definition, and the HTML templates which can then inject the nonce as a variable.

  - Note: we avoid using SHA hashes, which is an alternative way to allow inline scripts. We don't have a way to automatically generate them, so if they're manually generated and added to a CSP header, any change to the inline script, including whitespace formatting, can break the allow directive. They're brittle, so we don't use them.

- **CSP violations are blocked in production, but allowed in development.** While blocking unknown scripts and assets help secure the production deployment, this can be annoying in development environments, where new scripts and assets may be implemented or experimented with. So resources that trigger a CSP violation is allowed when the :code:`NODE_ENV` environment variable is set to :code:`development`. CSP violations are logged to console, so please keep an eye on the console output, which can tell you what directives you will need to update to make new or updated code work in the production environment.

  - Note: Another reason why CSP is relaxed in development (violations are allowed, but reported) is because developer extensions, such as the React or Redux inspectors, are disabled in Firefox if CSP is too strict.

- **CSP violations are reported to the /services/csp-report endpoint.** All reports are logged, in both production and development environments. Some CSP violations are expected, and can be safely ignored. (We don't list the expected CSP violations here because this documentation inevitbably lags behind changes in the codebase. You will begin to recognize expected violations as you become familiar with local development.) Remember, in development mode, resources that are allowed can still trigger a CSP violation report. Please remember to update the CSP directive if they are intended for production.

  - Note: we do not have automated testing for CSP violations. In other words, continuous integration cannot catch if new or changed code will trigger a violation or issue a report. Do not depend on automated testing to catch CSP violations for you.
  - We log all reports in production so that we can see if users are doing anything that we should be adding to the CSP directive. (For instance: user profile images are hosted on a wide variety of cloud-based cache servers, and we still need to decide whether to allow each of these servers manually, or allow all image resources more liberally.)

- **Avoid writing separate CSP headers for development versus production environments.** We have tried this in the past, and have seen instances where something that "just worked" in development mysteriously stopped working in production, because the CSP headers were different. This "ease of development" strategy became a footgun that made CSP feel worse. This is why we use the strategy of sending CSP headers even in development, and reporting all violations, so that we can catch problems earlier.

  - The one exception we make for development is to allow websockets for Parcel's hot reloader. This is considered acceptable because the hot reloader will never be present in production.
