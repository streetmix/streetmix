Helpers and utilities
=====================

.. warning::

   This page is a work in progress.


We use the following utilities to solve common programming problems.


Pseudo-random number generator
------------------------------

If you need a one-time use random number (which will never be stored), there's nothing wrong with JavaScript's built-in ``Math.random()``. However, there are times where we need a **seed** for a pseudo-random number generator (PRNG). Seeds generate a random-*looking* sequence of numbers, but they have the benefit of remaining consistent across renders. For example, this is useful on our sidewalk segment, where we want to generate a random set of pedestrians but we want those pedestrians to remain the same between page refreshes or React component updates.

We can generate seeds by calling ``generateRandSeed()``, then by feeding those seeds into the ``seedrandom`` library:

.. code-block:: javascript
   :linenos:

    import seedrandom from 'seedrandom'
    import { generateRandSeed } from './util/random'

    function doThingsWithThePRNG () {
      const seed = generateRandSeed()
      const prng1 = seedrandom(seed)

      // Generate pseudo-random numbers. Each time rng() is called, it returns
      // the next pseudo-random number in the sequence.
      console.log(prng1()) // -> first pseudo-random number
      console.log(prng1()) // -> second pseudo-random number
      // .. etc

      // Create another generator with the same seed
      const prng2 = seedrandom(seed)
      console.log(prng2()) // -> same value as the first call to prng1()
    }

When ``seedrandom()`` is called, it returns a function that will return a consistent sequence of numbers each time it is called, for the given ``seed``. The sequence returned is local to that function. 

.. note::

   Although the ``seed`` can be any type of value, like a string, ``generateRandSeed()`` returns only integer values so that when we store seeds in a data model we can check for type consistency.

In the above example, we call ``seedrandom()`` twice, with the same ``seed``, so that we can create the same sequence of pseudo-random numbers in two different scenarios. This example is contrived because the pseudo-random number generators are used in the same function, and in reality the ``seedrandom()`` call may happen in separate parts of the application.


**References**

  - `Random Seeds, Coded Hints, and Quintillions <http://davidbau.com/archives/2010/01/30/random_seeds_coded_hints_and_quintillions.html>`_, *David Bau, 30 January 2010*
  - `seedrandom.js <https://github.com/davidbau/seedrandom>`_ *[GitHub]*
