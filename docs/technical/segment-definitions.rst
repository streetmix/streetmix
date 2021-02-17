Segment definitions
===================

.. attention::

   This page is a work in progress. This is a draft specification of Streetmix's forthcoming segment definition schema. For documentation related to the legacy specification, see `this file <https://github.com/streetmix/streetmix/blob/main/assets/scripts/segments/README.md>`_.
   
   The schema and structure described here is subject to change and evolve.

Glossary
--------

segment
  **Segments** are the building blocks of a street. A street cross section is composed of a sequence of non-overlapping segments. Note that a *segment* in this context is not the same as a *street segment*, which is a length of a street with an arbitrary start and end point (but usually at intersections).

  Segments are defined as an assembly of various *segment components*.

segment component
  Segments are made up of **components**. We will call them *segment components* to differentiate them from the generic concept of a *component*, which might be used in other contexts (for instance, a *React component*).

sprite
  A **sprite** is the illustration used to represent a *segment component* visually.


Types of segment components
---------------------------

There are four types of segment components. Segment components have **profiles**, based on its **type**, that describe its general characteristics.

1. Lanes
++++++++

**Lanes are ground-level zones of street activity.** Common examples of lanes include *vehicle travel lanes*, which are typically allocated to automobiles and bicycles, paved with asphalt, clear of obstructions, and allow for high speeds of travel, and *sidewalks*, which are typically allocated to pedestrian use, paved with concrete or other decorative paving material, and allows for lower speeds of travel.

Lanes have a consistent width, but a variable length, aligned along the street's centerline axis. Lanes do not have to be consistently parallel with the street axis, nor does it need to be continuous along the entire length of a street segment. While lanes are assumed to have a consistent width, it is possible for lanes to deviate along its length.

Lanes are not required to permit vehicular travel. Some may be designated for parked vehicles (*parking lane*), or be clear of vehicles altogether (*sidewalk furnishing zone*, *planting strip*).

Lanes are not required to have the same function at all times. Some lanes change function throughout the day, such as parking lanes that turn into travel lanes during rush hour. Some lanes may allow a mix of functions throughout, such as a parking lane where some spaces are occupied by cafe seating.

Lanes have the following defined characteristics:

- **Surface material**, such as concrete, asphalt, brick, permeous paving, etc. This informs 
- **Surface height**, a +/- delta value from "grade" level, which is defined as zero. The "grade" level is the top of the surface used for vehicular travel. A height value of +1 is the height of a standard sidewalk curb lip. Note that this value is _not_ a real-world engineering measurement, and visual rendering of surface height in Streetmix is illustrative. 
- **Intent**, which specifies allowed functionality. Example values may include *pedestrian*, *fast vehicular*, *slow vehicular*, *parked vehicular*, *recreational*, *unknown*, or *any*. This may be overridden at the *segment component* level.
- **Minimum desired speed**, for *intents* that allow vehicular travel, set the lowest minimum desired speed. This may be overridden at the *segment component* level.
- **Maximum desired speed**, for *intents* that allow vehicular travel, set the highest maximum desired speed. This may be overridden at the *segment component* level.

Segments must have one lane component.

2. Vehicles
+++++++++++

**Vehicles are modes of transportation.** 

- Vehicles. This defines things that can travel in a direction of motion (e.g. pedestrians, bikes, scooters, cars, trucks, magic flying carpet)

- **Label**
- **Weight**
- **Footprint** (square meters)
- **Speed** (maximum)
- **Emissions**
- **Capacity**
- **Level of automation**


3. Objects
++++++++++

**Objects, also known as furniture, are stationary items.** Examples include *benches*, *parklets*, *trees*, and *signage*.

Objects can be a single-instance item, like signage, which usually occur once in a specific spot. Objects can also repeat along a lane's length, such as street trees, which might be planted every 10 m or so. Note that repeating object spacing are rough guidelines for illustrative purposes and may not reflect actual spacing in reality, because of real-world physical constraints.

One handy rule of thumb for determining if something should be an *object* is to consider whether a single instance of it can be mapped with a point (that is, a latitude/longitude coordinate pair) and still have meaning. Ob

Objects have the following defined characteristics:

- **Label**


4. Markings
++++++++++++

**Markings a fourth "special" category that defines various ways lanes can be marked.**  An example of a *marking* are lane striping. Markings are conceptually similar to objects, in that they are stationary, and can possibly repeat along the length of the lane. However, they're different in that markings are really symbols. Their physical expressions are a side effect.

.. note::

   Markings are a transitional category which emerged because it was necessary to find a bridge between the original segment specification and the new one. This may go away in favor of splitting the different types of markings between the *lane* segment component type and a new property, *segment transitions*.


Components definitions
++++++++++++++++++++++

Segment components are defined in https://github.com/streetmix/streetmix/blob/main/assets/scripts/segments/components.json


Segment definitions
-------------------

.. admonition:: Background

   Currently every object type (what we call "segments" internally) is defined here: https://github.com/streetmix/streetmix/blob/main/assets/scripts/segments/info.json

   Its basic structure is very minimal. For every segment we have some properties attached to it (e.g. its display name, minimum / maximum recommended width, if any, and so on), and we also specify which image sprites represent the segment graphically. Each segment may also have variants, which come with its own properties.

   The problem with this format is that each segment hard-codes its own definitions for everything. For example, both drive lanes and parking lanes define what a car is, redundantly. This makes it very hard for segments to represent real-world flexibility. If we wanted all segments capable of supporting a bicycle to have a bicycle option, then each segment needs to duplicate the details of the bicycle.
   
   Finally, there is the problem variants. Each segment variant combines with other varients so the total number of variants are multiplied together. This means each time a new variant is added, the data multiplies exponentially. Most segments have two variants, which is manageable. Once you have three or more, it's unworkable. It's one of the main reasons why we resisted putting in raised bike lanes despite it being one of the most requested segment features over the last few years. Doing so raised the complexity of our data, and so we need to consider how to implement it in a better way.

Segments are now defined as an assemblage of components, with additional properties. See here: https://github.com/streetmix/streetmix/blob/main/assets/scripts/segments/segment-lookup.json


Additional segment properties
+++++++++++++++++++++++++++++

Once a segment has been constructed out of component parts, it can define additional information.


Properties
++++++++++

- **Label**. Name of the segment.

Properties may be editable by the user.


Variants
++++++++

Variants are toggles that slightly change the appearance or behavior of the segment. 



Segment transitions
+++++++++++++++++++

**Adjacent segment transitions** define what happens when the edge of one segment abuts the edge of another segment.

**Connecting segment transitions** define what happens when the end of one segment's *lane* is connected to another segment
's *lane*.

Note that segments cannot overlap in this specification, so if a segment overlap exists, it is redefined to adjacent, and the adjacent transition applies.
