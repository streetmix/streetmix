# Troubleshooting

## Loading or authentication issues

### When following an e-mail sign-in link, I see the "You cancelled the sign-in process" message.

The sign-in link in your e-mail can only be used once. Sometimes, an e-mail client (such as Microsoft Outlook) will try to "preview" a link to see what's there, but this will cause the sign-in link to stop working by the time you click it.

The following workarounds can help:

- Sign in with the Twitter, Facebook or Google social profiles instead.
- Use a different e-mail client (for instance, the Gmail web client instead of Microsoft Outlook).
- Configure your e-mail client to not preview links.
  - [Turn off the Link Preview feature in Microsoft Outlook](https://support.microsoft.com/en-us/office/use-link-preview-in-outlook-com-and-outlook-on-the-web-ebbfd8ce-d38e-40ef-bb8c-a5362e881163)

### When loading Streetmix, the screen is stuck on the loading spinner indefinitely, or I only see the "We're having trouble loading Streetmix. (Error RM1)" error message.

If Streetmix is stuck on the initial loading spinner screen, try to open a "private mode" window in your browser. Normally, this mode is used to prevent browsers from saving history, and it also means you can start with a "clean slate" when browsing the web. Here are resources for the two most common browsers.

- [How to browse in Incognito mode in Chrome](https://support.google.com/chrome/answer/95464)
- [How to enter Private Browsing in Firefox](https://support.mozilla.org/en-US/kb/private-browsing-use-firefox-without-history)

If Streetmix works in private mode, this means something in your browser cache has become corrupted. You will want to reset your browser back to a "clean slate."

- [How to clear browsing data in Chrome](https://support.google.com/chrome/answer/2392709)
- [How to clear cookies and site data in Firefox](https://support.mozilla.org/en-US/kb/clear-cookies-and-site-data-firefox#w_clear-cookies-for-the-current-website)

If Streetmix does not work in private mode, or still does not work after clearing your browser's cache, please ensure that you are using the latest version of Chrome or Firefox. If you still need help, please [contact us](/community).

### I requested a sign-in link via e-mail, but never received it.

There are few situations that can prevent a sign-in link from being received.

- Check to see if the e-mail was blocked or was sent to spam. The e-mail will have the subject heading "Welcome to Streetmix! Your sign-in link is here." and will be sent from hello@streetmix.net.
- You may have an anti-spam feature that requires first-time senders to do something to prove they're not a robot. Since the e-mail link is an automated system, you will need to disable it for our e-mail.
- In very rare instances, our third-party e-mail system may be down. You can check [e-mail system status here](https://status.mailgun.com/). If the systems are down, please wait for the issues to resolve.

If you still need help, please [contact us](/community).

## Error codes

:::caution Under construction

This section is a work in progress.

:::

These are error codes that may occur while using Streetmix.

| Error code | Reason                                                                                                                  | Suggested fix                           |
| :--------- | :---------------------------------------------------------------------------------------------------------------------- | :-------------------------------------- |
| **9B**     | **Data error**: The server sent street data that had no data in it.                                                     | Load a different street.                |
| **RM1**    | **Authentication error**: The user attempted to load Streetmix with remembered credentials which have become corrupted. | Reset cache and site data for the site. |
