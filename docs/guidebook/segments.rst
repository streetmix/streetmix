Segments
========

.. warning::

   This section is a work in progress. It has been ported from an older document and is very many years out of date.


.. note::

   We may rename "segments" to something else, e.g. "slices."


Notes on street segments. `See Issue #7 for discussion around more street segments. <https://github.com/codeforamerica/streetmix/issues/7>`__

Automobile / Drive lanes
------------------------

Typical drive lane
~~~~~~~~~~~~~~~~~~

-  **Subtypes:** Inbound, outbound
-  **Default width:** 10 ft (3.0m)
-  **Minimum width:** 9 ft (2.7m)
-  **Maximum width:** 12 ft (3.6m)
-  **References:**

   -  `AASHTO 2001 Green Book - Chapter 4 - Lane
      Widths <https://gist.github.com/louh/9ed5e8585878db8034c6>`__ (pp
      315-316)
   -  `NCHRP Report 500, Volume 10: A Guide for Reducing
      Collisions Involving
      Pedestrians <http://onlinepubs.trb.org/onlinepubs/nchrp/nchrp_rpt_500v10.pdf>`__
      - section V-48
   -  `ITE Designing Walkable Urban
      Thoroughfares <http://www.ite.org/emodules/scriptcontent/orders/ProductDetail.cfm?pc=RP-036A-E>`__
      (2010)
   -  `Walkable
      City <https://gist.github.com/louh/921ca2e36cf2a7e5df49/raw/c720c5170bd6534a07d4b7b73ac588b3dc56d4fa/Walkable+City+-+Multilane+roads%2C+road+diets>`__
      by Jeff Speck (2012) - Step 5: "Protect the Pedestrian"

Lane widths typically fall between 2.7m (9ft) and 3.6m (12ft). For urban
contexts where Streetmix is most useful, the 3.0m (10ft) lane width is
most ideal. Some guides allow for 3.3m (11ft) lanes, but we will follow
Jeff Speck's lead (and other progressive planners) in setting 10ft
widths as typical.

There may be outlying scenarios where wider lanes are needed, but these
should never be considered the default: a 12-ft lane may be desirable to
provide passing clearances for large commercial vehicles on two-lane
highways, and widths less than 10-ft can be more desirable for urban and
residential areas where pedestrian crossings exist and lower traffic
speeds are needed.

When there is more than one lane in a direction, sometimes the outside
drive lane can be wider than inside drive lanes, and even increased
beyond the 12-ft maximum range, to accommodate larger vehicles (such as
trucks) as well as bicycles (see also sharrow). Note that when space
allows, a dedicated bike lane is always preferred and safer than a
sharrow.

*need source tying lane width to maximum car speed and safety*

Design considerations
^^^^^^^^^^^^^^^^^^^^^

-  Generally, any lane improvement that increases traffic flow (and
   speed) will correlate to an increase in pedestrian injuries and
   deaths, and reduce walkability. For instance:

   -  One way streets
   -  "Fat" lanes (see *Walkable City*, `"Fat
      Lanes" <https://gist.github.com/louh/9f75daf8acb37e2040b7/raw/3ceee521f36c649c0f6c6db3f05ecaecc040929f/Walkable+City+-+Lane+widths>`__)
   -  More lanes than needed (see *Walkable City*, `"Protect the
      Pedestrian" <https://gist.github.com/louh/921ca2e36cf2a7e5df49/raw/c720c5170bd6534a07d4b7b73ac588b3dc56d4fa/Walkable+City+-+Multilane+roads%2C+road+diets>`__)

Typical turn lanes
~~~~~~~~~~~~~~~~~~

-  **Subtypes:** Inbound, outbound, combined with through lane
-  **Default width:** 10 ft (3.0m) (same as typical lane)
-  **Minimum width:** 10 ft (3.0m) (per `AASHTO
   2001 <https://gist.github.com/louh/9ed5e8585878db8034c6>`__)
-  **Maximum width:** 12 ft (4.8m) (same as typical lane)
-  **References:** `AASHTO 2001 Green Book - Chapter 4 - Lane Widths (pp
   315-316) <https://gist.github.com/louh/9ed5e8585878db8034c6>`__

Turn lanes are typically provided on major streets to provide a refuge
for cars turning into cross-streets, side streets, or sometimes even
into a parking lot. At intersections, space for turn lanes are often
created by removing a parking lane, or by converting a through lane to a
turn lane (and dual-purpose through/turn lanes exist as well). If the
street is particularly wide, a median can be provided between the
directional lanes, and the turn lane occupies the space where the median
was when needed. On streets with a lot of possible turns, using a
continuous center turn lane is common.

Center turn lane
~~~~~~~~~~~~~~~~

-  **Full name:** Continuous two-way left-hand turn lane
-  **Default width:** 12 ft (3.6m) (Used as a default for an 80'
   collector road by the Las Vegas Unified Development Code 19.04.190)
-  **Minimum width:** 10 ft (3.0m) (per `AASHTO
   2001 <https://gist.github.com/louh/9ed5e8585878db8034c6>`__)
-  **Maximum width:** 16 ft (4.8m) (per `AASHTO
   2001 <https://gist.github.com/louh/9ed5e8585878db8034c6>`__)
-  **Markings:** yellow solid line with yellow dashed lines on the
   inside
-  **References:** `AASHTO 2001 Green Book - Chapter 4 - Lane Widths (pp
   315-316) <https://gist.github.com/louh/9ed5e8585878db8034c6>`__

A center turn lane is a special type of turn lane that is continuous
along the street, allowing refuge for turns along the entire street and
not just where a specific turn lane area is provided.

Adding a center turn lane is a good "road diet" tool for turning
dangerous four-lane roads into a three-lane road (two lanes in either
direction, with the center turn lane as the third lane). However, when
street widths are fixed, it's usually not a good idea to take away some
other kind of amenity (like parking lanes or bike lanes) to provide the
turn lane. (for more information, see *Walkable City* `"A Road Too
Far" <https://gist.github.com/louh/e7a39436a8298d9ff869/raw/189aff8c9fe34654ad4e03c67f7e4bc4a191e6c3/gistfile1.txt>`__)

Parallel parking lanes
~~~~~~~~~~~~~~~~~~~~~~

-  **Subtypes:** inbound, outbound
-  **Default width:** 8 ft (Source: Complete Streets Chicago 3.2.1
   "Cross Section Assemblage" (2013))
-  **Minimum width:** 7 ft (Source: Complete Streets Chicago 3.2.1
   "Cross Section Assemblage" (2013))
-  **Maximum width:** 10 ft
-  **Markings:** unmarked, marked with "T"

On-street automobile parking lanes are common and have been generally
included wherever there is room. In residential areas, the minimum width
is 7 ft and are usually unmarked. On commercial streets the width is
usually minimum of 8 ft and may be marked so that the number of parking
spaces fixed to a specific amount, and can be tied to parking meters.

Some municipal guidelines look at drive lanes and parking lanes
together, especially when parking lanes are unmarked. For instance, the
Las Vegas Unified Development Code designs residential streets to be
17'-18' (so that it reasonably breaks down into 10' drive, + 7'-8'
parking). Note that the Chicago Complete Streets Plan, cited above,
requires an 18' minimum - this creates a 11' drive lane with a 7'
parking lane in a residential zone, which - given that 10' is plenty
particularly in residential streets where speeds should not be
encouraged to go above 20-25mph - we should not accept as ideal.

Other types of parking lanes
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Guidelines and helpful plan diagrams for these exist in certain
municipalities, but I have to remember which ones and then track them
down.

Perpendicular
^^^^^^^^^^^^^

-  **Default width:** 18-20 ft
-  **Minimum width:** 14-18 ft

   -  A car's length is usually more than 14 ft but some municipalities
      allow the front of cars to overhang curbs.

-  **Maximum width:** 22 ft

A situation where cars are allowed to park perpendicular to the curb.
Mostly seen on extremely wide commercial corridors.

Angled
^^^^^^

Like perpendicular, but angled parking takes up less width. The angle of
the parking space will influence its width.

Bike facilities
---------------

Generally, for Streetmix, bike lane and bike facilities will adopt the
`NACTO Urban Bikeway Design
Guide <http://nacto.org/cities-for-cycling/design-guide/>`_, which
provides in-depth discussion on the different types of bike paths that
are available, based on guidelines set out in the **AASHTO Guide for the
Development of Bicycle Facilities (1999)**. Note that our print copy is
the April 2011, but we should be using the second edition of the NACTO
guide released in 2012.

Typical bike lane
~~~~~~~~~~~~~~~~~

-  **Subtypes:** Inbound, outbound
-  **Default width:** 6 ft (Source: NACTO
   `text <https://gist.github.com/louh/3a697a9719946c386ba1>`__,
   `diagram <http://nacto.org/wp-content/uploads/2010/08/Conventional-Bike-Lanes_Annotation.jpg>`__)

   -  Note that many practitioners (such as *Walkable City*'s Jeff
      Speck) follow AASHTO guidelines for default bike lane width, which
      is 5 ft. NACTO allows for it but prefers to advocate for 6 ft
      wherever possible.

-  **Minimum width:** 3 ft (Source: see above)
-  **Maximum width:** 8 ft (Source: ?)

Bike lanes designate an exclusive space for bicyclists through the use
of pavement markings and signage, and are usually located adjacent to
motor vehicle travel lanes and flows in the same direction as motor
vehicle traffic. Bike lanes are typically on the right side of the
street, between the adjacent travel lane and curb or parking lane,
although in some countries the preferred location is between the parking
lane and the curb. For other buffer types, see below.

Bicycles are a desirable alternate form of transportation to the
automobile because it is a form of personal vehicle that has a lot of
benefits, which we won't describe here. Providing bike lanes allows
planners to be equitable to different forms of transportation while
reducing a carbon footprint and also allows for more passengers to
occupy a road, and separating the lanes helps bicyclists be safe and
comfortable riding on the street. It also reminds car drivers that
bicyclists are present. Bicyclists may leave the bike lane to pass other
bicyclists, make left turns, avoid obstacles or debris, and avoid other
conflicts with other users of the street.

Shared lane markings, or "sharrows" (bike lane + drive lane)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **Subtypes:** Inbound, outbound
-  **Default width:** 14 ft (4.2m) (Source: AASHTO Green Book 2011, page
   100; Complete Streets Chicago 3.2.1 "Cross Section Assemblage"
   (2013))
-  **Minimum width:** 12 ft (3.6m) (Source: AASHTO Green Book 2011, page
   316)

   -  AASHTO's actual suggestion of 12-13 ft (3.6-3.9m) describes a
      situation where an outside drive lane is slightly wider than an
      inside drive lane only to allow for bicycles. Presumably, drivers
      are allowed or expected to pass bicyclists on the inside lane.

-  **Maximum width:** 14 ft (at 15 ft, you may as well put in a 10' lane
   and a 5' bike lane.)

Sharrows are a strategy where additional road space is available, and
you want to get a bike lane in there somehow, but you can't really
stripe it without giving both the drive lane and bike lane less than the
standard width, so it is combined. This is a "shared lane" scenario.

In `a California
study <http://dc.streetsblog.org/2013/06/13/in-california-cities-drivers-want-more-bike-lanes-heres-why/>`__,
researchers found that drivers tend to prefer real bike lanes to keep
bikers separate from the cars, and dislike sharrows. Bikers, on the
other hand, prefer sharrows to nothing at all. (Source: `Do All Roadway
Users Want the Same Things? Results from a Roadway Design Survey of
Pedestrians, Drivers, Bicyclists, and Transit Users in the Bay
Area <http://safetrec.berkeley.edu/trb2013/13-4475.pdf>`__ by Rebecca L.
Sanders and Jill Cooper, 2013)

Cycletrack (bike lane + median or buffer)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **Subtypes:** One-way, two-way

-  Painted buffer. 2 solid white lines with diagonal hatching. 2 feet
   minimum because it would be impractical to paint a buffer area less
   than this. 3-feet buffer seems to be a pretty appropriate starting
   default. Buffer can be included with the bike lane as the total "bike
   lane width" (so a 2-ft buffer + 5-ft bike lane, or 3-ft buffer + 4-ft
   bike lane = 7-ft bike lane).
-  

   -  Source: NACTO Urban Bikeway Design Guide (April 2011) pp 20-22

Other types of bike lanes
~~~~~~~~~~~~~~~~~~~~~~~~~

For discussion around other types of bike lane placements, such as
left-hand side bike lanes, or contra-flow bike lanes (both of which are
permissible in Streetmix) see the NACTO Urban Bikeway Design Guide.

Bike parking
~~~~~~~~~~~~

Other road infrastructure
-------------------------

Medians (divider only)
~~~~~~~~~~~~~~~~~~~~~~

-  **Subtypes:** Curb only, planted

1.2m - 24m (4ft - 80ft) or more - AASHTO Green Book p341. Does this apply only to highways?
pp341-343 has information

Pedestrian median
~~~~~~~~~~~~~~~~~

A median that is at least 6' wide is good for pedestrian crossings.
When designed as "refuge islands" on two-way streets, it allows
pedestrians to cross one direction of traffic at a time in a safer way.
While 6' is the minimum needed to accommodate the length of a bicycle or
a person pushing a stroller, the preferred width of a refuge would be
between 8 to 10 feet, and even wider where there are more pedestrians
than usual. Trees, landscaping, signage, lights, or other "street
furniture" could also be installed on the median to make the refuge
obvious to drivers.

Source: Complete Streets Chicago pg 106.

Shoulders and gutters
~~~~~~~~~~~~~~~~~~~~~

Not presently planned for Streetmix.

Public Transportation
---------------------

Trolleys, streetcars, light rail
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **Subtypes:** Different car types; inbound, outbound; separated
   infrastructure or in drive lane
-  **Default width:** 10 ft (same as drive lane)
-  **Minimum width:** 10 ft

   -  According to `streetcar.org <http://streetcar.org/>`__, the widths
      of most streetcars are between 8'-0" to 9'-0". In the absence (so
      far) of guidelines defining streetcar width, we can assume that
      10' should be the minimum and can remain the default.

-  **Maximum width:** none

Buses
~~~~~

Trains
~~~~~~

Sidewalks (pedestrian zones)
----------------------------

Sidewalk
~~~~~~~~

Sidewalks are essential for pedestrian activity, and when they are
made as safe and welcoming as possible for people, it helps to create
lively, vibrant streets.

- 2.4m (8-ft) minimum (but total including buffer)
- residential areas 4ft-8ft (1.2-2.4m)
- buffers: 2ft

AASHTO Green Book pp361-362

Sidewalk border
~~~~~~~~~~~~~~~

| SIDEWALK "BORDER" (aka planting strip, buffer, setc)
| minimum 2ft (0.6m)

Sidewalk infrastructure (furnishing zones)
------------------------------------------

Street Trees
~~~~~~~~~~~~

Generic types
^^^^^^^^^^^^^

Probably no need to be specific about species, which is something
landscape architects do all the time.

-  Palm tree
-  Cherry tree (flowering)

Here's some `really good examples for San
Francisco <http://www.fuf.net/resources-reference/urban-tree-species-directory/>`__.

Miscellaneous
-------------

