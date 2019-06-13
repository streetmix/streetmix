# `credits.json` format

This file stores information that the `<AboutDialog />` component renders.

## `team`

This property stores an array of people who are past and present "core" team members. (Generally speaking, core team members are those who are part of the original team at Code for America, and those who have worked on significant long-term projects for Streetmix, whether paid or as a volunteer contributor. A good rule of thumb is whether that person can claim to represent Streetmix in some capacity at an event. Granted, the lines can get pretty blurry.)

Please keep this list in alphabetical order by first name. (This is enforced when the component renders, which sorts members by the `name` property.)

These properties are allowed for each team member:

| Property          | Description                                                    | Type      | Required?   |
| ----------------- | -------------------------------------------------------------- | --------- | ----------- |
| **`name`**        | Full name of team member                                       | _string_  | **Yes**     |
| **`title`**       | Role of team member, in lowercase                              | _string_  | **Yes**     |
| **`mugshotFile`** | Image of team member, which should be a 512x512 maximum square image, optimized, and placed in the `/public/images/team` directory. While not technically required, we highly encourage providing this image. | _string_ | No |
| **`url`**         | A link to this team member's public presence on the Internet.  | _string_  | No          |
| **`active`**      | Whether this team member is currently active as a contributor. | _boolean_ | **Yes**     |

**Note:** We currently render past team members with a smaller mugshot in the UI, but source images are static and aren't "compiled" to a lower size. In the future, we may consider optimizing images even further, but this is not likely to happen unless we can use the same pipeline elsewhere in the application.
