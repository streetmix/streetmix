.. _content-styleguide:

Content styleguide
==================

Streetmix is a tool for communication and collaboration, so the way we write and present content should facilitate those goals. This is a reference that will continue to grow as needed. When you run into a situation that isn't covered here, refer to the very excellent `18F Content Guide`_.

.. _18F Content Guide: https://content-guide.18f.gov/


Basic guidelines
----------------

- Use plain language and simple sentence structure.
- Be funny or friendly, but:
- Choose clarity over cleverness.
- Avoid technical or industry-specific jargon.
- Content isn't frozen in time. Always be refining. As we learn, we change and adapt.


User interface
--------------

.. _sentence-case:

Sentence case
+++++++++++++

When writing standalone text such as titles, labels, or headings, `use sentence case <https://medium.design/a-thorough-detailed-comprehensive-methodical-guide-to-capitalizing-strings-in-our-user-interface-11b39da146f3>`_. With sentence case, capitalize the first letter of a phrase, but leave all other words in lowercase, unless they would normally require capitalization, such as proper nouns.

Avoid title case (Where Each Word Is Capitalized, Like This), or uppercase (SUCH AS THIS). `These approaches are harder to read than sentence case <https://medium.com/@jsaito/making-a-case-for-letter-case-19d09f653c98>`_.


Technical writing
-----------------

People have different levels of expertise
+++++++++++++++++++++++++++++++++++++++++

Avoid using the words "simply" or "just" when writing instructions. 

**Don’t write this:**

  Simply install your packages by typing ``npm install``.

What may be second nature for you may be foreign to another person. These instructions are missing additional information for a less experienced developer: Where would you type this? What is ``npm``? What happens if the command doesn’t work?

At the same time, instructions should be short and to-the-point, so we would not strive to add context to every instruction. We should state the instruction but not create a value judgment about its relative ease.

**Instead, write this:**

  Install your packages by typing ``npm install``.

Those are not the only two words to avoid. For more, read `Words To Avoid in Educational Writing <https://css-tricks.com/words-avoid-educational-writing/>`_ from CSS Tricks.

Specific words and phrases
--------------------------

- **Streetmix** is one word, and the middle **m** is always lowercase.
- **Code for America** can be abbreviated **CfA**, after the full name has been mentioned at least once.
- **GitHub** always capitalizes its middle **H**.
- **NEW INC** is always in uppercase.
- **open source** is never hyphenated.
- **email** is one word. Do not hyphenate or capitalize (unless at the start of a sentence).
- The URL to our website is **https://streetmix.net/**, which uses the more secure **https** protocol, and does not have the ``www.`` prefix before the domain name.

.. attention::

   Additional guidance for text used in the Streetmix interface that are not likely to occur elsewhere in our written content will be provided in our translation system.


Typography
----------

Consistent typography, based on standard practices in the typography industry, is another aspect of how we pay close attention to detail within the Streetmix project.

- Use `curly quotes instead of straight quotes <https://practicaltypography.com/straight-and-curly-quotes.html>`_.
- Use the `ellipses character <https://practicaltypography.com/ellipses.html>`_ ``…`` rather than a series of periods.
- Use the `en dash and em dash <https://practicaltypography.com/hyphens-and-dashes.html>`_ characters appropriately.
- There’s `only one space after a period <https://slate.com/technology/2011/01/two-spaces-after-a-period-why-you-should-never-ever-do-it.html>`_, never two.

Typography practices may differ between languages and cultures. For instance, in Chinese, periods use a small circle ``。`` instead of a small dot, and ellipses are written as six dots (two ellipses characters side by side) ``……``, but in computer UI, the ellipses in menu items remain the single ellipses character. When working on translations of Streetmix, cultural and contextual differences in typography should be considered by translators and should be consistent throughout the application.


Units of measurement
--------------------

By default, use the metric system. We support the imperial system only in the United States for users who are more familiar with it.

.. note::

   When writing distances in the imperial system, `feet and inches <https://practicaltypography.com/foot-and-inch-marks.html>`_ should use the prime ``′`` and double prime ``″`` marks respectively, instead of the straight quotes ``'`` and ``"``. When processing input, both quote and prime marks should be accepted as valid.


Distance
++++++++

For distance measurements, `include a space between the quantity and unit <https://www.nist.gov/pml/weights-and-measures/writing-metric-units>`_. For example, fifty meters should be expressed as ``50 m``, not ``50m``.


Vernacular exceptions
~~~~~~~~~~~~~~~~~~~~~

- In **Russian**, the Cyrillic ``м`` is more commonly used instead of ``m``.
- In **Arabic**, the Arabic letter ``م`` `is more commonly used <https://en.wikipedia.org/wiki/Modern_Arabic_mathematical_notation#Mathematical_constants_and_units>`_ instead of ``m``, and measurements remain in the right-to-left content direction.

