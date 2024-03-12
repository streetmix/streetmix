## Segment info

Each segment is an object. It is named with a string, e.g. 'parklet' that Streetmix uses internally to refer to the segment. Variants are sub-types of a segment, also named with strings. New segments and variants can generally be created without much hassle. However, once created (and running on the production server), modifying the names of segments and variants means you would need to update `streets/data_model.js` to make sure that existing streets will migrate its schemas to the latest versions, otherwise Streetmix will break during loading - it will try to read variants and segments that don't exist.

How to fill in the data for a segment:

| property | type | required? | description |
| --- | --- | --- | --- | --- |
| `name` | _String_ | required | Display name of a segment. Always use sentence case. 'Parking lot', not 'Parking Lot' |
| `owner` | _String_ | optional | See `SegmentTypes` constant variable container. Segments without an owner or type should default to `SegmentTypes.NONE`. |
| `zIndex` | _Integer_ | required | Layering priority. Higher numbers will always display overlapping those with lower numbers. If zIndex is equal, DOM order will determine what is overlapping something else. |
| `defaultWidth` | Object | required | Default width in metric and imperial values. Decimal numbers are allowed. In many cases, though not always, there is a simple conversion rate of `ft = m * (10 / 3)`. |
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

Each graphics object has sub-objects whose key names are how they are intended to display inside of the segment. There are five ways to display something:

| property  | description                                                |
| --------- | ---------------------------------------------------------- |
| `center`  | The sprite is centered inside the segment.                 |
| `repeat`  | The sprite repeats horizontally across the segment.        |
| `left`    | The sprite is aligned to the left side of the segment.     |
| `right`   | The sprite is aligned to the right side of the segment.    |
| `scatter` | Sprites are randomly selected from a pool and distributed. |

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

### Repeated sprites

Properties that define the behavior of repeated (or tiled) sprites.

| property | type | required? | description |
| --- | --- | --- | --- |
| `id` | String | required | Refers to an SVG sprite |
| `padding` | Number | optional | Units: feet (24 pixels = 1 foot). Left and right side padding between the edge of the segment and the tileable space. |

### Scattered sprites

Scattered sprites are randomly chosen from a pool of available sprites and distributed randomly along the width of the segment. These are primarily used for people and plants, but can used for any pool of sprites.

These properties define the behavior of scattered sprites.

| property | type | required? | description |
| --- | --- | --- | --- |
| `sprites` | Array | required | An array of sprites. Sprites can be a text string ID or an object containing more properties (see below). To avoid redefining a pool of sprites for every component definition, you can use `pool` instead to refer to a predefined pool of sprites. |
| `pool` | String | optional | A string Id referring to a predefined pool of sprites. Currently the only available value is `people`, and this pool is defined in `people.json`. |
| `minSpacing` | Number | optional | The minimum spacing (in feet) between any two randomly drawn sprites. Default value is `0`. |
| `maxSpacing` | Number | optional | The maximum spacing (in feet) between any two randomly drawn sprites. Default value is `3`. |
| `padding` | Number | optional | Units: feet (24 pixels = 1 foot). Left and right side padding at the edges of the segment to avoid drawing any sprites. If a sprite is too close to the edge it will be cut off at the edge of the segment. Default value is `0`. |
| `originY` | Number | optional | Units: pixels. An adjustment in vertical position that is applied to each sprite. |

#### Scattered sprite properties

Sprite definitions used in the `sprite` array can have the following properties.

| property | type | required? | description |
| --- | --- | --- | --- |
| `id` | String | required | Refers to an SVG sprite |
| `name` | String | optional | A human-readable name for the sprite |
| `width` | Number | optional | Units: feet. Not all sprites need to have the same width. Specifying the width allows the renderer to properly calculate how much space to allocate to this sprite and maintain consistent spacing between this and other sprites. |
| `disallowFirst` | Boolean | optional | If `true`, this sprite is never picked first from the pool. Default value is `false`. |
| `weight` | Number | optional | Controls the relative weight of drawing this sprite from the pool. The default value is `50`. Lower values mean this sprite is drawn less frequently, and higher values mean this sprite is drawn more frequently. |

### Quirks

Quirks are additional properties that change the rendering logic for a particular segment. There is only one quirk, `minWidth`, which is not the same thing as a segment's legal minimim width. This is the segment's minimum renderable width. For a given segment that is narrower than this width (in feet), the component's graphical assets (not including ground textures, like asphalt) are rendered as if the width of the segment was the `quirks.minWidth` value.

This was created to support the variable-width BRT station, which has left- and right-aligned assets. Below a certain width, the segment would begin to render the pieces of the station in an undesirable way. By specifying the `quirks.minWidth` value, the BRT station stops shrinking (and rendering strangely) below a width of 2 meters.
