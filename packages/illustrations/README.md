# Streetmix illustrations

This is the canonical source of illustration assets for Streetmix.

These images were converted to SVG from original source illustrations in Adobe Illustrator. Currently the source vector files are in [Affinity Designer](https://affinity.serif.com/) format, which has a really smooth workflow for designing vector images, including pixel preview, and lets you place nodes much more precisely than you can in Illustrator. Plus, its SVG export is really clean and minimal, and the source files are an order of magnitude less space consuming than Illustrator files. The Affinity Designer source files are currently checked into this repository.

## Styleguide

**For design guidelines and colors see the [Illustration guide](https://docs.streetmix.net/contributing/illustrations/overview).**

- Swatches are provided in Adobe Swatch Exchange (ASE) format in the `swatches` folder. ASE files can be imported to Illustrator and Affinity Designer.
- We've also added a palette in the GIMP GPL format, which is compatible with open source image editors (e.g. GIMP, Inkscape, Krita).

## Technical guidelines and notes

- **Scale.** Illustrations use a scale of 1 pixel = 1 centimeter.
- **Layers and grouping.**
  - You are encouraged to group like shapes together to organize them.
  - If a file contains multiple sprites, put each sprite on its own layer, and name it with an ID (similar to HTML ids - `lower-case-with-dashes` (no spaces, no Sentence case or Title Case, no camelCase, no under_scores)
- **Exporting.**
  - From Affinity Designer, export one layer at a time using default SVG export options. You will not need to worry about compressing the SVG. Streetmix uses a pipeline that runs [SVGO](https://github.com/svg/svgo) and bundles SVGs automatically.
- **Avoid raw text.** Text will not render correctly if it depends on a system font. If text is required, make sure to convert the text to shapes first. However, please keep in mind our illustration guidelines, which discourage text in illustrations because it cannot be localized.
- **Avoid embedded raster images.** These are not only very large, but they will not render on the canvas in Firefox.
- **Expand strokes.** Strokes do not scale, so refrain from including shapes with strokes. If outlines are required, expand them to shapes first.
- **Simplify shapes.** Shapes with an excess number of nodes increase file size and loading times. Make sure "simple" looking shapes do not have extra nodes that aren't needed. Combining overlapping polygons of the same color also saves space.
- **Close all shapes.** If a shape does not have a properly closed path, the fill may not appear properly.
- **Keep masks to a minimum.** Masks are sometimes necessary to create some effects, but avoid using more than necessary.

### Troubleshooting

**canvas `drawImage` fails with a "NS_ERROR_NOT_AVAILABLE: Component is not available @ file" error in Firefox**

Check the SVG contents to see if it contains a bitmap `<image>` tag. If so, remove it and try again.

### Note about sky files

Opening them in Affinity Design and then saving it back out at SVG seems to affect the gradient tinting in a bad way. Don't do it.

## Other artwork

- [Icons](https://github.com/streetmix/icons)

## Credits

- **Art direction** Katie Lewis (@katielewis) - Cars, bus, streetcar, mixed use apartment buildings, people, trees, plants, modern lamp post, bikes, bike racks, bicyclists, parklet variant, flex zone items
- **Contributors**
  - Marcin Wichary (@mwichary) - light rail, truck, additional people and bicyclists, icons and road markings
  - Lou Huang (@louh) - parklet, traditional lamp post, parking lot, single family residence, NYC wayfinding pylons, Inception train, waterfront, construction items, bus shelters, bollard and dome
  - Doneliza Joaquin (@djoaquin) - fenced lot
  - [Jon Reese](https://jonreese.com) - vectorized sky and lane markings
  - Brian Wamsley (Hamilton County Planning and Development Department) - utility pole (prototype)
  - Claudio Olivares Medina - autonomous vehicle, magic carpet, bus rapid transit
  - Enrico Ferreguti - European-style arcade buildings

## License

![Creative Commons License](https://i.creativecommons.org/l/by/4.0/88x31.png)

This work is licensed under a [Attribution-ShareAlike 4.0 International (CC BY-SA 4.0) License](https://creativecommons.org/licenses/by-sa/4.0/).

More on [licensing](https://docs.streetmix.net/user-guide/support/faq#what-is-the-end-user-license).
