---
title: Content styleguide
sidebar_position: 2
---

# Content styleguide

Streetmix is a tool for communication and collaboration, so the way we write and present content should facilitate those goals. This is a reference that will continue to grow as needed. When you run into a situation that isn't covered here, refer to the very excellent [18F Content Guide](https://content-guide.18f.gov/).

## Basic guidelines

- Use plain language and simple sentence structure.
- Be funny or friendly, but:
- Choose clarity over cleverness.
- Avoid technical or industry-specific jargon.
- Content isn't frozen in time. Always be refining. As we learn, we change and adapt.

## User interface

### Sentence case

When writing standalone text such as titles, labels, or headings, [use sentence case](https://medium.design/a-thorough-detailed-comprehensive-methodical-guide-to-capitalizing-strings-in-our-user-interface-11b39da146f3). With sentence case, capitalize the first letter of a phrase, but leave all other words in lowercase, unless they would normally require capitalization, such as proper nouns.

Avoid title case (Where Each Word Is Capitalized, Like This), or uppercase (SUCH AS THIS). [These approaches are harder to read than sentence case](https://medium.com/@jsaito/making-a-case-for-letter-case-19d09f653c98).

## Technical writing

### People have different levels of expertise

**Avoid using the words "simply" or "just" when writing instructions.**

Instead of:

> Simply install your packages with `npm install`.

Use:

> Install your packages with `npm install`.

What may be simple and second nature for you may be foreign and complex to another person. This is especially true when that person is learning the development ecosystem, or when something that's usually straightforward fails for an unpredictable reason. Words like "simply" are judgmental.

Keep instructions short and to-the-point, without implying that it "should" be easy. You don't need to overcompensate by pre-emptively answering every potential question or providing instructions "from scratch," and that's okay.

Furthermore, here's a good collection of additional [Words To Avoid in Educational Writing [CSS Tricks]](https://css-tricks.com/words-avoid-educational-writing/).

## Specific words and phrases

For consistency, these words or phrases should always be written in the same way.

- **Streetmix** is one word, and the **m** is always lowercase.
- **Code for America** can be abbreviated **CfA**, after the full name has been mentioned at least once.
- **GitHub** always capitalizes the **H**.
- **NEW INC** is always in uppercase.
- **open source** is two words, never hyphenated.
- **email** is one word. Do not hyphenate or capitalize (unless at the start of a sentence).
- The URL to our website is **<https://streetmix.net/>**, which uses the more secure **https** protocol, and does not have the `www.` prefix in the domain name.

:::info

Additional guidance for text used in the Streetmix interface may be found in our translation system.

:::

## Typography

We also use consistent typography based on industry standards.

- Use [curly quotes instead of straight quotes](https://practicaltypography.com/straight-and-curly-quotes.html).
- Use the [ellipses character](https://practicaltypography.com/ellipses.html) `…` instead of three periods.
- Use the [en dash and em dash](https://practicaltypography.com/hyphens-and-dashes.html) characters when needed, instead of hyphens.
- There should be [only one space after a period](https://slate.com/technology/2011/01/two-spaces-after-a-period-why-you-should-never-ever-do-it.html), instead of two.

Typography practices can differ between languages and cultures. For instance, in Chinese, periods are a small circle `。` instead of a dot; ellipses in written text are expressed with six dots (two ellipses characters side by side) `……`, while in user interfaces (like menu items) the ellipses remain the single ellipses character `…`.

Translators should consider cultural and contextual differences in typography and make recommendations when they differ from expectations in English, and these differences should be consistent throughout the application.

## Units of measurement

By default, use the metric system. We support the imperial system only in the United States for users who are more familiar with it.

:::note

When writing distances in the imperial system, [feet and inches](https://practicaltypography.com/foot-and-inch-marks.html) should use the prime `′` and double prime `″` marks respectively, instead of the straight quotes `'` and `"`.

When processing input, quotes and prime marks should both be accepted as valid.

:::

### Distance

For distance measurements, [include a space between the quantity and unit](https://www.nist.gov/pml/weights-and-measures/writing-metric-units). For example, fifty meters should be expressed as `50 m`, not `50m`.

#### Vernacular exceptions

- In **Russian**, the Cyrillic `м` is more commonly used instead of `m`.
- In **Arabic**, the Arabic letter `م` [is more commonly used](https://en.wikipedia.org/wiki/Modern_Arabic_mathematical_notation#Mathematical_constants_and_units) instead of `m`. Measurements remain in the right-to-left content direction.
