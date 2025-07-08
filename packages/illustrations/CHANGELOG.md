# v2.3.0 (in progress)

- Add sand ground texture
- Add beach lounger
- Optimize buildings for metric units
- Slightly increase the depth of "narrow" buildings.

# v2.2.0

- Moved `environs` icons into the `sky` namespace.

# v2.1.2 - v2.1.3

- Move package location to Streetmix repository (under `/packages`).
- Update `repository` metadata for `package.json`.
- This is an organizational change only; no developer- or user-facing changes.

# v2.1.1

- Minor fix: npm no longer warns on Node.js engines greater than v16

# v2.1.0

- Add biker stress effects
- Add street vendors
- Add drainage channel
- Add compound wall
- Add alternative bus art (for background)

# v2.0.0

- See below.

# v2.0.0-alpha

- **BREAKING!** Segment illustrations have been been converted to metric scale. (See [issue #13](https://github.com/streetmix/illustrations/issues/13)) for details and migration notes.
- **BREAKING:** The `ground/concrete-raised` asset is removed, and all ground textures have been resized to 100x100.
- Add center lane marking

# v1.1.0

- Quality of life tweaks and fixes to the food truck:
  - Window reflection for the left food truck flipped in the right direction
  - Darker shade of window reflection lightened to match other windows
  - Slightly shorter height of food truck patron
  - Alternate "skin" for the left side food truck patron

# v1.0.1

- Fix: left/right/straight turn arrows were previously in rough draft form
- Fix: file name of European-style arcade buildings to match building defintions

# v1.0.0

- **Breaking:** No longer compiles a bundled svg
- Add outbound autonomous vehicle
- Add Junebug and Johnny motorbike vehicle and pedestrians
- Add left/right/straight turn arrow
- Add multicoloured flowers
  - **Breaking:** Old generic "flowers" id removed
- Add European-style building type
- Add autonomous shuttle
- Add double decker bus
- Add microvan (aka "kei" cars)
- Add bus rapid transit station and bus
- Update moon illustration to better fit artistic direction
- Add holodeck grid background
- Add custom icons for environs selector UI
- Update swatches:
  - Add GIMP GPL palette format.
  - Update Adobe Swatch Exchange (ASE) format.

# v0.9.0

- Add autonomous vehicle
- Add magic carpet

# v0.8.1

- Fix: revert a change to build system that caused images to have incorrect ids

# v0.8.0

- The construction update:
  - Traffic cone: increase size for legibility, remove hole "shadow"
  - Jersey barrier (plastic): replace reflective bulb
  - Jersey barrier (concrete): adjust colors
  - all (including barrier): svg viewbox dimensions are shorter

# v0.7.2

- Scooters: add kickstand, update "logo" shape

# v0.7.1

- Properly remove \*.afdesign files from distro

# v0.7.0

- Add moon artwork
- Lane markings have been extended so that they can work at curb height
- Added "half-height" lane markings and a horizontal marking
- Update dependencies
- Streamline package contents for distribution

# v0.6.0

- Scooters: add final scooters

# v0.6.0-alpha1

- Utility pole: more tweaks
- Scooters: add first draft of scooters
- Sky: add updated cloud assets
- Stars: add new stars background

# v0.5.1

- Utility pole: tweaks

# v0.5.0

- Add utility pole
- (bug) fix missing side mirrors on outbound taxi and rideshare vehicles

# v0.4.1

- (bug) fix broken curb images

# v0.4.0

- Add bikeshare station
- Add taxi pickup
- Add rideshare pickup
- Add food truck
- Add curbside waiting area
- Update dependencies

# v0.3.8

- Add angled parking sprites

# v0.3.7

- Add a new image for **missing** sprites

# v0.3.6

- Light rail (outbound): remove image definition inside of SVG

# v0.3.5

- Apartment and residential buildings: adjust viewboxes, fix inprecise pixel alignments and colors
- Biker: align center of wheel with center of sprite viewbox
- Inception train: align wheels with center of sprite viewbox

# v0.3.4

- Light rail: fix geometry at top left of sprite; align wheels with track
- Raised transit shelter: fix incorrect shade of green
- Tree: align trunk with center of sprite
- Fenced lot: add dirt
- Grass lot: add new sprite

# v0.3.3

- Add arrow and sharrow markings

# v0.3.2

- Add ground textures
- Add lane marking sprites (lane dividers, parking, diagonal stripes)
- Add streetcar tracks
- Revise car sprites to use narrower viewboxes (same width as how they were originally defined in raster sprites)

# v0.3.1

- Swap left/right designation of modern lamp and pride banner (they were flipped before)
- Extend grass texture to be flush with edges and raise its height to better match original tilesheet
- Added vectorized sky images
