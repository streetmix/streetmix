Icons
=====

General user interface icons
----------------------------

Most user interface icons are stock icons from `Font Awesome <https://fontawesome.com/>`_. We do not have a license to Font Awesome, so we stay within their "free" icon selection.

Icons generally should not be used on their own. They should have a text label for readability. Icons with much less chance of being misinterpreted have more leeway to be used without a text label.


Streetmix segment icons
-----------------------

We've created custom icons to select between different variants of street segments (for instance, inbound or outbound lanes). The source files for these icons are in SVG and are located in :file:`/assets/images/icons`.

Working with icons
++++++++++++++++++

These are our guidelines for icons:

- SVGs are made individually. Do not use layers or symbols to store multiple icons within the same SVG file.
- Use a viewbox of 48x48.
- Do not use strokes, only fills.
- Outline (or expand) all text. Do not use font rendering.
- Use black as fill color unless the icon should default to another color. If an icon might exist in Streetmix as different colored versions (see the asphalt icon for example) we can use the CSS :code:`fill` property to re-use a single icon with different colors.
- Clip paths break in Internet Explorer. This is `a known bug <https://connect.microsoft.com/IE/feedback/details/734107/svg-elements-under-clip-path-fail-to-show-until-refresh>`_ with no apparent fix in sight. To work around this, crop and subtract paths instead of clipping them.

Build pipeline
++++++++++++++

All the current SVGs are exported from Affinity Designer. They have a very easy to use exporter that doesn't insert a lot of the extra meta-gunk that Adobe Illustrator does. This file is located at :file:`/assets/images/icons/icons.afdesign`.

If you don't have Affinity Designer or would rather use Adobe Illustrator or another vector file editor, the actual software used to create or export the SVGs are no longer as important, since we also minify these icons during Streetmix application's start-up process. Icons are compiled into a single, compressed :file:`icons.svg` file. Streetmix does not use the raw, source SVG files.

Here are some tips when exporting from Affinity Designer (which can also be relevant to your application of choice):

- Use the :guilabel:`SVG (for web)` preset, which flattens transforms for even cleaner output
- Use the :guilabel:`Whole document` area (turning off other layers), which preserves the square viewbox

Other resources
+++++++++++++++

- `SVG \`symbol\` a Good Choice for Icons <http://css-tricks.com/svg-symbol-good-choice-icons/>`_ [CSS Tricks]

