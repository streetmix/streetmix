# `credits.json` format

This file stores information that the `<AboutDialog />` component renders.

## `team`

This property stores an array of people who are past and present "core" team members. (Generally speaking, core team members are those who are part of the original team at Code for America, and those who have worked on significant long-term projects for Streetmix, whether paid or as a volunteer contributor. A good rule of thumb is whether that person can claim to represent Streetmix in some capacity at an event. Granted, the lines can get pretty blurry.)

Please keep this list in alphabetical order by first name. (This is enforced when the component renders, which sorts members by the `name` property.)

These properties are allowed for each team member:

| Property          | Description                                                                                                                                                                                                   | Type      | Required? |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | --------- |
| **`name`**        | Full name of team member                                                                                                                                                                                      | _string_  | **Yes**   |
| **`title`**       | Role of team member, in lowercase                                                                                                                                                                             | _string_  | **Yes**   |
| **`mugshotFile`** | Image of team member, which should be a 512x512 maximum square image, optimized, and placed in the `/public/images/team` directory. While not technically required, we highly encourage providing this image. | _string_  | No        |
| **`url`**         | A link to this team member's public presence on the Internet.                                                                                                                                                 | _string_  | No        |
| **`active`**      | Whether this team member is currently active as a contributor.                                                                                                                                                | _boolean_ | **Yes**   |

**Note:** We currently render past team members with a smaller mugshot in the UI, but source images are static and aren't "compiled" to a lower size. In the future, we may consider optimizing images even further, but this is not likely to happen unless we can use the same pipeline elsewhere in the application.

## `contributors`

All other contributors go in this section. (With the exception of translators, which has its own category, see below.) Contributors are grouped into the following categories:

- **Advisors**, people whose roles are primarily as an advisor
- **Additional illustrations**, people who have contributed illustrations
- **Additional code**, people who have contributed code
- **Additional contributors**, people who have contributed services in other ways
- **Special thanks**, people from partnering or supporting organizations

It's possible for people to belong to multiple categories, although in practice this has not really occurred. However, if someone has been in the contributor list, but then has "graduated" into becoming a core team member (whether past or present), they do not need to be in the contributor section any longer.

Each category's key value maps to a value in a locale file, so that `advisors` is looked up under `credits.advisors` when translating the label. We can change or modify the categories by adding them in `credits.json` and ensuring that corresponding translations exist in locale files with the same key. Categories are listed in the order given in `credits.json` and are not sorted.

Categories are an array of names and possibly other types (more on this below). All names are sorted alphabetically by first name (using `Array.sort()`). We previously had sections that were not alphabetized, but this was modified for consistent rendering behavior.

```json
{
  "contributors": {
    "advisors": ["Ada Lovelace", "Grace Hopper"]
  }
}
```

Names can have a special case where you can optionally display an organization (or title, etc) after the name. To do this, instead of using a string for the name, use an array, where the first item is the full name, and the second item is the name of their organization (or title, etc). This format can coexist alongside plain strings.

```json
{
  "contributors": {
    "advisors": ["Ada Lovelace", ["Grace Hopper", "Harvard Computation Lab"]]
  }
}
```

Names can also be subcategorized. This is done with an object like so. Currently, the names that are nested in this way don't support the array format for secondary information, but we can revisit this limitation if or when it comes up.

```json
{
  "contributors": {
    "advisors": [
      "Ada Lovelace",
      {
        "label": "Harvard Computation Lab",
        "people": {
          "Grace Hopper",
          "Howard H. Aiken"
        }
      }
    ]
  }
}
```

## `translators`

Translators are all the people who have participated in localizing or translating Streetmix. They are listed alphabetically by first name for each locale (enforced by `Array.sort()`). This property stores an object where each item has a key that is a locale code, and the value of the key is an array of names:

```json
{
  "translators": {
    "en": ["Gandalf the Grey", "Elrond"]
  }
}
```

The key must map to the language name in a locale file, e.g. `en` maps to `i18n.lang.en`, so that the label `English` displays. Languages are displayed in the order given in `credits.json`, which are currently ordered alphabetically based on their display name in English, but they are not currently sorted alphabetically for each locale when it is rendered.

Similar to contributor names, translator names can use the array format for secondary information (like organization name or title). However, unlike contributor names, the translator section does not support sub-grouping of names.

```json
{
  "translators": {
    "en": ["Gandalf the Grey", ["Elrond", "Rivendell"]]
  }
}
```
