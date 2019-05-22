# Mailchimp integration

Snippets from Mailchimp are copy and pasted here. In the future, we may do some more custom work integrating Mailchimp singup into the app. For now, this is the easiest method.

A few changes need to be made to the snippets:

### Import stylesheets and remove the `<link>` tag

Mailchimp's CSS is placed here in the repository so that it can be bundled when the app deploys. Delete the following CSS embed line:

```html
<link href="//cdn-images.mailchimp.com/embedcode/classic-10_7.css" rel="stylesheet" type="text/css">
```

This also solves the following problems:

- CSS is loaded when the dialog box is first mounted. This can cause a "flash of unstyled content," which is particularly egregious on slow network connections.
- CSS is hosted at the Mailchimp domain, which may not be loaded if users have third-party tracking blocked.
- Similarly, we do not have to make an exception for this domain in Content Security Policy (CSP).

**Note: do not edit this CSS directly!** We want to make it easy to copy-paste replacement CSS into this file. Instead, make any overrides to `NewsletterDialog.scss`.

### Edit the source of the `<script>` tag

At the bottom of the HTML snippet, edit the source of the `<script>` tag so that instead of:

`src='//s3.amazonaws.com/downloads.mailchimp.com/js/mc-validate.js'`

It is now:

`src='//downloads.mailchimp.com.s3.amazonaws.com/js/mc-validate.js'`

This changes the hostname of the JavaScript file so that we can allow it in Content Security Policy (CSP). If we allowed just `s3.amazonaws.com`, this would permit any script to be run, even those in buckets we did not explicitly allow.
