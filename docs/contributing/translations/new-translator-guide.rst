New translator guide
====================

.. _Discord: https://strt.mx/discord

.. warning::

   This page requires a complete overhaul.


Welcome to the Streetmix translation team! Your contributions are invaluable in making Streetmix accessible to non-English-speaking countries around the world, and for communities that speak languages other than English. Let’s help you get started!


Overview
--------

Translators do not need programming expertise to translate Streetmix! We use a few tools and terms that translators will become familiar with:

- We use `Transifex <https://www.transifex.com/>`_ to manage different translations, or *locales*. Translators will use this interface to translate English text, or *strings*, into strings of another language. We call this translation process *localization*.
- We use `Discord`_ for real-time communication between translators at Streetmix team members. Whenever you have a question about how a string is used, or how it should be translated, this is the place to get answers.
- We use a *staging server* with a test instance of Streetmix in order to preview translated strings in real time. Whatever changes you make in Transifex should instantaneously appear on the staging server, allowing you to see your translation in context.

Localization is an iterative process. We may go through several rounds of iteration to ensure that localizations meet our high standards for quality. Once complete, we will turn on that language, or *ship* it, to our production server for all users of Streetmix.

We’ll take a closer look at each tool below.


How it works
------------

We manage translations through the Transifex platform.

The staging instance of Streetmix is constantly communicating with Transifex. When you finish a translation in Transifex, Streetmix fetches it and displays it.

.. image:: _images/3acfbbb-Translation_Workflow.png

Sometimes, there are updates or additions to the original, or *source*, English strings. When this occurs, the Streetmix team will make changes to the English files on GitHub. Transifex updates its source strings from GitHub twice a day.

.. image:: _images/e5e2331-New_Strings_Workflow.png


Seeing translations live
------------------------

The most important part about translating is seeing your hard work in Transifex show up live in the application! You can do this by visiting the staging server at http://streetmix-staging.herokuapp.com and toggling on the locales feature:

Once at the staging server, you can toggle on your language by doing the following:

  * **Press "shift-f"** (make sure the app is focused and no text box or developer tool window is selected). This displays a dialog box with some checkboxes. *(Note that this is just intended for testing and viewing your work, so please don't share it publicly.)* Choose which box to check based on the locale descriptions below.

We have 3 levels of locales (languages). Levels are lower bounds and inclusive. In other words, level 1 means all locales 1 or higher are enabled. You cannot only turn on level 1 but not level 2 for example. Based on which languages you want to see, check one of the following boxes:  

  * **Level 1+ (in progress)**: Incomplete or in progress, available for translators to test, but not for end-users.
  * **Level 2+ (complete, in testing)**: Complete or nearly complete, available for quality assurance & feedback with small group of users.
  * **Level 3 (complete, final)**: Finished and shipped to production, for public use.

Once you've checked the appropriate locale box, you can change to your language via the **"Settings" dropdown menu** in the upper right.

.. image:: _images/b3e8306-Settings_bar.png

This is a really good way of visualizing how your translated text works in the real application. Maybe in the editor it's not clear whether something should be capitalized or how long a text string can be, or maybe it's not clear what the proper translation should be. *Seeing it in Streetmix directly provides context that allows you to go back and clarify any translations.*

Also, if a translation is expected to show up, and it doesn't, please make a note of it (:ref:`see how to report problems below <reporting-issues>`). It might be that the application is not hooked up to the correct translation yet. Or it might be that the text showed up in another part of the application you didn't expect and is hard to get to (like an error page).


.. _translation-glossary:

Glossary
--------

Before you get started, here are some terms that you should get familiar with.

**Issue:** This is when there is a problem/error with one of the original English strings. When you add an issue, the project administrator will get a notification.

**Key:** Keys are unique identifiers for each string. An example is: buildings.wide.name.

**Placeholders:** These are what we use to store parts of a string that don’t need to be translated. All you have to do for these is when you see one, click on it and it will be inserted into the translation in the appropriate place. Here is an example of one:

.. image:: _images/dce66eb-number-of-floors.png

**Resource:** We have 2 main resources: the Main application UI (main.json file) and Segment info (segment-info.json file). Resource is just a fancy word used to indicate which of these files a string is in.

**Strings:** These are chunks of text in the user interface that we need to translate. “My streets” (a menu button in the top right corner of Streetmix) is one example of a string, and “Sidewalk with a lamp” (a segment) is another.

**TM:** TM stands for “translation memory”. If you see “TRANSLATED BY TM" in the Transifex interface, that means the string was auto-completed by Transifex because it identified an identical string that was translated before.

**UI:** UI means “user interface”. This refers to what people see when they use an app. You will be working in the Transifex UI and your translations will show up as a finished product in the Streetmix UI.


Using Transifex
---------------


Join the team
+++++++++++++

Start here: https://www.transifex.com/streetmix/streetmix/

If you are not logged in or don't have an account yet, you will need to click the "Help Translate Streetmix" button and you will be prompted to log in or create an account.

.. image:: _images/949b3d9-Screen_Shot_2018-03-14_at_4.02.59_PM.png

.. caution::

   The Transifex interface can take some getting used to. If something doesn't match a screenshot, let us know. It's most likely that there's some permissions problems, like we did not give you the correct editing privileges for your account. If it's because something in their interface actually changed, we'll update this accordingly.

Once you create your account, you may have to confirm your email address. Then, navigate back to https://www.transifex.com/streetmix/streetmix/ and you should see a blue button that says :guilabel:`Join Team`.

.. image:: _images/4769b7f-2-join-team.png

Click that button and then select which language you would like to be added as a translator for. If you would like to translate multiple languages, you can join another language later on by going to the *Languages* page, selecting a language, and then clicking :guilabel:`Join Team`.

.. image:: _images/2ad4c3c-3-request-language.png

After requesting to join a language, you should receive a confirmation message. Hang tight and a Streetmix project administrator will approve your request.

.. image:: _images/78c44d8-4-request-confirmation.png


Getting started
+++++++++++++++

Once your request has been approved, you should see the following when you go back to `Streetmix's Transifex homepage <https://www.transifex.com/streetmix/streetmix/>`_. From here, select *Languages*.

.. image:: _images/3e4f5bc-5-success-dashboard.png

The next screen will show different "Resources". *Resources* are different categories of text that Streetmix uses. Right now there are two. "Main application" is anything that Streetmix uses in the UI, which is almost all the text. "Segment info" is specifically text that is used for each segment (like car lanes or sidewalks). Main application text is the highest priority text to translate, followed by names of segments in the segment info text. Descriptions in segment info is more complex, and might not be up to date or as relevant for other countries and languages right now, so that is the lowest priority.

.. image:: _images/5d34f23-6-resources.png

If you click on a resource, such as "Main application," you will see a popup with more information. From here, click the large :guilabel:`Translate` button on the right.

The next screen is the main translation UI where you will be spending most of your time.

.. image:: _images/2d33cf7-8-translation-ui-2.png

On the left you will see a list of all the *strings* (phrases/sections of text to be translated) in English followed by its translation into your language, if already there. On the right is where you will make the translation. When you are looking for a specific string, filter them by using the search bar.

You will also see a series of tabs (*Suggestions, History, etc.*) that can help you create a translation depending on the context. The first is *suggestions* — here Transifex will display similar strings to the one you are translating. This can help you see language that other translators have used for similar strings. However, do not copy and paste this as it is probably for a different string.

Next, there is the *history* tab. This lets you see prior translations for the string. It is really helpful when an English string is updated, as it lets you retrieve previous translations, and then tweak the string from there.

.. image:: _images/baefb00-9-history.png

The last two tabs are *glossary* and *comments*. We are not utilizing the glossary yet, but comments are where you will tell the team anything that you think is important to note about the string. It is also where you can :ref:`report issues <reporting-issues>` with the string (in some cases there may be an error in the English string, so please tell us!).


Placeholders
++++++++++++

Some of our strings have placeholders. These are what we use to represent elements in a string that do not need to be translated. This can be a link to a webpage, HTML markup, or text being inserted from another part of the app. Whatever the case, just know that you do not need to translate these. All you have to do is copy them over from the English version of the string. This is a simple process: the placeholders will show up as purple or orange buttons, and you just need to click on it in the English version to copy it over.

.. image:: _images/159e849-10-placeholders.png
   :align: center


Plurals
+++++++

There is a special way to deal with plural strings in Transifex. They can be inputted in Transifex's UI as shown in the animation below. Some languages have more plural forms than others, and Transifex takes this into account based on `a Unicode standard <http://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html>`_.

.. image:: _images/67a7ca5-plural-instructions.gif


Translation string changes
++++++++++++++++++++++++++

Sometimes there will be updates to the English strings. Transifex will detect those and require a new translation to be submitted. However, have no fear! There is a handy dandy "History" feature that lets you retrieve your previous translations of the string, and then tweak the string from there.


Need more help?
---------------

Refer to the `Transifex documentation <http://docs.transifex.com/>`_ if you need more help. A good place to start is the `Transifex web editor tutorial <http://docs.transifex.com/tutorials/txeditor/>`_.


FAQ & Discord chat
++++++++++++++++++

As questions come in, we will add them to the :ref:`Frequently Asked Questions page <translation-faq>`.

If your question isn't answered there, come ask the Streetmix community on `Discord`_! Please ask translation-related questions in the #translations channel.


.. _reporting-issues:

Reporting issues
++++++++++++++++

If you ever see an error on Transifex, please mark it. (`Instructions are here. <https://docs.transifex.com/translation/tools-in-the-editor#comments-and-issues>`_)

.. figure:: _images/675f649-transifex-string-comment.gif

If there is a difficult or confusing string, please add a comment on Transifex. You can also put any notes you think are important for the string there. This is the same place where you would mark something as an issue (just click "Add as issue" instead of "Add".

For issues that are larger than one specific string, please bring this up to the Streetmix community. There are two ways you can do this:

1. Tell us on the Streetmix Discord in the *#translations* channel. You can join our Discord server here: https://strt.mx/discord.
2. Create an issue on GitHub (`learn more <https://help.github.com/articles/creating-an-issue/>`_). Our issues are located here: https://github.com/streetmix/streetmix/issues/new

