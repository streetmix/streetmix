# Troubleshooting

## Loading or authentication issues

### When loading Streetmix, the screen is stuck on the loading spinner indefinitely, or I only see the "We're having trouble loading Streetmix. (Error RM1)" error message.

If Streetmix is stuck on the initial loading spinner screen, try to open a "private mode" window in your browser. Normally, this mode is used to prevent browsers from saving history, and it also means you can start with a "clean slate" when browsing the web. Here are resources for the two most common browsers.

- [How to browse in Incognito mode in Chrome](https://support.google.com/chrome/answer/95464)
- [How to enter Private Browsing in Firefox](https://support.mozilla.org/en-US/kb/private-browsing-use-firefox-without-history)

If Streetmix works in private mode, this means something in your browser cache has become corrupted. You will want to reset your browser back to a "clean slate."

- [How to clear browsing data in Chrome](https://support.google.com/chrome/answer/2392709)
- [How to clear cookies and site data in Firefox](https://support.mozilla.org/en-US/kb/clear-cookies-and-site-data-firefox#w_clear-cookies-for-the-current-website)

If Streetmix does not work in private mode, or still does not work after clearing your browser's cache, please ensure that you are using the latest version of Chrome or Firefox. If you still need help, please [contact us](/docs/community).

### When following an e-mail sign-in link, I see the "You cancelled the sign-in process" message.

This can happen when an organization-managed e-mail service blocks or tampers with the sign-in link while doing routine security checks. We are currently investigating solutions to this problem but do not yet have a timeline for a fix. The following workarounds can help:

- Sign in with a personal e-mail address (e.g. Gmail) or with a Twitter, Facebook or Google account method.
- Ask your organization's IT administrators to allow sign-in emails from Streetmix.

## Error codes

:::caution Under construction

This section is a work in progress.

:::

These are error codes that may occur while using Streetmix.

| Error code | Reason | Suggested fix |
| :-- | :-- | :-- |
| **9B** | **Data error**: The server sent street data that had no data in it. | Load a different street. |
| **RM1** | **Authentication error**: The user attempted to load Streetmix with remembered credentials which have become corrupted. | Reset cache and site data for the site. |
