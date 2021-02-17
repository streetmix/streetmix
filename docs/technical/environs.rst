Environs definitions
====================

.. attention::

   This page is a work in progress. This is a draft specification of Streetmix's forthcoming environs feature. The schema and structure described here is subject to change.

**Environs** is a setting that allows uers to change the "environment" that a street is in, which can include elements like time of day, weather, and background. In the UI, we prefer to use the term *environment*. Internally, we use *environs* to prevent confusion with the computing term *developer environment*.

Environs definitions are contained in :file:`environs.json`. You can browse the `current environs definitions here <https://github.com/streetmix/streetmix/blob/main/assets/scripts/streets/environs.json>`_.

environs.json schema
--------------------

The definitions file exports a single JavaScript object, containing a keyed collection of environs definitions. The key is the identifier for the environs, and the value is an object with the following properties:

``name``
  **Required.** A string that is the English-locale display name for the environs. *Note: we have not yet determined a method for retrieving translated names in other locales.*

  .. code-block:: javascript

    "name": "Night"


``enabled``
  **Optional.** A boolean value, which determines whether the environs is available for the user to choose.  If this property is not set, its default value is ``true``. If set to ``false``, the environs will not be accessible in the UI. However, streets that have already been set to a disabled environs may still render that environs.

  .. code-block:: javascript

    "enabled": false

  .. note::

    We use ``enabled`` as the property name instead of ``disabled`` because code such as ``if (environs.enabled)`` is easier to read than ``if (!environs.disabled)``, which uses a double negative. It is also easier to use read and use filters in this way.


``iconImage``
  **Optional**. A string that refers to a custom icon image to be used when displaying a graphic icon for the environs. The image is retrieved from the application's image cache. If this property is not defined, no custom image will be displayed.

  .. code-block:: javascript

    "iconImage": "environs--icon-night"


``backgroundImage``
  **Optional**. A string that refers to an image that is displayed in the background of the street. The image is retrieved from the application's image cache. If this property is not defined, no background image will be displayed. Background images display at 1:1 pixel scale and will be tiled to repeat in all directions.

  .. code-block:: javascript

    "backgroundImage": "sky--stars"


``backgroundGradient``
  **Optional**. An array of CSS colors that create a linear gradient corresponding to the `CSS gradients <https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Images/Using_CSS_gradients>`_ specification. Linear gradients specified in this way will always be rendered top-to-bottom.

  Each item in the array may be a string that is a CSS color:

  .. code-block:: javascript

    "backgroundGradient": [
      "#01051600", "#01081777", "#031641", "#061c45"
    ]

  ...or, each item may be an array, where the first item is the CSS color string and the second item is a stop value:

  .. code-block:: javascript

    "backgroundGradient": [
      ["#01051600", 0],
      ["#01081777", 0.33],
      ["#031641", 0.66],
      ["#061c45", 1]
    ]

  Mixing and matching item types is permitted. Array items can optionally omit the second item (the stop value). If a stop value is not provided, the transition between each step will be interpolated by the browser.

  .. code-block:: javascript

    "backgroundGradient": [
      ["#01051600", 0],
      ["#01081777"],
      "#031641",
      ["#061c45", 1]
    ]

  Any `valid CSS value <https://developer.mozilla.org/en-US/docs/Web/CSS/color>`_ is permitted, including RGBA definitions and keywords.

  .. code-block:: javascript

    "backgroundGradient": [
      ["rgba(255,255,255,0.85)", 0],
      ["rgba(192,192,192,0.5)", 0.85],
      ["transparent", 1]
    ]

  If the gradient has any transparency, the ``backgroundColor`` property, if defined, will be underneath the transparent colors. If ``backgroundColor`` is not defined, the underlying color will be the page background. We do not recommend relying on the page background as the underlying color.


``backgroundColor``
  **Optional**. A string of a CSS color which is a solid background color. We always recommend setting a background color, even if a non-transparent background gradient or a background image is specified, which allows it to be used as a fallback color, just in case.

  .. code-block:: javascript

    "backgroundColor": "#000928"


``backgroundObjects``
  **Optional**. An array of objects, defining images to be displayed in the background. Each object has five required properties:

  ``image``
    A string, referring to an image in the application image cache.

  ``width``
    A number, specifying in CSS pixels the width to display the image.

  ``height``
    A number, specifying in CSS pixels the height to display the image.

  ``top``
    A number between 0 and 1, specifying the relative vertical position of the image in the background. A value of 0 is at the top of the background, and a value of 1 is at the bottom.

  ``left``
    A number between 0 and 1, specifying the relative horizontal position of the image in the background. A value of 0 is at the left side of the background, and a value of 1 is at the right.

  Images that cannot be retrieved from the cache will not be displayed.

  .. code-block:: javascript

    "backgroundObjects": [
      {
        "image": "sky--moon",
        "width": 116,
        "height": 116,
        "top": 0.2,
        "left": 0.8
      }
    ]


``foregroundGradient``
  **Optional.** This works exactly the same as ``backgroundGradient`` (see above), but creates a gradient that overlays street elements, such as buildings and vehicles. We recommend setting ``transparent`` as the final value so that the overlay fades away smoothly.

  .. code-block:: javascript

    "foregroundGradient": [
      ["rgba(255,255,255,0.85)", 0],
      ["rgba(192,192,192,0.5)", 0.85],
      ["transparent", 1]
    ]

``cloudOpacity``
  **Optional**. A number between 0 and 1, specifying the opacity of the clouds that are normally displayed in the background. The default value is 1. A value of 0 will make the clouds invisible.

  .. code-block:: javascript

    "cloudOpacity": 0.2


``invertUITextColor``
  **Optional.** A boolean value, which if ``true``, will invert the color of any text that exists on top of the background. The exact implementation of color inversion may differ between UI components. Please set this to true if you have a dark-colored background, and choose the value that creates the best contrast according to `WCAG 2.0 guidelines on contrast ratio <https://contrast-ratio.com>`_. Also, please be aware the viewport heights differ between devices, and that backgrounds will be "compressed" to fit the vertical height of the viewport. Backgrounds that change from light to dark (so that contrast ratio varies greatly depending on the viewport size) is not recommended.

  .. code-block:: javascript

    "invertUITextColor": true


All other properties are ignored. However, additional properties may be defined in the future. We recommend using undefined properties as comments and prefixing comment properties with ``_comment``, for example:

  .. code-block:: javascript

    "_commentBackgroundColor": "This is a comment about the background color."

