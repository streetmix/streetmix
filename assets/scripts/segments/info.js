export const SEGMENT_OWNER_CAR = 'car'
export const SEGMENT_OWNER_BIKE = 'bike'
export const SEGMENT_OWNER_PEDESTRIAN = 'pedestrian'
export const SEGMENT_OWNER_PUBLIC_TRANSIT = 'public-transit'
const SEGMENT_OWNER_NATURE = 'nature'

/*
Segment info documentation
--------------------------

TODO: Put this elsewhere?

Each segment is an object. It is named with a string, e.g. 'parklet'
that Streetmix uses internally to refer to the segment. Variants are
sub-types of a segment, also named with strings. New segments and
variants can generally be created without much hassle. However,
once created (and running on the production server), modifying
the names of segments and variants means you would need to
update streets/data_model.js to make sure that existing streets
will migrate its schemas to the latest versions, otherwise
Streetmix will break during loading - it will try to read variants
and segments that don't exist.

How to fill in the data for a segment:

  name:         String (required)
                Display name of a segment.
                Always use sentence case. 'Parking lot', not 'Parking Lot'
  owner:        CONSTANT_VARIABLE (see top of this file)
                (required?)
                Defines the meta-category of what the segment is -
                is it for cars, pedestrians, transit, etc?
                We used to keep track of this to give people a sense
                of how much space is taken up by different modes.
                We may still re-incorporate it somehow.
  zIndex:       Integer (required)
                Layering priority. Higher numbers will always
                display overlapping those with lower numbers.
                If zIndex is equal, DOM order will determine
                what is overlapping something else.
                When in doubt, use zIndex value of 1
                When you know you need it, change it to 2
                (or higher, but right now 2 is our max)
  defaultWidth  Number (required)
                Default width in feet
                Decimal numbers are allowed.
  needRandSeed  Boolean (optional)
                Default value: false
                Set as true if the segment needs a random number
                generator. For instance sidewalk pedestrians are
                randomly generated each time.
  variants      Array of strings (required)
                Sub-types of the segment, e.g. 'orientation' and 'color'
                If there are no variants, use an array of a single
                empty string, ['']
  enableWithFlag  String (optional)
                Default value: none
                If set, the segment is hidden from users unless the
                its corresponding flag is set to true. These segments
                may not be ready for production or are only enabled
                under certain conditions.
  description   Object (optional)
                If present, a "learn more" feature is added to the
                segment's info box. For more info see below.
  details       Object (required)
                Details of every variant of the segment
                Each variant is named with a string.
                For segments that have multiple variants, separate
                each variant with the variant separator '|' (pipe)

  Settings for description

  prompt        String (required)
                The text on the "learn more" button, e.g.
                'Learn more about parklets'
                There's no magic processing on it, you have to
                write 'Learn more about' each time
  image         String (required)
                Filename for an image. The file is assumed to
                be located in /public/images/info-bubble-examples
  imageCaption  String (optional)
                Caption text / credits for the image.
  lede          String (optional)
                A brief statement about the segment that will be
                displayed in a larger font size.
  text          Array of strings (required)
                Each string in the array will be wrapped in a <p>
                tag. Inline HTML is allowed, for links, emphasis, etc.

  Settings for variant details

  name          String (optional)
                If set, this overrides the display name of the segment.
                Always use sentence case.
  minWidth      Number (optional)
                Minimum width for this variant in feet.
                If set, Streetmix throw up a warning if a user
                makes this segment go below this width, but doesn't
                prevent a user from doing so.
  maxWidth      Number (optional)
                Maximum width for this variant in feet.
  description   Object (optional)
                If present, a "learn more" feature is added to the
                segment's info box. This is identical to the description
                object on the parent segment, but it allows the variant
                to have its own description which will override the parent
                segment's description. You can also make a variant have a
                description even if the parent segment does not. Note that for each
                variant that has the same description you will have to duplicate
                this description object across multiple variants right now.
  graphics      Object (required)
                Defines where sprites on the tile sheet are taken from
                and defines where sprites should be placed in the segment itself

  Graphics settings

  Each graphics object has sub-objects whose key names are how they are intended
  to display inside of the segment. There are four ways to display something:

    center      The sprite is centered inside the segment.
    repeat      The sprite repeats horizontally across the segment.
    left        The sprite is aligned to the left side of the segment.
    right       The sprite is aligned to the right side of the segment.

  Any combination of these can be applied at once, but there should always be
  at least one defined. All graphic elements of a segment are defined here, and
  that includes not just the primary graphic element itself (like a car or a tree)
  but also the surface it's on (whether asphalt or sidewalk), and any road
  markings.

  A display type is usually an object containing some more properties, but
  if you want to, say, center two sprites, then center is equal to an array
  of two objects.

  e.g. for one centered sprite
    graphics: {
      center: { ... }
    }

  for two (or more) centered sprites
    graphics: {
      center: [
        { ... },
        { ... },
        ...
      ]
    }

  These are the properties of each graphic display type.

  This section is a work in progress as we reverse engineer from what
  actually built (but did not ever document anywhere)

  One thing to keep in mind that on our tilesheets, the scale
  is 24 pixels equals one foot. Some measurement numbers are in
  feet (e.g. '3', meaning 3 feet) will be translated to pixels (so 96 pixels)
  Decimal values are acceptable.

  0, 0 (origin) of the tilesheet and of the sprite are the UPPER LEFT corner
  All distances are measured from this origin point.

  tileset       Integer (required)
                Which tilesheet it's on. Currently 1, 2, or 3.
                These are hand-made right now.
  x             Number (required) (units: 1 = 24 pixels (1 feet))
                From the origin point of the tilesheet, the x position
                is the left edge of the sprite.
  y             Number (required) (units: 1 = 24 pixels (1 feet))
                From the origin point of the tilesheet, the y position
                is the top edge of the sprite.
  width         Number (required) (units: 1 = 24 pixels (1 feet))
                From the x position of the sprite, the width of the
                sprite and the display canvas
  height        Number (required) (units: 1 = 24 pixels (1 feet))
                From the y position of the sprite, the height of the
                sprite and the display canvas (note this measures
                DOWNWARD, because the origin is from the TOP edge)
  offsetX       Number (optional) (units: 1 = 24 pixels (1 feet))
                Horizontal position to offset the sprite from the
                attachment spot. The 0 position depends on whether the
                sprite is attached to the left/right or center of segment.
  offsetY       Number (optional) (units: 1 = 24 pixels (1 feet))
                Vertical position to offset the sprite. The attachment
                point is something like 10 feet above ground. A positive
                value pushes the sprite downward.

*/

const IMAGE_IDS = {
  // things we don't have svgs for
  'asphalt': { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 },
  'concrete': { tileset: 2, x: 110, y: 53, width: 9, height: 5, offsetY: 10 },
  'concrete-gray-lower': { tileset: 2, x: 110, y: 43, width: 9, height: 5, offsetY: 10 },
  'marking-left': { tileset: 2, x: 119, y: 15, width: 1, height: 5, offsetY: 10 },
  'marking-right': { tileset: 2, x: 117, y: 15, width: 1, height: 5, offsetY: 10 },
  'stripes': { tileset: 2, x: 116, y: 21, width: 5, height: 5, offsetY: 10 },
  'center-turn-marking-left': { tileset: 2, x: 119, y: 10, width: 2, height: 5, offsetY: 10 },
  'center-turn-marking-right': { tileset: 2, x: 116, y: 10, width: 2, height: 5, offsetY: 10 },
  'arrow-inbound': { tileset: 1, x: 30, y: 15, width: 4, height: 5, offsetY: 10 },
  'arrow-outbound': { tileset: 1, x: 39, y: 15, width: 4, height: 5, offsetY: 10 },
  'dark-arrow-inbound': { tileset: 1, x: 28, y: 15, width: 8, height: 5, offsetY: 10 },
  'dark-arrow-outbound': { tileset: 1, x: 37, y: 15, width: 8, height: 5, offsetY: 10 },
  'arrow-turn-left-inbound': { tileset: 2, x: 125, y: 15, width: 4, height: 5, offsetY: 10 },
  'arrow-turn-left-straight-inbound': { tileset: 2, x: 125, y: 10, width: 4, height: 5, offsetY: 10 },
  'arrow-straight-inbound': { tileset: 1, x: 30, y: 5, width: 4, height: 5, offsetY: 10 }, // white version of arrow-inbound
  'arrow-turn-right-straight-inbound': { tileset: 1, x: 83, y: 10, width: 4, height: 5, offsetY: 10 },
  'arrow-turn-right-inbound': { tileset: 1, x: 83, y: 15, width: 4, height: 5, offsetY: 10 },
  'arrow-turn-both-inbound': { tileset: 2, x: 153, y: 15, width: 5, height: 5, offsetY: 10 },
  'arrow-turn-shared-inbound': { tileset: 2, x: 144, y: 20, width: 5, height: 5, offsetY: 10 },
  'arrow-turn-left-outbound': { tileset: 2, x: 134, y: 15, width: 4, height: 5, offsetY: 10 },
  'arrow-turn-left-straight-outbound': { tileset: 2, x: 134, y: 10, width: 4, height: 5, offsetY: 10 },
  'arrow-straight-outbound': { tileset: 1, x: 39, y: 5, width: 4, height: 5, offsetY: 10 },
  'arrow-turn-right-straight-outbound': { tileset: 2, x: 143, y: 10, width: 4, height: 5, offsetY: 10 },
  'arrow-turn-right-outbound': { tileset: 2, x: 143, y: 15, width: 4, height: 5, offsetY: 10 },
  'arrow-turn-both-outbound': { tileset: 2, x: 148, y: 15, width: 5, height: 5, offsetY: 10 },
  'arrow-turn-shared-outbound': { tileset: 2, x: 134, y: 20, width: 5, height: 5, offsetY: 10 },
  'asphalt-green': { tileset: 2, x: 98 - 10, y: 53 + 10, width: 8, height: 5, offsetY: 10 },
  'asphalt-red': { tileset: 2, x: 98, y: 53 + 10, width: 10, height: 5, offsetY: 10 },
  'parking-marking-left': { tileset: 2, x: 112, y: 15, width: 2, height: 5, offsetY: 10 },
  'parking-marking-right': { tileset: 1, x: 46, y: 15, width: 2, height: 5, offsetY: 10 },
  'marking-sharrow-inbound': { tileset: 2, x: 101, y: 15, width: 4, height: 5, offsetY: 10 },
  'marking-sharrow-outbound': { tileset: 2, x: 106, y: 15, width: 4, height: 5, offsetY: 10 },
  'streetcar-track-01': { tileset: 1, x: 28, y: 57, width: 8, height: 5, offsetY: 10 }, // lighter (for dark backgrounds)
  'streetcar-track-02': { tileset: 1, x: 18, y: 57, width: 8, height: 5, offsetY: 10 }, // darker (for light backgrounds)
  'concrete-raised': { tileset: 2, x: 110, y: 63, width: 9, height: 9, offsetY: 6 },

  // things we have svgs for
  'parklet-left': { id: 'parklet--yerba-buena-parklet-left-v02', width: 8, height: 8, offsetY: 3.4 },
  'parklet-right': { id: 'parklet--yerba-buena-parklet-right-v02', width: 8, height: 8, offsetY: 3.4 },
  'bike-rack-parallel-left': { id: 'bikes--bike-rack-parallel-left', width: 3, height: 6, offsetY: 4.75 },
  'bike-rack-parallel-right': { id: 'bikes--bike-rack-parallel-right', width: 3, height: 6, offsetY: 4.75 },
  'bike-rack-perpendicular-left': { id: 'bikes--bike-rack-perpendicular-left', width: 6, height: 6, offsetY: 4.75 },
  'bike-rack-perpendicular-right': { id: 'bikes--bike-rack-perpendicular-right', width: 6, height: 6, offsetY: 4.75 },
  'bench-left': { id: 'furniture--bench-left', width: 3, height: 6, offsetY: 4.75 },
  'bench-center': { id: 'furniture--bench-center', width: 3, height: 6, offsetY: 4.75 },
  'bench-right': { id: 'furniture--bench-right', width: 3, height: 6, offsetY: 4.75 },
  'wayfinding-large': { id: 'wayfinding--nyc-wayfinding-pylon-large', width: 4, height: 11, offsetY: -0.3 },
  'wayfinding-medium': { id: 'wayfinding--nyc-wayfinding-pylon-medium', width: 3, height: 11, offsetY: -0.3 },
  'wayfinding-small': { id: 'wayfinding--nyc-wayfinding-pylon-small', width: 2, height: 11, offsetY: -0.3 },
  'lamp-modern-right': { id: 'lamps--lamp-modern-left', width: 12, height: 31, offsetX: -10.3, offsetY: -20.25 }, // ids swapped
  'lamp-modern-both': { id: 'lamps--lamp-modern-both', width: 16, height: 31, offsetY: -20.25 },
  'lamp-modern-left': { id: 'lamps--lamp-modern-right', width: 12, height: 31, offsetX: -10.3, offsetY: -20.25 }, // ids swapped
  'lamp-traditional-right': { id: 'lamps--lamp-traditional-right', width: 4, height: 15, offsetX: -1.5, offsetY: -4.25 },
  'lamp-traditional-both': { id: 'lamps--lamp-traditional-both', width: 4, height: 15, offsetY: -4.25 },
  'lamp-traditional-left': { id: 'lamps--lamp-traditional-left', width: 4, height: 15, offsetX: -1.5, offsetY: -4.25 },
  'pride-flag-left': { id: 'lamps--pride-banner-right', width: 4, height: 6, offsetX: -2.5, offsetY: -13 }, // ids swapped
  'pride-flag-right': { id: 'lamps--pride-banner-left', width: 4, height: 6, offsetX: -2.5, offsetY: -13 }, // ids swapped
  'trees--tree': { id: 'trees--tree', width: 9, height: 21, offsetY: -10.25 },
  'trees--palm-tree': { id: 'trees--palm-tree', offsetX: 0, offsetY: -20.25, width: 14, height: 31 },
  'planter-box': { id: 'dividers--planter-box', width: 4, height: 7, offsetY: 4.25 },
  'bush': { id: 'plants--bush', width: 4, height: 5, offsetY: 5.7 },
  'flower': { id: 'plants--flowers', width: 4, height: 5, offsetY: 5.5 },
  'bollard': { id: 'dividers--bollard', width: 1, height: 7, offsetY: 4.25 },
  'dome': { id: 'dividers--dome', width: 1, height: 7, offsetY: 4.25 },
  'bike-inbound': { id: 'bikes--biker-01-inbound', width: 3, height: 8, offsetY: 3.25 },
  'bike-outbound': { id: 'bikes--biker-01-outbound', width: 3, height: 8, offsetY: 3.25 },
  'bike-inbound-02': { id: 'bikes--biker-02-inbound', width: 3, height: 8, offsetY: 3.25 },
  'bike-outbound-02': { id: 'bikes--biker-02-outbound', width: 3, height: 8, offsetY: 3.25 },
  'car-inbound': { id: 'vehicles--car-inbound', width: 12, height: 15, offsetY: -3.7 },
  'car-outbound': { id: 'vehicles--car-outbound', width: 12, height: 15, offsetY: -3.7 },
  'car-turn-left-inbound': { id: 'vehicles--car-inbound-turn-signal-right', width: 12, height: 15, offsetY: -3.7 }, // left/right flipped on purpose (see relevant issue/discussion about swapping it back)
  'car-turn-right-inbound': { id: 'vehicles--car-inbound-turn-signal-left', width: 12, height: 15, offsetY: -3.7 }, // left/right flipped on purpose (see relevant issue/discussion about swapping it back)
  'car-turn-left-outbound': { id: 'vehicles--car-outbound-turn-signal-left', width: 12, height: 15, offsetY: -3.7 },
  'car-turn-right-outbound': { id: 'vehicles--car-outbound-turn-signal-right', width: 12, height: 15, offsetY: -3.7 },
  'car-perpendicular-left': { id: 'vehicles--car-sideways-left', width: 14, height: 6, offsetY: 5.35 },
  'car-perpendicular-right': { id: 'vehicles--car-sideways-right', width: 14, height: 6, offsetY: 5.35 },
  'bus-inbound': { id: 'transit--bus-inbound', width: 12, height: 11, offsetY: 0.3 },
  'bus-outbound': { id: 'transit--bus-outbound', width: 12, height: 11, offsetY: 0.3 },
  'light-rail-inbound': { id: 'transit--light-rail-inbound', width: 10, height: 17, offsetY: -5.75 },
  'light-rail-outbound': { id: 'transit--light-rail-outbound', width: 10, height: 17, offsetY: -5.75 },
  'inception-train': { id: 'secret--inception-train', width: 14, height: 16, offsetY: -4.7 },
  'streetcar-inbound': { id: 'transit--streetcar-inbound', width: 12, height: 18, offsetY: -6.75 },
  'streetcar-outbound': { id: 'transit--streetcar-outbound', width: 12, height: 18, offsetY: -6.75 },
  'truck-inbound': { id: 'vehicles--truck-inbound', width: 10, height: 12, offsetY: 0 },
  'truck-outbound': { id: 'vehicles--truck-outbound', width: 9, height: 12, offsetY: 0 },
  'transit-shelter-left': { id: 'transit--transit-shelter-01-left', width: 9, height: 12, offsetY: -1.3 },
  'transit-shelter-right': { id: 'transit--transit-shelter-01-right', width: 9, height: 12, offsetY: -1.3 },
  'transit-shelter-elevated-left': { id: 'transit--transit-shelter-02-left', width: 9, height: 12, offsetY: -3.8 },
  'transit-shelter-elevated-right': { id: 'transit--transit-shelter-02-right', width: 9, height: 12, offsetY: -3.8 },

  // svgs that need to be remade
  'grass': { tileset: 2, x: 121, y: 53, width: 4, height: 5, offsetY: 10, offsetLeft: 0, offsetRight: 0 }
}

export const SEGMENT_INFO = {
  'sidewalk': {
    name: 'Sidewalk',
    owner: SEGMENT_OWNER_PEDESTRIAN,
    zIndex: 2,
    defaultWidth: 6,
    needRandSeed: true,
    variants: ['sidewalk-density'],
    details: {
      'dense': {
        minWidth: 6,
        graphics: {
          repeat: [
            IMAGE_IDS['concrete']
          ]
        }
      },
      'normal': {
        minWidth: 6,
        graphics: {
          repeat: [
            IMAGE_IDS['concrete']
          ]
        }
      },
      'sparse': {
        minWidth: 6,
        graphics: {
          repeat: [
            IMAGE_IDS['concrete']
          ]
        }
      },
      'empty': {
        minWidth: 6,
        graphics: {
          repeat: [
            IMAGE_IDS['concrete']
          ]
        }
      }
    }
  },
  'sidewalk-tree': {
    name: 'Sidewalk with a tree',
    owner: SEGMENT_OWNER_NATURE,
    zIndex: 1,
    defaultWidth: 4,
    variants: ['tree-type'],
    details: {
      'big': {
        graphics: {
          center: [
            IMAGE_IDS['trees--tree']
          ],
          repeat: [
            IMAGE_IDS['concrete']
          ]
        }
      },
      'palm-tree': {
        graphics: {
          center: [
            IMAGE_IDS['trees--palm-tree']
          ],
          repeat: [
            IMAGE_IDS['concrete']
          ]
        }
      }
    }
  },
  'sidewalk-bike-rack': {
    name: 'Bike rack',
    owner: SEGMENT_OWNER_BIKE,
    zIndex: 2,
    defaultWidth: 5,
    variants: ['orientation', 'bike-rack-elevation'],
    paletteIcon: 'left|sidewalk',
    details: {
      'left|sidewalk-parallel': {
        graphics: {
          left: [
            IMAGE_IDS['bike-rack-parallel-left']
          ],
          repeat: [
            IMAGE_IDS['concrete']
          ]
        }
      },
      'right|sidewalk-parallel': {
        graphics: {
          right: [
            IMAGE_IDS['bike-rack-parallel-right']
          ],
          repeat: [
            IMAGE_IDS['concrete']
          ]
        }
      },
      'left|sidewalk': {
        graphics: {
          left: [
            IMAGE_IDS['bike-rack-perpendicular-left']
          ],
          repeat: [
            IMAGE_IDS['concrete']
          ]
        }
      },
      'right|sidewalk': {
        graphics: {
          right: [
            IMAGE_IDS['bike-rack-perpendicular-right']
          ],
          repeat: [
            IMAGE_IDS['concrete']
          ]
        }
      },
      'left|road': {
        graphics: {
          left: [
            Object.assign({}, IMAGE_IDS['bike-rack-perpendicular-left'], { offsetY: 5.25 })
          ],
          repeat: [
            IMAGE_IDS['asphalt']
          ]
        }
      },
      'right|road': {
        graphics: {
          right: [
            Object.assign({}, IMAGE_IDS['bike-rack-perpendicular-right'], { offsetY: 5.25 })
          ],
          repeat: [
            IMAGE_IDS['asphalt']
          ]
        }
      }
    }
  },
  'sidewalk-bench': {
    name: 'Bench',
    owner: SEGMENT_OWNER_PEDESTRIAN,
    zIndex: 2,
    defaultWidth: 4,
    variants: ['bench-orientation'],
    details: {
      'left': {
        graphics: {
          left: [
            IMAGE_IDS['bench-left']
          ],
          repeat: [
            IMAGE_IDS['concrete']
          ]
        }
      },
      'center': {
        graphics: {
          center: [
            IMAGE_IDS['bench-center']
          ],
          repeat: [
            IMAGE_IDS['concrete']
          ]
        }
      },
      'right': {
        graphics: {
          right: [
            IMAGE_IDS['bench-right']
          ],
          repeat: [
            IMAGE_IDS['concrete']
          ]
        }
      }
    }
  },
  'sidewalk-wayfinding': {
    name: 'Wayfinding sign',
    owner: SEGMENT_OWNER_PEDESTRIAN,
    zIndex: 2,
    defaultWidth: 4,
    variants: ['wayfinding-type'],
    description: {
      prompt: 'Learn more about wayfinding signs',
      image: 'wayfinding-02.jpg',
      imageCaption: '',
      lede: 'Wayfinding signs help pedestrians get to common destinations.',
      text: [
        'Urban planners and architects have spent a few decades trying to learn what happens in people’s brains when they figure out how to get from point A to point B – or how they even know where “point A” is to begin with. As early as 1960, urban planner Kevin Lynch wrote of the “legibility” of the city in his book <em><a href="http://www.amazon.com/Image-Harvard-MIT-Center-Studies-Series/dp/0262620014">The Image of the City</a></em>, describing wayfinding as “a consistent use and organization of definite sensory cues from the external environment.” It could be intangible – smell, touch, a sense of gravity or even electric or magnetic fields. Or it could be much more physical, with intentionally designed “wayfinding devices” like maps, street numbers, or route signs.',
        'It’s surprising how readily acceptable it is for ample signage to cater to car travel, with less of this investment made at the pedestrian level. Maybe it’s because it’s easier for us to stand still, take stock of our surroundings, and use our senses without fear of accidentally causing a six-person pileup behind us. At any rate, urban designers have pushed for pedestrian-friendly wayfinding signage, particularly in walkable commercial neighborhoods, and these signs have become branding opportunities in addition to being functional. So New York City <a href="http://new.pentagram.com/2013/06/new-work-nyc-wayfinding/">hired an internationally renowned design consultant</a> (and Streetmix has modeled its segments after it), many others have adopted a traditional old-town or civic-formal take (pictured above), and then there are those, for whatever reason, who lack any pedestrian wayfinding signage of significance, such that any improvement must be made with <a href="http://walkyourcity.org/">guerrilla wayfinding tactics</a>.',
        'After all, there’s nothing worse than being lost. As Lynch wrote: “The very word <em>lost</em> in our language means much more than simple geographical uncertainty; it carries overtones of utter disaster.” And who wants to be on the street feeling like that?'
      ]
    },
    details: {
      'large': {
        graphics: {
          center: [
            IMAGE_IDS['wayfinding-large']
          ],
          repeat: [
            IMAGE_IDS['concrete']
          ]
        }
      },
      'medium': {
        graphics: {
          center: [
            IMAGE_IDS['wayfinding-medium']
          ],
          repeat: [
            IMAGE_IDS['concrete']
          ]
        }
      },
      'small': {
        graphics: {
          center: [
            IMAGE_IDS['wayfinding-small']
          ],
          repeat: [
            IMAGE_IDS['concrete']
          ]
        }
      }
    }
  },
  'sidewalk-lamp': {
    name: 'Sidewalk with a lamp',
    owner: SEGMENT_OWNER_PEDESTRIAN,
    zIndex: 2,
    defaultWidth: 4,
    variants: ['lamp-orientation', 'lamp-type'],
    paletteIcon: 'both|traditional',
    details: {
      'right|modern': {
        graphics: {
          right: [
            IMAGE_IDS['lamp-modern-right']
          ],
          repeat: [
            IMAGE_IDS['concrete']
          ]
        }
      },
      'both|modern': {
        graphics: {
          center: [
            IMAGE_IDS['lamp-modern-both']
          ],
          repeat: [
            IMAGE_IDS['concrete']
          ]
        }
      },
      'left|modern': {
        graphics: {
          left: [
            IMAGE_IDS['lamp-modern-left']
          ],
          repeat: [
            IMAGE_IDS['concrete']
          ]
        }
      },
      'right|traditional': {
        graphics: {
          right: [
            IMAGE_IDS['lamp-traditional-right']
          ],
          repeat: [
            IMAGE_IDS['concrete']
          ]
        }
      },
      'both|traditional': {
        graphics: {
          center: [
            IMAGE_IDS['lamp-traditional-both']
          ],
          repeat: [
            IMAGE_IDS['concrete']
          ]
        }
      },
      'left|traditional': {
        graphics: {
          left: [
            IMAGE_IDS['lamp-traditional-left']
          ],
          repeat: [
            IMAGE_IDS['concrete']
          ]
        }
      },
      'right|pride': {
        graphics: {
          right: [
            IMAGE_IDS['lamp-modern-right'],
            IMAGE_IDS['pride-flag-right']
          ],
          repeat: [
            IMAGE_IDS['concrete']
          ]
        }
      },
      'both|pride': {
        graphics: {
          center: [
            IMAGE_IDS['lamp-modern-both'],
            Object.assign({}, IMAGE_IDS['pride-flag-left'], { offsetX: 1.5 })
          ],
          repeat: [
            IMAGE_IDS['concrete']
          ]
        }
      },
      'left|pride': {
        graphics: {
          left: [
            IMAGE_IDS['lamp-modern-left'],
            IMAGE_IDS['pride-flag-left']
          ],
          repeat: [
            IMAGE_IDS['concrete']
          ]
        }
      }
    }
  },
  'parklet': {
    name: 'Parklet',
    owner: SEGMENT_OWNER_NATURE,
    zIndex: 2,
    defaultWidth: 8,
    variants: ['orientation'],
    description: {
      prompt: 'Learn more about parklets',
      image: 'parklets-01.jpg',
      imageCaption: '4033 Judah Street Parklet, courtesy of San Francisco Planning Department.',
      lede: 'Parklets turn existing parking spots into temporary public spaces.',
      text: [
        'In 2005, San Francisco-based design studio <a href="http://rebargroup.org/">Rebar</a> temporarily converted a single metered parking space on downtown Mission Street into a tiny public park. The first parklet was simple: just a bench and a tree on a rectangular piece of turf, but it featured a brief instruction manual and a charge for others to make their own. With people realizing that so much of public space was really devoted to storing cars, an international movement was born, and now, the annual <a href="http://parkingday.org/">Park(ing) Day</a> hosts nearly a thousand temporarily converted spots around the world.',
        'Knowing a good idea when it sees one, San Francisco became the first city to make parklets official with its <a href="http://sfpavementtoparks.sfplanning.org/">Pavement to Parks program</a> in 2010. Today, the City by the Bay has over 50 parklets, many of which are now architecturally designed objects much improved beyond Rebar’s modest prototype. There’s an ambitious, corporate-sponsored two-block-long parklet in the heart of San Francisco’s busiest shopping corridor, and also a collection of movable, bright red “parkmobiles” (Streetmix’s default look) designed for the <a href="http://www.ybcbd.org/">Yerba Buena Community Benefit District</a>. Official parklet programs now exist in many other cities in North America, such as Philadelphia, Oakland, Kansas City, New York, Chicago, and Vancouver, and many more cities are soon to follow.'
      ]
    },
    details: {
      'left': {
        minWidth: 8,
        graphics: {
          left: [
            IMAGE_IDS['parklet-left']
          ],
          repeat: [
            IMAGE_IDS['asphalt']
          ]
        }
      },
      'right': {
        minWidth: 8,
        graphics: {
          right: [
            IMAGE_IDS['parklet-right']
          ],
          repeat: [
            IMAGE_IDS['asphalt']
          ]
        }
      }
    }
  },
  'divider': {
    name: 'Buffer',
    owner: SEGMENT_OWNER_NATURE,
    zIndex: 1,
    defaultWidth: 2,
    variants: ['divider-type'],
    paletteIcon: 'planting-strip',
    details: {
      'planting-strip': {
        name: 'Planting strip',
        graphics: {
          repeat: [
            IMAGE_IDS['grass'],
            IMAGE_IDS['concrete']
          ]
        }
      },
      'planter-box': {
        name: 'Planter box',
        graphics: {
          center: [
            IMAGE_IDS['planter-box']
          ],
          repeat: [
            IMAGE_IDS['asphalt'],
            IMAGE_IDS['stripes']
          ],
          left: [
            IMAGE_IDS['marking-left']
          ],
          right: [
            IMAGE_IDS['marking-right']
          ]
        }
      },
      'median': {
        name: 'Median',
        graphics: {
          repeat: [
            IMAGE_IDS['concrete']
          ]
        }
      },
      'striped-buffer': {
        name: 'Buffer',
        graphics: {
          repeat: [
            IMAGE_IDS['asphalt'],
            IMAGE_IDS['stripes']
          ],
          left: [
            IMAGE_IDS['marking-left']
          ],
          right: [
            IMAGE_IDS['marking-right']
          ]
        }
      },
      'bush': {
        name: 'Planting strip',
        graphics: {
          center: [
            IMAGE_IDS['bush']
          ],
          repeat: [
            IMAGE_IDS['grass'],
            IMAGE_IDS['concrete']
          ]
        }
      },
      'flowers': {
        name: 'Planting strip',
        graphics: {
          center: [
            IMAGE_IDS['flower']
          ],
          repeat: [
            IMAGE_IDS['grass'],
            IMAGE_IDS['concrete']
          ]
        }
      },
      'big-tree': {
        name: 'Planting strip',
        graphics: {
          center: [
            IMAGE_IDS['trees--tree']
          ],
          repeat: [
            IMAGE_IDS['grass'],
            IMAGE_IDS['concrete']
          ]
        }
      },
      'palm-tree': {
        name: 'Planting strip',
        graphics: {
          center: [
            IMAGE_IDS['trees--palm-tree']
          ],
          repeat: [
            IMAGE_IDS['grass'],
            IMAGE_IDS['concrete']
          ]
        }
      },
      'bollard': {
        name: 'Bollard',
        graphics: {
          center: [
            IMAGE_IDS['bollard']
          ],
          repeat: [
            IMAGE_IDS['asphalt'],
            IMAGE_IDS['stripes']
          ],
          left: [
            IMAGE_IDS['marking-left']
          ],
          right: [
            IMAGE_IDS['marking-right']
          ]
        }
      },
      'dome': {
        name: 'Traffic exclusion dome',
        graphics: {
          center: [
            IMAGE_IDS['dome']
          ],
          repeat: [
            IMAGE_IDS['asphalt'],
            IMAGE_IDS['stripes']
          ],
          left: [
            IMAGE_IDS['marking-left']
          ],
          right: [
            IMAGE_IDS['marking-right']
          ]
        }
      }
    }
  },
  'bike-lane': {
    name: 'Bike lane',
    owner: SEGMENT_OWNER_BIKE,
    zIndex: 2,
    defaultWidth: 6,
    variants: ['direction', 'bike-asphalt'],
    description: {
      prompt: 'Learn more about bike lanes',
      image: 'bike-lane-02.jpg',
      imageCaption: '',
      lede: 'Bike lanes help keep bicyclists safe in a separate lane from cars.',
      text: [
        'On the historical timeline of personal transportation vehicles – horses on one end, and, say, Segways on the other – automobiles and bicycles have been the dominant warring tribes of public streets for nearly a century. Despite all the cars taking up so much room, though, there’s more bicycles than anything else in the world: more than a billion, as estimated by Worldometers, and nine million in Beijing, according to folk singer <a href="http://en.wikipedia.org/wiki/Nine_Million_Bicycles">Katie Melua</a>, where bicycling accounts for 32% of all trips.',
        'While most jurisdictions allow bicycles to share the road with motor vehicles (“A person riding a bicycle… has all the rights and is subject to all the provisions applicable to the driver of a vehicle” <a href="http://www.leginfo.ca.gov/cgi-bin/displaycode?section=veh&group=21001-22000&file=21200-21212">says the California Vehicle Code</a>, in one particular instance) it goes without saying that most cyclists prefer to be in their own lane. It’s safer, for one thing. And because it’s safer, it actually encourages more bikers. And more bikers means healthier citizens, reduced carbon emissions, higher traffic throughput, and congestion mitigation. The <a href="http://pdxcityclub.org/2013/Report/Portland-Bicycle-Transit/Economic-Effects-of-Increased-Bicycle-Usage">economic benefits accrue as well</a>: less money spent on automobile infrastructure (like bridges, roadways, and parking), and with the ability to fit more people on a road, it leads to more business in commercial corridors.',
        'Bike lane design can be extremely varied. Using medians, planters, bollards, or even parking lanes create better protection between bikes and cars. When lanes are painted green, it shows their city’s commitment to a continuous bike lane, and synchronized signal light timing to limit bike stops are called a “green wave.” For more information, check out the <a href="http://nacto.org/cities-for-cycling/design-guide/">NACTO Urban Bikeway Design Guide</a>.',
        'As bicycling for day-to-day transportation becomes more widespread, planners need to ensure the safety of cyclists, eliminate collisions between bikes and cars, and prevent cars from illegally taking up space designated for bikes. The problem: motorists aren’t always completely aware of cyclists. The solution: make cyclists as visible as possible. And one strategy for this is to make bike lanes a totally different color than the rest of the asphalt.',
        'Although the safety benefits for colored bike lanes have been proven in <a href="http://greenlaneproject.org/stats/#safety">numerous studies</a>, everyone’s got an opinion on <em>which</em> color to use: the Netherlands uses red lanes, Denmark uses blue, and France uses green. The United Kingdom has a mixture of red and green, and most municipalities in the United States ended up going green (by accident: they all just copied each other), though Portland, one of the most bike-friendly cities in the U.S., have been using <a href="http://www.portlandoregon.gov/transportation/article/58842">blue lanes since the 1990s</a>.',
        'No matter which color you like best, the general rule of thumb is to pick something that sticks out and doesn’t look like other lane markings in your area. Beyond that, the more pressing budgetary concern for most cities is maintenance. Right now, the most commonly used type of paint dulls and wears off fairly quickly, although new improvements in paint are starting to make it more durable. But if recurring costs are a significant concern, don’t let that outweigh the safety benefits: you might want to consider an up-front cost in the form of <a href="http://nacto.org/bufferedlane.html‎">protective barriers</a>, instead.'
      ]
    },
    details: {
      'inbound|regular': {
        minWidth: 5,
        graphics: {
          center: [
            IMAGE_IDS['bike-inbound'],
            IMAGE_IDS['arrow-inbound']
          ],
          repeat: [
            IMAGE_IDS['asphalt']
          ]
        }
      },
      'outbound|regular': {
        minWidth: 5,
        graphics: {
          center: [
            IMAGE_IDS['bike-outbound'],
            IMAGE_IDS['arrow-outbound']
          ],
          repeat: [
            IMAGE_IDS['asphalt']
          ]
        }
      },
      'inbound|green': {
        minWidth: 5,
        graphics: {
          center: [
            IMAGE_IDS['bike-inbound'],
            IMAGE_IDS['arrow-inbound']
          ],
          repeat: [
            IMAGE_IDS['asphalt-green']
          ]
        }
      },
      'outbound|green': {
        minWidth: 5,
        graphics: {
          center: [
            IMAGE_IDS['bike-outbound'],
            IMAGE_IDS['arrow-outbound']
          ],
          repeat: [
            IMAGE_IDS['asphalt-green']
          ]
        }
      },
      'inbound|red': {
        minWidth: 5,
        graphics: {
          center: [
            IMAGE_IDS['bike-inbound'],
            IMAGE_IDS['arrow-inbound']
          ],
          repeat: [
            IMAGE_IDS['asphalt-red']
          ]
        }
      },
      'outbound|red': {
        minWidth: 5,
        graphics: {
          center: [
            IMAGE_IDS['bike-outbound'],
            IMAGE_IDS['arrow-outbound']
          ],
          repeat: [
            IMAGE_IDS['asphalt-red']
          ]
        }
      }
    }
  },
  'parking-lane': {
    name: 'Parking lane',
    owner: SEGMENT_OWNER_CAR,
    zIndex: 2,
    defaultWidth: 7,
    variants: ['parking-lane-direction', 'parking-lane-orientation'],
    details: {
      'inbound|left': {
        minWidth: 7,
        maxWidth: 10,
        graphics: {
          left: [
            Object.assign({}, IMAGE_IDS['car-inbound'], { offsetX: -0.75 })
          ],
          repeat: [
            IMAGE_IDS['asphalt']
          ],
          right: [
            IMAGE_IDS['parking-marking-left']
          ]
        }
      },
      'inbound|right': {
        minWidth: 7,
        maxWidth: 10,
        graphics: {
          right: [
            Object.assign({}, IMAGE_IDS['car-inbound'], { offsetX: -1 })
          ],
          repeat: [
            IMAGE_IDS['asphalt']
          ],
          left: [
            IMAGE_IDS['parking-marking-right']
          ]
        }
      },
      'outbound|left': {
        minWidth: 7,
        maxWidth: 10,
        graphics: {
          left: [
            Object.assign({}, IMAGE_IDS['car-outbound'], { offsetX: -0.75 })
          ],
          repeat: [
            IMAGE_IDS['asphalt']
          ],
          right: [
            IMAGE_IDS['parking-marking-left']
          ]
        }
      },
      'outbound|right': {
        minWidth: 7,
        maxWidth: 10,
        graphics: {
          right: [
            Object.assign({}, IMAGE_IDS['car-outbound'], { offsetX: -1 })
          ],
          repeat: [
            IMAGE_IDS['asphalt']
          ],
          left: [
            IMAGE_IDS['parking-marking-right']
          ]
        }
      },
      'sideways|left': {
        name: 'Perpendicular parking',
        minWidth: 14,
        maxWidth: 20,
        graphics: {
          left: [
            IMAGE_IDS['car-perpendicular-left']
          ],
          repeat: [
            IMAGE_IDS['asphalt']
          ]
        }
      },
      'sideways|right': {
        name: 'Perpendicular parking',
        minWidth: 14,
        maxWidth: 20,
        graphics: {
          right: [
            IMAGE_IDS['car-perpendicular-right']
          ],
          repeat: [
            IMAGE_IDS['asphalt']
          ]
        }
      }
    }
  },
  'drive-lane': {
    name: 'Drive lane',
    owner: SEGMENT_OWNER_CAR,
    zIndex: 2,
    defaultWidth: 10,
    variants: ['direction', 'car-type'],
    details: {
      'inbound|car': {
        minWidth: 8,
        maxWidth: 11.9,
        graphics: {
          center: [
            IMAGE_IDS['car-inbound'],
            IMAGE_IDS['arrow-inbound']
          ],
          repeat: [
            IMAGE_IDS['asphalt']
          ]
        }
      },
      'outbound|car': {
        minWidth: 8,
        maxWidth: 11.9,
        graphics: {
          center: [
            IMAGE_IDS['car-outbound'],
            IMAGE_IDS['arrow-outbound']
          ],
          repeat: [
            IMAGE_IDS['asphalt']
          ]
        }
      },
      'inbound|sharrow': {
        name: 'Sharrow',
        minWidth: 12,
        maxWidth: 14,
        defaultWidth: 14,
        description: {
          prompt: 'Learn more about sharrows',
          image: 'sharrow-01.jpg',
          imageCaption: '',
          lede: 'Sharrows are marked travel lanes shared by both cars and bikes.',
          text: [
            'Officially known in transportation planning as “shared lane marking,” sharrows (a portmanteau of “shared” and “arrow”) refer to the arrow markings themselves, but aren’t actually a different <em>type</em> of lane. In many places, bicycles are already allowed on any street meant for cars, and are bound by the same laws.',
            'That being said, it doesn’t take a rocket scientist to see that cars and bikes behave very differently, and so separate bike lanes are <a href="http://dc.streetsblog.org/2013/06/13/in-california-cities-drivers-want-more-bike-lanes-heres-why/">much more preferable</a> for both the safety of cyclists and the sanity of car drivers. But for many cyclists, when there’s not enough road space for those bike lanes, the argument is that sharrows are better than nothing else at all. Motorists tend to forget there are other types of vehicles, and cyclists appreciate any opportunity to remind motorists that they exist and must coexist peacefully together. And giving cyclists more leeway to use the full width of a lane can also protect them from parked cars, in a particular type of accident cyclists call “getting doored.”',
            'Sharrow markings are a simple way to provide more visibility to bicyclists, since paint is cheaper than building a dedicated bike lane, and more politically feasible. However, some research on safety (such as a <a href="http://injuryprevention.bmj.com/content/early/2013/02/13/injuryprev-2012-040561.full.pdf">2012 BMJ study</a> of bicycle injuries in Vancouver and Toronto) indicate that there were slightly increased odds of injury in a shared lane, compared to those in a dedicated bike lane. The moral of the story is, take care of bicyclists by trying to put in a normal bike lane first before resorting to sharrows.'
          ]
        },
        graphics: {
          center: [
            IMAGE_IDS['car-inbound'],
            IMAGE_IDS['bike-inbound-02'],
            IMAGE_IDS['marking-sharrow-inbound']
          ],
          repeat: [
            IMAGE_IDS['asphalt']
          ]
        }
      },
      'outbound|sharrow': {
        name: 'Sharrow',
        minWidth: 12,
        maxWidth: 14,
        defaultWidth: 14,
        description: {
          prompt: 'Learn more about sharrows',
          image: 'sharrow-01.jpg',
          imageCaption: '',
          lede: 'Sharrows are marked travel lanes shared by both cars and bikes.',
          text: [
            'Officially known in transportation planning as “shared lane marking,” sharrows (a portmanteau of “shared” and “arrow”) refer to the arrow markings themselves, but aren’t actually a different <em>type</em> of lane. In many places, bicycles are already allowed on any street meant for cars, and are bound by the same laws.',
            'That being said, it doesn’t take a rocket scientist to see that cars and bikes behave very differently, and so separate bike lanes are <a href="http://dc.streetsblog.org/2013/06/13/in-california-cities-drivers-want-more-bike-lanes-heres-why/">much more preferable</a> for both the safety of cyclists and the sanity of car drivers. But for many cyclists, when there’s not enough road space for those bike lanes, the argument is that sharrows are better than nothing else at all. Motorists tend to forget there are other types of vehicles, and cyclists appreciate any opportunity to remind motorists that they exist and must coexist peacefully together. And giving cyclists more leeway to use the full width of a lane can also protect them from parked cars, in a particular type of accident cyclists call “getting doored.”',
            'Sharrow markings are a simple way to provide more visibility to bicyclists, since paint is cheaper than building a dedicated bike lane, and more politically feasible. However, some research on safety (such as a <a href="http://injuryprevention.bmj.com/content/early/2013/02/13/injuryprev-2012-040561.full.pdf">2012 BMJ study</a> of bicycle injuries in Vancouver and Toronto) indicate that there were slightly increased odds of injury in a shared lane, compared to those in a dedicated bike lane. The moral of the story is, take care of bicyclists by trying to put in a normal bike lane first before resorting to sharrows.'
          ]
        },
        graphics: {
          center: [
            IMAGE_IDS['car-outbound'],
            IMAGE_IDS['bike-outbound-02'],
            IMAGE_IDS['marking-sharrow-outbound']
          ],
          repeat: [
            IMAGE_IDS['asphalt']
          ]
        }
      },
      'inbound|truck': {
        minWidth: 8,
        maxWidth: 11.9,
        graphics: {
          center: [
            IMAGE_IDS['truck-inbound'],
            IMAGE_IDS['arrow-inbound']
          ],
          repeat: [
            IMAGE_IDS['asphalt']
          ]
        }
      },
      'outbound|truck': {
        minWidth: 8,
        maxWidth: 11.9,
        graphics: {
          center: [
            IMAGE_IDS['truck-outbound'],
            IMAGE_IDS['arrow-outbound']
          ],
          repeat: [
            IMAGE_IDS['asphalt']
          ]
        }
      }
    }
  },
  'turn-lane': {
    name: 'Turn lane',
    owner: SEGMENT_OWNER_CAR,
    zIndex: 2,
    defaultWidth: 10,
    variants: ['direction', 'turn-lane-orientation'],
    details: {
      'inbound|left': {
        minWidth: 9,
        maxWidth: 12,
        graphics: {
          center: [
            IMAGE_IDS['car-turn-left-inbound'],
            IMAGE_IDS['arrow-turn-left-inbound']
          ],
          repeat: [
            IMAGE_IDS['asphalt']
          ]
        }
      },
      'inbound|left-straight': {
        minWidth: 9,
        maxWidth: 12,
        graphics: {
          center: [
            IMAGE_IDS['car-turn-left-inbound'],
            IMAGE_IDS['arrow-turn-left-straight-inbound']
          ],
          repeat: [
            IMAGE_IDS['asphalt']
          ]
        }
      },
      'inbound|straight': {
        name: 'No turn lane',
        minWidth: 9,
        maxWidth: 12,
        graphics: {
          center: [
            IMAGE_IDS['car-inbound'],
            IMAGE_IDS['arrow-straight-inbound']
          ],
          repeat: [
            IMAGE_IDS['asphalt']
          ]
        }
      },
      'inbound|right-straight': {
        minWidth: 9,
        maxWidth: 12,
        graphics: {
          center: [
            IMAGE_IDS['car-turn-right-inbound'],
            IMAGE_IDS['arrow-turn-right-straight-inbound']
          ],
          repeat: [
            IMAGE_IDS['asphalt']
          ]
        }
      },
      'inbound|right': {
        minWidth: 9,
        maxWidth: 12,
        graphics: {
          center: [
            IMAGE_IDS['car-turn-right-inbound'],
            IMAGE_IDS['arrow-turn-right-inbound']
          ],
          repeat: [
            IMAGE_IDS['asphalt']
          ]
        }
      },
      'inbound|both': {
        minWidth: 9,
        maxWidth: 12,
        graphics: {
          center: [
            IMAGE_IDS['car-turn-left-inbound'],
            IMAGE_IDS['arrow-turn-both-inbound']
          ],
          repeat: [
            IMAGE_IDS['asphalt']
          ]
        }
      },
      'inbound|shared': {
        name: 'Center turn lane',
        minWidth: 9,
        maxWidth: 12,
        graphics: {
          center: [
            IMAGE_IDS['arrow-turn-shared-inbound']
          ],
          repeat: [
            IMAGE_IDS['asphalt']
          ],
          left: [
            IMAGE_IDS['center-turn-marking-left']
          ],
          right: [
            IMAGE_IDS['center-turn-marking-right']
          ]
        }
      },
      'outbound|left': {
        minWidth: 9,
        maxWidth: 12,
        graphics: {
          center: [
            IMAGE_IDS['car-turn-left-outbound'],
            IMAGE_IDS['arrow-turn-left-outbound']
          ],
          repeat: [
            IMAGE_IDS['asphalt']
          ]
        }
      },
      'outbound|left-straight': {
        minWidth: 9,
        maxWidth: 12,
        graphics: {
          center: [
            IMAGE_IDS['car-turn-left-outbound'],
            IMAGE_IDS['arrow-turn-left-straight-outbound']
          ],
          repeat: [
            IMAGE_IDS['asphalt']
          ]
        }
      },
      'outbound|straight': {
        name: 'No turn lane',
        minWidth: 9,
        maxWidth: 12,
        graphics: {
          center: [
            IMAGE_IDS['car-outbound'],
            IMAGE_IDS['arrow-straight-outbound']
          ],
          repeat: [
            IMAGE_IDS['asphalt']
          ]
        }
      },
      'outbound|right-straight': {
        minWidth: 9,
        maxWidth: 12,
        graphics: {
          center: [
            IMAGE_IDS['car-turn-right-outbound'],
            IMAGE_IDS['arrow-turn-right-straight-outbound']
          ],
          repeat: [
            IMAGE_IDS['asphalt']
          ]
        }
      },
      'outbound|right': {
        minWidth: 9,
        maxWidth: 12,
        graphics: {
          center: [
            IMAGE_IDS['car-turn-right-outbound'],
            IMAGE_IDS['arrow-turn-right-outbound']
          ],
          repeat: [
            IMAGE_IDS['asphalt']
          ]
        }
      },
      'outbound|both': {
        minWidth: 9,
        maxWidth: 12,
        graphics: {
          center: [
            IMAGE_IDS['car-turn-left-outbound'],
            IMAGE_IDS['arrow-turn-both-outbound']
          ],
          repeat: [
            IMAGE_IDS['asphalt']
          ]
        }
      },
      'outbound|shared': {
        name: 'Center turn lane',
        minWidth: 10,
        maxWidth: 16,
        defaultWidth: 12,
        graphics: {
          center: [
            IMAGE_IDS['arrow-turn-shared-outbound']
          ],
          repeat: [
            IMAGE_IDS['asphalt']
          ],
          left: [
            IMAGE_IDS['center-turn-marking-left']
          ],
          right: [
            IMAGE_IDS['center-turn-marking-right']
          ]
        }
      }
    }
  },
  'bus-lane': {
    name: 'Bus lane',
    owner: SEGMENT_OWNER_PUBLIC_TRANSIT,
    zIndex: 2,
    defaultWidth: 12,
    variants: ['direction', 'bus-asphalt'],
    details: {
      'inbound|regular': {
        minWidth: 10,
        maxWidth: 13,
        graphics: {
          center: [
            IMAGE_IDS['bus-inbound'],
            IMAGE_IDS['arrow-inbound']
          ],
          repeat: [
            IMAGE_IDS['asphalt']
          ]
        }
      },
      'outbound|regular': {
        minWidth: 10,
        maxWidth: 13,
        graphics: {
          center: [
            IMAGE_IDS['bus-outbound'],
            IMAGE_IDS['arrow-outbound']
          ],
          repeat: [
            IMAGE_IDS['asphalt']
          ]
        }
      },
      'inbound|colored': {
        minWidth: 10,
        maxWidth: 13,
        graphics: {
          center: [
            IMAGE_IDS['bus-inbound'],
            IMAGE_IDS['arrow-inbound']
          ],
          repeat: [
            IMAGE_IDS['asphalt-red']
          ]
        }
      },
      'outbound|colored': {
        minWidth: 10,
        maxWidth: 13,
        graphics: {
          center: [
            IMAGE_IDS['bus-outbound'],
            IMAGE_IDS['arrow-outbound']
          ],
          repeat: [
            IMAGE_IDS['asphalt-red']
          ]
        }
      },
      'inbound|shared': {
        name: 'Shared bus/bike lane',
        minWidth: 12,
        maxWidth: 14,
        defaultWidth: 14,
        graphics: {
          center: [
            IMAGE_IDS['bus-inbound'],
            Object.assign({}, IMAGE_IDS['bike-inbound-02'], { offsetX: 1 }),
            IMAGE_IDS['marking-sharrow-inbound']
          ],
          repeat: [
            IMAGE_IDS['asphalt']
          ],
          left: [
            IMAGE_IDS['marking-left']
          ],
          right: [
            IMAGE_IDS['marking-right']
          ]
        }
      },
      'outbound|shared': {
        name: 'Shared bus/bike lane',
        minWidth: 12,
        maxWidth: 14,
        defaultWidth: 14,
        graphics: {
          center: [
            IMAGE_IDS['bus-outbound'],
            Object.assign({}, IMAGE_IDS['bike-outbound-02'], { offsetX: -1 }),
            IMAGE_IDS['marking-sharrow-outbound']
          ],
          repeat: [
            IMAGE_IDS['asphalt']
          ],
          left: [
            IMAGE_IDS['marking-left']
          ],
          right: [
            IMAGE_IDS['marking-right']
          ]
        }
      }
    }
  },
  'streetcar': {
    name: 'Streetcar',
    owner: SEGMENT_OWNER_PUBLIC_TRANSIT,
    zIndex: 2,
    defaultWidth: 12,
    variants: ['direction', 'public-transit-asphalt'],
    details: {
      'inbound|regular': {
        minWidth: 10,
        maxWidth: 14,
        graphics: {
          center: [
            IMAGE_IDS['streetcar-track-01'],
            IMAGE_IDS['streetcar-inbound'],
            IMAGE_IDS['arrow-inbound']
          ],
          repeat: [
            IMAGE_IDS['asphalt']
          ]
        }
      },
      'outbound|regular': {
        minWidth: 10,
        maxWidth: 14,
        graphics: {
          center: [
            IMAGE_IDS['streetcar-track-01'],
            IMAGE_IDS['streetcar-outbound'],
            IMAGE_IDS['arrow-outbound']
          ],
          repeat: [
            IMAGE_IDS['asphalt']
          ]
        }
      },
      'inbound|colored': {
        minWidth: 10,
        maxWidth: 14,
        graphics: {
          center: [
            IMAGE_IDS['streetcar-track-02'],
            IMAGE_IDS['streetcar-inbound'],
            IMAGE_IDS['arrow-inbound']
          ],
          repeat: [
            IMAGE_IDS['asphalt-red']
          ]
        }
      },
      'outbound|colored': {
        minWidth: 10,
        maxWidth: 14,
        graphics: {
          center: [
            IMAGE_IDS['streetcar-track-02'],
            IMAGE_IDS['streetcar-outbound'],
            IMAGE_IDS['arrow-outbound']
          ],
          repeat: [
            IMAGE_IDS['asphalt-red']
          ]
        }
      }
    }
  },
  'light-rail': {
    name: 'Light rail',
    owner: SEGMENT_OWNER_PUBLIC_TRANSIT,
    zIndex: 2,
    defaultWidth: 12,
    variants: ['direction', 'public-transit-asphalt'],
    details: {
      'inbound|regular': {
        minWidth: 10,
        maxWidth: 14,
        graphics: {
          center: [
            IMAGE_IDS['light-rail-inbound'],
            IMAGE_IDS['streetcar-track-02'],
            IMAGE_IDS['dark-arrow-inbound']
          ],
          repeat: [
            IMAGE_IDS['concrete-gray-lower']
          ]
        }
      },
      'outbound|regular': {
        minWidth: 10,
        maxWidth: 14,
        graphics: {
          center: [
            IMAGE_IDS['light-rail-outbound'],
            IMAGE_IDS['streetcar-track-02'],
            IMAGE_IDS['dark-arrow-outbound']
          ],
          repeat: [
            IMAGE_IDS['concrete-gray-lower']
          ]
        }
      },
      'inbound|colored': {
        minWidth: 10,
        maxWidth: 14,
        graphics: {
          center: [
            IMAGE_IDS['light-rail-inbound'],
            IMAGE_IDS['streetcar-track-02'],
            IMAGE_IDS['dark-arrow-inbound']
          ],
          repeat: [
            IMAGE_IDS['asphalt-red']
          ]
        }
      },
      'outbound|colored': {
        minWidth: 10,
        maxWidth: 14,
        graphics: {
          center: [
            IMAGE_IDS['light-rail-outbound'],
            IMAGE_IDS['streetcar-track-02'],
            IMAGE_IDS['dark-arrow-outbound']
          ],
          repeat: [
            IMAGE_IDS['asphalt-red']
          ]
        }
      }
    }
  },
  'transit-shelter': {
    name: 'Transit shelter',
    owner: SEGMENT_OWNER_PUBLIC_TRANSIT,
    zIndex: 2,
    defaultWidth: 9,
    variants: ['orientation', 'transit-shelter-elevation'],
    paletteIcon: 'right|light-rail',
    details: {
      'left|street-level': {
        minWidth: 9,
        graphics: {
          left: [
            IMAGE_IDS['transit-shelter-left']
          ],
          repeat: [
            IMAGE_IDS['concrete']
          ]
        }
      },
      'right|street-level': {
        minWidth: 9,
        graphics: {
          right: [
            IMAGE_IDS['transit-shelter-right']
          ],
          repeat: [
            IMAGE_IDS['concrete']
          ]
        }
      },
      'left|light-rail': {
        minWidth: 8,
        description: {
          prompt: 'Learn more about elevated transit shelters',
          image: 'transit-station-elevated.jpg',
          imageCaption: '',
          lede: 'Elevated shelters serve light rail and bus rapid transit stops.',
          text: [
            'For some light rail systems, and bus rapid transit (BRT) systems where speed of service is a huge priority, an elevated shelter does the trick. It allows patrons to board at the same level as the bus, which speeds up the boarding process (especially for wheelchairs and others with access needs) and shaves crucial seconds off the routes time, all of which add up over time.',
            'Because of this focus on efficiency, transit vehicles that use elevated platforms are also usually in their own dedicated lanes, so these platforms are placed where they can access these lanes easily, usually in the median.  If placed inbetween lanes going in opposite directions, they can easily serve passengers on both sides of the platform (and you’ll need to place two of them in Streetmix).',
            'Elevated shelters are also sometimes designed like heavy rail train stations, enclosed or with a roof to protect passengers from the elements, and are handy visual beacons of public transit on a busy boulevard. But compared with shelters that are at curb height, they tend to be more expensive pieces of infrastructure and take up more space with of wheelchair ramps. This makes it more difficult for BRT services to be provided with as much flexibility as a normal bus service. Furthermore, with low-floor buses becoming increasingly more common, it starts to reduce the need to have higher platforms.'
          ]
        },
        graphics: {
          left: [
            IMAGE_IDS['transit-shelter-elevated-left']
          ],
          repeat: [
            IMAGE_IDS['concrete-raised'] // Raised concrete
          ]
        }
      },
      'right|light-rail': {
        minWidth: 8,
        description: {
          prompt: 'Learn more about elevated transit shelters',
          image: 'transit-station-elevated.jpg',
          imageCaption: '',
          lede: 'Elevated shelters serve light rail and bus rapid transit stops.',
          text: [
            'For some light rail systems, and bus rapid transit (BRT) systems where speed of service is a huge priority, an elevated shelter does the trick. It allows patrons to board at the same level as the bus, which speeds up the boarding process (especially for wheelchairs and others with access needs) and shaves crucial seconds off the routes time, all of which add up over time.',
            'Because of this focus on efficiency, transit vehicles that use elevated platforms are also usually in their own dedicated lanes, so these platforms are placed where they can access these lanes easily, usually in the median.  If placed inbetween lanes going in opposite directions, they can easily serve passengers on both sides of the platform (and you’ll need to place two of them in Streetmix).',
            'Elevated shelters are also sometimes designed like heavy rail train stations, enclosed or with a roof to protect passengers from the elements, and are handy visual beacons of public transit on a busy boulevard. But compared with shelters that are at curb height, they tend to be more expensive pieces of infrastructure and take up more space with of wheelchair ramps. This makes it more difficult for BRT services to be provided with as much flexibility as a normal bus service. Furthermore, with low-floor buses becoming increasingly more common, it starts to reduce the need to have higher platforms.'
          ]
        },
        graphics: {
          right: [
            IMAGE_IDS['transit-shelter-elevated-right']
          ],
          repeat: [
            IMAGE_IDS['concrete-raised'] // Raised concrete
          ]
        }
      }
    }
  },
  'train': {
    name: '“Inception” train',
    owner: SEGMENT_OWNER_PUBLIC_TRANSIT,
    zIndex: 1,
    defaultWidth: 14,
    variants: [''],
    enableWithFlag: 'SEGMENT_INCEPTION_TRAIN',
    description: {
      image: 'train.jpg',
      imageCaption: '',
      lede: 'It’s the train from <em>Inception.</em>',
      text: [
        'What more do you need to know?'
      ]
    },
    details: {
      '': {
        minWidth: 14,
        graphics: {
          center: [
            IMAGE_IDS['inception-train']
          ],
          repeat: [
            IMAGE_IDS['asphalt']
          ]
        }
      }
    }
  }
}
