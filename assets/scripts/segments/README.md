## Segment info

Each segment is an object. It is named with a string, e.g. 'parklet' that Streetmix uses internally to refer to the segment. Variants are sub-types of a segment, also named with strings. New segments and variants can generally be created without much hassle. However, once created (and running on the production server), modifying the names of segments and variants means you would need to update `streets/data_model.js` to make sure that existing streets will migrate its schemas to the latest versions, otherwise Streetmix will break during loading - it will try to read variants and segments that don't exist.

How to fill in the data for a segment:

| property | type | required? | description |
| --- | --- | --- | --- |
| `name` | _String_ | required | Display name of a segment. Always use sentence case. 'Parking lot', not 'Parking Lot' |
| `owner` | _String_ | optional | See `SegmentTypes` constant variable container. Segments without an owner or type should default to `SegmentTypes.NONE`. |
| `zIndex` | _Integer_ | required | Layering priority. Higher numbers will always display overlapping those with lower numbers. If zIndex is equal, DOM order will determine what is overlapping something else. |
| `defaultWidth` | _Number_ | required | Default width in feet. Decimal numbers are allowed. |
| `variants` | Array of _strings_ | required | Sub-types of the segment, e.g. 'orientation' and 'color'. If there are no variants, use an array of a single empty string, `['']`. |
| `enableWithFlag` | String | optional | Default value: none. If set, the segment is hidden from users unless the its corresponding flag is set to `true`. These segments may not be ready for production or are only enabled under certain conditions. |
| `description` | Object | optional | If present, a "learn more" feature is added to the segment's info box. For more info see below. |
| `details` | Object | required | Details of every variant of the segment. Each variant is named with a string. For segments that have multiple variants, separate each variant with the variant separator ' | ' (pipe) |

### Settings for description

| property | type | required? | description |
| --- | --- | --- | --- |
| `prompt` | String | required | The text on the "learn more" button, e.g. 'Learn more about parklets'. There's no magic processing on it, you have to write 'Learn more about' each time. |
| `image` | String | required | Filename for an image. The file is assumed to be located in /public/images/info-bubble-examples |
| `imageCaption` | String | optional | Caption text / credits for the image. |
| `lede` | String | optional | A brief statement about the segment that will be displayed in a larger font size. |
| `text` | Array of _strings_ | required | Each string in the array will be wrapped in a `<p>` tag. Inline HTML is allowed, for links, emphasis, etc. |

### Settings for variant details

| property | type | required? | description |
| --- | --- | --- | --- |
| `name` | String | optional | If set, this overrides the display name of the segment. Always use sentence case. |
| `minWidth` | Number | optional | Minimum width for this variant in feet. If set, Streetmix throw up a warning if a user makes this segment go below this width, but doesn't prevent a user from doing so. |
| `maxWidth` | Number | optional | Maximum width for this variant in feet. |
| `description` | Object | optional | If present, a "learn more" feature is added to the segment's info box. This is identical to the description object on the parent segment, but it allows the variant to have its own description which will override the parent segment's description. You can also make a variant have a description even if the parent segment does not. Note that for each variant that has the same description you will have to duplicate this description object across multiple variants right now. |
| `graphics` | Object | required | Defines which sprites are needed to draw the segment |

## Graphics settings

Each graphics object has sub-objects whose key names are how they are intended to display inside of the segment. There are four ways to display something:

| property | description                                             |
| -------- | ------------------------------------------------------- |
| `center` | The sprite is centered inside the segment.              |
| `repeat` | The sprite repeats horizontally across the segment.     |
| `left`   | The sprite is aligned to the left side of the segment.  |
| `right`  | The sprite is aligned to the right side of the segment. |

Any combination of these can be applied at once, but there should always be at least one sprite. All graphic elements of a segment are defined here, and that includes not just the primary graphic element itself (like a car or a tree) but also the surface it's on (whether asphalt or sidewalk), and any road markings.

A display type is usually a string or an array of strings referring to at least one sprite definition, but in place of a string id, it can also be an object with `id` as a property and any number of other properties, which will override the corresponding property on the sprite definition.

e.g. for one centered sprite

```
  graphics: {
    center: 'sprite-id'
  }
```

for two (or more) centered sprites

```
  graphics: {
    center: [
      'sprite-id',
      { id: 'sprite-id', overrideProperty: overrideValue },
      ...
    ]
  }
```

These are the properties of each graphic display type.

This section is a work in progress as we reverse engineer from what actually built (but did not ever document anywhere)

One thing to keep in mind that on our tilesheets, the scale is 24 pixels equals one foot. Some measurement numbers are in feet (e.g. '3', meaning 3 feet) will be translated to pixels (so 96 pixels) Decimal values are acceptable.

0, 0 (origin) of the tilesheet and of the sprite are the UPPER LEFT corner All distances are measured from this origin point.

| property | type | required? | description |
| --- | --- | --- | --- |
| `id` | String | required | Refers to an SVG sprite |
| `offsetX` | Number | optional | Units: pixels (24 pixels = 1 foot). Horizontal position to offset the sprite from the attachment spot. The 0 position depends on whether the sprite is attached to the left/right or center of segment. |
| `offsetY` | Number | optional | Units: 1 = 24 pixels (1 feet)). Vertical position to offset the sprite. The attachment point is something like 10 feet above ground. A positive value pushes the sprite downward. |
