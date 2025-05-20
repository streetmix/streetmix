---
sidebar_label: Changelog
sidebar_position: 5
---

# What's new in Streetmix?

## May 20, 2025

### 🐛 Bug fixes

- Fixed a bug preventing building heights from being adjusted with keyboard controls.

## April 24, 2025

### 🐛 Bug fixes

- Fixed a mysterious globe icon showing up when dragging a section element in Chrome on Mac OSX.
- Fixed drag interaction not working at all in Safari (!!)

## April 23, 2025

### ✨ New features

- **Export to Streetmeter!** We've partnered with [Streetmeter](https://streetmeter.net/) to export your Streetmix street into their new analysis tool, where you can dive into a more thorough evaluation of your street's performance!
- **Cycletracks for everyone.** This is a new old feature! A few years ago we released two-way cycletracks for Streetmix+ members, sponsored by our friends at ITDP Africa. Today we're making these available for all signed-in users!

### 🎮 UI improvements

- **A redesigned "new street" menu.** It's now a dropdown where you can select what kind of new street you want.
- Improved keyboard navigation across menus.

### 🐛 Bug fixes

- Fixed a bug where completely deleting a street name would not unname it.

### 🐞 New bugs 😳

Some interaction functionality is being reworked, which has resulted in some known issues that have not yet been resolved:

- Keyboard shortcuts for resizing and deleting section elements may not correctly target the one under the mouse pointer.
- When dragging a section element, some existing elements will sometimes get "stuck" together instead of making space for a dropped item.
- In some cases, there may be some difficulty dropping a section element on the right side of a street section.

## March 28, 2025

### 🐛 Bug fixes

- Fixed an animation issue where the moon would not appear when it was supposed to.

## March 27, 2025

### 🐛 Bug fixes

- Fixed a bug where manually entering a new street width in U.S. customary units with a fraction caused the street to be ten times wider than expected.
- Fixed an animation issue where a dragging an item from the palette caused a preview to flash briefly on the left-hand side of the screen.

## March 25, 2025

### 🐛 Bug fixes

- Fixed a layout issue that caused tall dialogs to be cut off on very short screens.

### 🎨 Improvements

- Added Bluesky social links.
- Removed Twitter and Instagram social links.

## August 12, 2024

### 🎮 UI improvements

- Improved dialog box behavior on mobile devices.

## August 8, 2024

### 🎮 UI improvements

- Visual upgrade for the street width dropdown menu.

## August 4, 2024

### 🎮 UI improvements

- Visual upgrades for menus and icons.

## May 9, 2024

### 🐛 Bug fixes

- Fixed a database issue that can prevent logins from a Google e-mail address, in rare cases.
- Fixed a bug that could prevent two-way bike lanes from being available.

## April 26, 2024

### 🐛 Bug fixes

- Fixed a bug that caused crosswalks, which are experimental, and one other secret item to be available.

## April 8, 2024

### 🎨 Improvements

- Improved keyboard navigation to several UI elements.

## March 22, 2024

Happy 2024! This week, we've rolled out a very big change behind the scenes: **Streetmix now uses metric units internally.** This is the culmination of a long process that took several years of careful planning and a over a month of focused implementation effort. Previously, Streetmix used U.S. customary units (also known, imprecisely, as "imperial"), and then converted those units to metric for users that needed it. This proved difficult to work with as Streetmix use expanded globally.

This is an internal change, so **you very likely do not need to take any action with your existing streets.** If you're using imperial (U.S. customary) units, your streets will have the same measurements as before.

However, with this update, we have one important change that _can_ affect you: **when converting streets between metric and imperial units, the conversion rate is now precise instead of approximate.** Previously, we used a conversation rate of `1 ft = 1 m × 0.3`. This approximation is used in many real-world scenarios, for instance, the AASHTO "Green Book" would define a 3.0-m lane width as equivalent to 10-ft in U.S. customary units. But, especially for wide streets and large aggregations of street elements, this rounding error compounds: a 400-ft street would be converted to 120 m, when it is closer to 122 m&mdash;a loss of nearly 2 m!

As a result, moving forward, the conversion rate is now the more precise `1 ft = 1 m × 0.3048`. This means that if a street switches its unit of measurement, you will need to manually fine tune your lane and street widths to have round numbers.

Internally, rules such as "minimum width" are now defined separately in each system of measurement, rather than converted from imperial (U.S. customary) units. Because of this, you might find that after switching a street's unit of measurement, a previously-valid street might express new warnings. Fine tuning your measurements after units conversion should resolve these.

We hope this change proceeds smoothly for everyone, and if you have any thoughts or feedback, please let us know in [Discord](https://strt.mx/discord)!

### 🎨 Improvements

- Updates to French translations.

### 🐛 Bug fixes

- Fixed new streets having a broken bike lane variant.
- Fixed colored asphalt icons not having different colors.

## November 25, 2023

### 🎨 Improvements

- Updates to Korean translations. Thanks to our translator, Jaeheon Kim, and our reviewer, Hanbyul Jo!

## June 20, 2023

### ✨ New features

**You can now set a display name for your account!** A display name is a more descriptive way to identify and personalize your account, and it's now the way you appear to other users on Streetmix, if you have one. You'll still have a pre-set username, which is what the system uses to identify you (for instance, in links to your street). In the future, you'll also be able to change your username, also!

![Display name in the UI](/img/changelog/display-name.png)

To get started, click on your profile image on the top right, then select **Settings**. Make sure the **Profile** settings tab is selected, then under **Display name**, tap the **Edit** button. You can change your display name as often as you'd like, so feel free to try something new!

## April 22, 2023

### ✨ New features

- **Added "Share using Mastodon" option.** Birdsite isn't quite dead, but elephantsite is open source and has some nice things going for it. It's worth supporting, so we're starting with some basic share functionality. When you share to Mastodon, we'll have to ask you what your Mastodon instance's domain is, since there are so many of them.

You can also now find us on the Fediverse at [@streetmix@urbanists.social](https://urbanists.social/@streetmix)!

## April 19, 2023

### ✨ New features

- **Added Indonesian support.** Thanks to Fuad Alghaffary for contributing these translations!

Language support is contributed by our users around the world. If you have any feedback or want to help, [you can learn more about how to help translate Streetmix](https://docs.streetmix.net/contributing/translations/overview).

## April 11, 2023

### 🐛 Bug fixes

- Fixed broken "Share using Facebook" functionality.

## March 23, 2023

### ✨ New features

- **Export directly to 3DStreet!** If you've ever wanted a plan view or a 3D view of your street, then [3DStreet](https://www.3dstreet.org/) is the tool you're looking for. They have supported importing from Streetmix for a long time, and now you can also send your street directly to 3DStreet with one click from the Share menu.

## November 19, 2022

### 🐛 Bug fixes

- Fixed a bug in Safari browsers where artwork would not be drawn unless the street was either interacted with or reloaded.
- Fixed a bug in Safari browsers where menus would be positioned incorrectly.

## November 15, 2022

### ✨ New features

We stealth-launched two-way cycletracks a few months ago, but this is its official announcement! We've also added a handful of new features, coming from our friends at [ITDP Africa](https://africa.itdp.org)!

![New features gallery](/img/changelog/itdp-africa.png)

#### Available for [Streetmix+](https://strt.mx/plus) members:

- **Two-way bi-directional cycletracks.** You no longer have to put together two bike lanes together by hand! Just plop down a cycletrack _and_ get a nice painted yellow line down its middle.
- **Mixed-use traffic lane (with bus).** Let's be real, you often get busses and cars in the same lane. Why not show that?
- **Mixed-use traffic lane (with bicyclist).** Let's be even realer: too often, bikers are stuck on drive lanes too. But I don't think these bikers are too happy about it.
- **Drainage channel.** It's been too long since we gave the stormwater management people some love. This is just the beginning. We know there's so much more to drainage than just a groove in a street.
- **Elevation toggle for sidewalk.** You can now make some pedestrian areas not have a curb.

### Available for all signed-in users:

- **Street vendors.** Add some small-business commercial activity to your street!
- **Compound wall.** Sometimes, buildings are located behind a wall. Like this one.

## November 12, 2022

### 🎮 UI improvements

- **Improvements to gallery view.** Those tiny gray pixels? Gone. Thumbnails look great now!

### 🎨 Improvements

- Updates to Finnish and Czech translations.

## October 25, 2022

### 🎮 UI improvements

- **The custom scale slider in the "Save as image" dialog is now 500% more useful.** We sort of stealth-released a "custom scale" feature that let you save images at 500% the original size, for when you needed super crisp magazine spreads or 10-foot wide hero banners. The problem is, we just used placeholder developer labels on it with no other explanation. It'll now tell you what size a saved image will be at in percentage terms, as well as pixel resolution and typical print dimensions. **Note: This is a Streetmix+ member feature, so if you'd like to use it, grab a [monthly membership subscription](https://strt.mx/plus) today!**

## September 8, 2022

### 🎮 UI improvements

- **Added a new settings menu.** It doesn't do much yet, but it makes it easier to add more options in the future. It's accessible in your user menu (for signed-in users). The old settings menu is removed.
- A new language selection menu is added where the old settings menu used to be. (It's mostly what the old settings menu did, anyway.)
- Icons and tooltips added to various parts of the menu bar and street metadata UI (below the street name).

## August 24, 2022

### ✨ New features

- **Added Czech and Spanish (Spain) translations.** Thanks to our translators, [Jiří Podhorecký](https://spotter.ngo) and Pau Martí Talens!

### 🎨 Improvements

- Updates to Finnish and Norwegian translations.

## January 31, 2022

### ✨ New features

**Announcing Streetmix+, a [monthly membership subscription](https://strt.mx/plus) that supports us _and_ gets you access to new features.** Here's a quick summary of the new shinies that Streetmix+ members get:

- **Rename street segments.** We get it: it's not a "drive lane," you want to call it an "obstacle course." But in all seriousness, a lot of people have different names for things in different parts of the world, and we could only have chosen one. Now you can choose another.
- **Change environmental backgrounds.** Because science tells us the sky isn't really blue, that's why.
- **Export images without watermark.** Some of you actually crop the watermark out when you publish an image from Streetmix. We see you. Our eyes are everywhere. Now you can do it with our permission.
- **New segments:** double decker bus, microvan, and autonomous shuttles. Oh my.

We'll have more to come, so head on over to [our documentation](https://strt.mx/plus) for more details and instructions for signing up.

## December 9, 2021

### ✨ New features

- **Added Amharic translation.** Thanks to our translators, Gashaw Aberra and Carolyne Mimano of [ITDP Africa](https://africa.itdp.org)!

## November 3, 2021

### 🎨 Improvements

- Updates to Finnish and Swedish translations.

## October 21, 2021

### 🎮 UI improvements

- **Fixed word breaks in Korean.** Did you know brow sers will break Korean wo rds whe never it feels lik e it? It's l ike readin g sente nces like t his. Annoyi ng, right? Anyway, we fixed it!

P.S. We’re still looking for someone to help us finish Korean translations, so if that’s you, [please reach out!](mailto:hello@streetmix.net?subject=Korean%20translations)

## August 7, 2021

### 🎨 Improvements

- **Fresh new look and feel for documentation!** We called all our friends last week and told them if they help us move they get free pizza and beer. Same old content, but now in a modern apartment, which also let us reorganize a little and make things more intuitive to find! Please update your links and address books. [If you'd like to contribute to documentation, let us know!](https://docs.streetmix.net/contributing/documentation/)

## July 29, 2021

### ✨ New features

- **Added a utility pole.** Now, you have _the power!_ Overhead wires and birds not included. Thanks to Brian Wamsley of Hamilton County Planning and Development (USA) for contributing original artwork toward making this segment! ![Utility pole](/img/changelog/utility-pole.png)

### 🎨 Improvements

- **Palette UI improvements.** Icons are now larger and have standardized widths, making them easier to see and interact with.

## July 22, 2021

### 🐛 Bug fixes

- Fixed a bug where buses were noping out of existence on new streets.
- Fixed a bug preventing a handful of old Twitter-based accounts from signing in when we haven’t seen them in a long time.

## July 7, 2021

### ✨ New features

- **Added Swedish translation.** Thanks to our translators, Jakob Fahlstedt and Dennis Haagensen!

## April 7, 2021

### ✨ New features

- **Added Norwegian Bokmål language.** Thanks to our translators Anders Hartmann and Børge A. Roum!

## February 3, 2021

### 🎨 Improvements

- **Bus rapid transit (BRT) stations now expand and contract with segment width.** Get yourself a bit of social distance when waiting for a bus: it's the healthier, more comfortable thing to do. ![Variable-width BRT station](/img/changelog/brt-variable-width.gif)

## December 17, 2020

### 🎨 Improvements

- Small tweaks to the food truck: fixed the color and reflection direction on the windows, slightly reduced the height of the human ordering food, and while we’re at it, make a palette-swap human variant.

## December 15, 2020

### ✨ New features

- **Added languages: Turkish and Catalan.** _Şerefe!_ and _Salut!_ Thanks to our translators: Hande Sığın, Hayrettin Günç, Ignasi Gustems, and Max Eritja.

### 🎮 UI improvements

- Updated the “trash can” icon into a cleaner, easier-to-read design. As well as a couple other icons you’d never notice.
- Updated the street nameplate font to something with an open-source license, the excellent [Overpass](https://overpassfont.org/) by Delve Fonts.

## November 19, 2020

### ✨ New features

- **We have a big street capacity metrics update for you!** You can now switch between different data sources. We’ve also overhauled our infographic visuals, so it looks like this now: ![Capacity analysis infographics demo](/img/changelog/capacity-chart.gif)

### 🎮 UI improvements

- As part of this update, users are no longer able to fork someone else's street by changing settings in the analytics window. (It felt weird.)

## October 22, 2020

### ✨ New features

- **Switched our user analytics provider.** We no longer feed the ad-beast that is Google (although they’re probably still tracking you in other ways outside of our control), opting to use the open source, privacy-minded [Plausible](https://plausible.io/) instead. Does this affect your usage of Streetmix? No, not really. So why is it a new feature? I mean. Like a better Internet _isn’t_?

### 🐛 Bug fixes

- Fixed a bug that caused manual width inputs on some segments to update the wrong segment. 😱

### 🎮 UI improvements

- While fixing that last bug we also made some tweaks to how the input works:
  - The plus and minus buttons are now visually grouped with the input box and have been given a bit of a color scheme upgrade.
  - Editing that input box no longer auto-updates the segment width visually, which was causing some unexpected issues with the input. We want to put it back eventually, once some underlying wrinkles have been ironed out!
- Updates to French, Italian and Spanish (Latin America) translations.

## October 7, 2020

### ✨ New features

- **Added bus rapid transit (BRT) station and bus segments.** Tired of slow buses waiting in traffic? Never settle for second best. Or third best. Go for the best best. Choose the most rapid type of bus, today. ![Bus rapid transit (BRT)](/img/changelog/brt.png)

## September 29, 2020

### 🐛 Bug fixes

- Fixed a bug could cause the sentiment survey to reappear multiple times after it has been dismissed.

## July 23, 2020

### 🐛 Bug fixes

- Fixed tooltips on the sentiment survey popup to be properly translated into other languages.
- Fixed a bug that caused sentiment survey text to be laid out improperly after being translated.

## July 15, 2020

### ✨ New features

- **You can now vote on someone else’s street!** We’re just asking one question right now: _how joyful is it?_ If a street gives you the warm fuzzies, let us know by giving it a few kudos. And if your inner critic has something to say, smash that angry face button. ![Sentiment survey](/img/changelog/sentiment-survey.png)

## July 8, 2020

### 🐛 Bug fixes

- Fixed additional authentication-related issues that prevented certain users from being able to log in successfully.

## June 19, 2020

### 📣 Service notice

In the past month, you might have seen a lot of scary-looking “Unable to load Streetmix, Error: RM1” error messages when returning to Streetmix, forcing you to log in more than once.

This was inadvertently caused a behind-the-scenes update we made to make authentication more secure, but by replacing an older process, it introduced side effects and bugs that took some time to track down and squash.

As of today, we think we’ve resolved most cases of this problem. A few accounts may still have lingering issues, and if you’re affected, try reloading the browser tab and logging in again.

If you are someone who continues to see this problem repeatedly, then we want to know more about your situation. In that case, please reach out to at [hello@streetmix.net](mailto:hello@streetmix.net) and tell us more.

We are continuing to monitor the errors and apologize for any inconvenience this may have caused. Thank you!

## May 27, 2020

### ✨ New features

- **Added outdoor dining.** Support your local restaurants, when it’s safe to go outside again. ![Outdoor dining](/img/changelog/outdoor-dining.png)

### 🎮 UI improvements

- Selecting somewhere in the geolocation search bar now zooms in to that location.

### 🐛 Bug fixes

- Fixed a bug that caused tooltips to appear in the wrong place on Edge browsers.

## May 19, 2020

### 📣 Service notice

We’ve upgraded our sign-in authentication system behind the scenes. As a side effect of the update, we had to sign everyone out of Streetmix. You may see a cryptic error message the next time you return (if not already!). When this happens, please reload the page and sign in again! Thanks!

### ✨ New features

- **You can now remove capacity counts from view.** Hush, you scary numbers!

## May 7, 2020

### ✨ New features

- **Added historical European-style arcade buildings.** No, not like, video game arcades. A series of arches. Actually, there’s some really interesting history with that word: it used to mean a building façade with a series of exterior arches that formed a semi-open but protected walkway that made it ideal for shops and games for “amusement”, but then over time as these retail uses moved indoors they were still called arcades even if they didn't use arches anymore, and then when the “amusement centres” inside of arcades got digital gaming machines they were called _arcade games_ and the venues themselves became _arcades_ and that’s what we think of when we say that word now. Oh, and did you know that the word _arch_ is itself derived from _architecture_ because they literally had no other word for a curved structural element? Language is fascinating! ![Arcade buildings](/img/changelog/arcade.png)

## April 18, 2020

### 🎮 UI improvements

- **Upgraded “toast” notifications.** Did you know they’re called “toasts” because ... they _pop up?_ Haha! Get it?
- **Buttons universally have rounded corners now.** Like your house chores, we were eventually getting to all of them. And with that done, we’ve fired our entire user interface engineering team for that terrible toast pun.

## April 16, 2020

### ✨ New features

- **Planting strips now grow more bushes and (colorful!) flowers.** You know what they say about April showers... ![Flowers!](/img/changelog/flowers.png)

## April 8, 2020

### ✨ New features

- **People can now walk around in the street.** Quarantine Update Part II is brought to you by empty streets, fresher air, and cabin fever. Everywhere’s a walking path now. Social distancing not included: please continue to stay two meters (six feet) away from each other outside, but here in Streetmix-land we can still dream, can’t we? ![Occupy Any Street](/img/changelog/street-people.png)

### 🐛 Bug fixes

- Temporary barriers no longer display a different item when dragging one out of the palette.

## April 2, 2020

### ✨ New features

- **Added temporary barriers, like traffic cones, barricades, and jersey barriers.** We can see what’s happening from our second-story bedroom window. No one’s outside. No one’s driving anywhere. And if you’re on a vehicle that helps you stay away from other people — a bicycle, perhaps? — where are you going to ride it, in the ample car lane that suddenly has way less cars in it? Yeah. We thought so. Here, some of these traffic cones might help. ![Jersey barriers, barricades, and traffic cones, oh my](/img/changelog/temporary-barriers.png)

### 🎮 UI improvements

- **Segments (and its variants) that require sign-in to use are now shown when signed out.** If you don’t have an account yet, we’re cranking up your FOMO.

### 🐛 Bug fixes

- Fixed a bug where some users had features incorrectly turned off in their account.

## March 19, 2020

### 🛠️ Improvements

- **We’ve completed our migration from MongoDB to PostgreSQL.** Wait, what? Okay, look, this is too cool not to talk about. We’ve been working on changing our database behind-the-scenes for years now, and today, it’s finally done. _And you didn’t even notice!_ It’s like we changed all the upholstery in your car, while you were driving it, and suddenly you look down and not only does it look nicer and cost less to maintain, but it is also, weirdly enough, a _map_. (This enables better geospatial support, so stay tuned!)

### 🐛 Bug fixes

- Fixed a bug where typing a capital-letter D in the e-mail sign-in input (or anywhere, really), would give you TMI about application state.
- Fixed a bug where the gallery would crash if you opened it right away.

## March 11, 2020

### ✨ New features

- **Raised bike lanes!** All right, you can ride your bike on the sidewalk. Watch out for those pedestrians, though!
- **...also for bike share stations!** These are also often on the sidewalk, too!

## January 29, 2020

### ✨ New features

- **Added an outbound autonomous vehicle illustration.** When you hate to see them go, but you love to watch them drive away. (Note: only available for signed-in users.)
- **Added a motorcycle with sidecar to the drive lane.** And introducing a cameo by [Junebug and Johnny](http://kentuckyroutezero.com/). (Note: only available for signed-in users.)
- **Added languages: Italian, Korean, and Latin American Spanish.** _Cin cin!_ _건배!_ _¡Salud!_ The latter is especially important, as we can now support a much larger community of Spanish speakers throughout all of Latin America. Many thanks to our translators, Enrico Ferreguti, Sunha Park, and Lina Marcela Quiñones, with reviewers Marco Scarselli, Hanbyul Jo, and Carlos Pardo.

### 🎮 UI improvements

- **Remodeled the personal street gallery interface.** Some notable changes:
  - The selected street now has a more visible border, making it easier to see.
  - The “Delete street” button has been relocated to make room for longer street names, and changed from an “x” symbol to a more context-sensitive trash can icon.
  - Thumbnails that cannot be rendered (for instance, because the street contains data that hasn’t been implemented yet) now show an error message in place of the thumbnail, instead of crashing the entire gallery component.

### 🐛 Bug fixes

- Fixed a bug where attempting to make a copy of a deleted street would crash the app.
- Fixed a bug where the current street would not be shown as selected when opening the street gallery.
- Fixed a bug where capacity count summaries would not be localized.
- Fixed broken right-to-left layout in the street gallery.
- Fixed certain styling issues that would occur as a result of rounding errors.

## January 18, 2020

### ✨ New features

- Users in any language can now sign in with e-mail, Facebook and Google single-sign-on options, in addition to Twitter. (Although they haven't all been translated yet.)

### 🎮 UI improvements

- **New UI font!** If you’re into typography, say hello to [Rubik](https://hubertfischer.com/work/type-rubik) by [Hubert & Fischer](https://hubertfischer.com/).

### 🐛 Bug fixes

- Fixed a regression that caused a crash whenever a new segment was dragged out from the palette.
- Fixed a regression where streets would show a “Updated seconds ago” timestamp when being edited.

## January 8, 2020

**Happy new year!** We have a few updates!

### ✨ New features

- We added a variant of turn lane that has all three left turn, right turn and straight arrows. They're uncommon, but they do exist in the wild!

### 🐛 Bug fixes

- We fixed a bug that could cause a browser to navigate forward or back a page if you scrolled too far on a wide street.

## October 14, 2019

![Streetmix logo 2019](/img/changelog/logo.svg)

**OH DANG NEW LOGO HYPE.** We’ve started to tighten up our branding and have slowly transitioned to it over the past few months, like adopting a new wardrobe. If you like it, send notes of appreciation to our talented designer, [Justine Braisted](https://justinebraisted.com/)!

## September 24, 2019

![Autonomous vehicles, magic carpets, and analytics OH MY](/img/changelog/av-carpet.png)

- **Autonomous vehicles!** The car of the future? Look, you decide. Drive lanes now have a cute, friendly “Firefly”-inspired model as an option. They don’t exist anymore, but we’ll still know what you mean.
- **Magic carpets!** Speaking about fantasy vehicles _(oooh, sick burn)_, why not a rug that hovers in the air, carrying a maximum of two people and a tiger? (The tiger is optional.)
- **Street capacity summaries.** And while we’re on the subject of capacity, lanes now estimate how many people you can push through per hour. With charts! (Tigers not included.)

Thanks to our friends at the [New Urban Mobility Alliance (NUMO)](https://www.numo.global/) for supporting these new perks for our users. (Sign in to access these!)

## May 21, 2019

- **Get your scoot on!** Electric scooters are all the rage, so dim your road rage with some ragin’ scooters. ![Scooters](/img/changelog/scooters.png)

## January 4, 2019

- **Streetmix has been translated to Arabic!** Particularly impressive from a technical standpoint, as we had to mirror the entire UI to make this possible. ![Arabic translation](/img/changelog/arabic.jpg)

## December 19, 2018

- **We have a Minecraft server!** So if you want to build more than just streets, find us on [minecraft.streetmix.net](http://minecraft.streetmix.net/).
- **Forums have been reset.** It regenerated, like a Time Lord.

## October 24, 2018

- **Additional sign-in methods are now available in Spanish.**

## October 10, 2018

- **Our community chatroom is now on Discord!** [Click here to join us!](https://strt.mx/discord)

## October 9, 2018

- **And now we've got Russian!** На здоровье!

## September 24, 2018

- **German localization is now complete!** Prost!

## September 17, 2018

- **You can now sign in with Google, Facebook, or e-mail!** It doesn’t matter what social media service you’ve deleted, you can still use Streetmix. (Note: this is only available in English, Finnish, French and Polish right now. We’ll get to you soon, rest of world!) ![New sign-in screen](/img/changelog/sign-in-v2.png)
- **Along with that, we’ve also created [terms of service](https://streetmix.net/terms-of-service/) and [privacy policy](https://streetmix.net/privacy-policy/) documents.** With great power comes great legal responsibility. Pour yourself a glass of wine and give ’em a read, will you?

## September 9, 2018

- **Light rail and streetcars (tramways) can now travel on grass.** Here are [some](https://commons.wikimedia.org/wiki/File:Tram_3b_La_Villette_tram_et_train.jpg) [examples](https://commons.wikimedia.org/wiki/File:Bilbao_Euskotran_404.jpg) [from](https://inhabitat.com/europes-grass-lined-green-railways-good-urban-design/) [around](https://commons.wikimedia.org/wiki/File:Tram_Linz_077_2_Hillerstrasse.jpg) [the](https://www.flickr.com/photos/aceofnothing/3614873460/) [world!](https://www.urbanghostsmedia.com/2013/06/green-transport-grass-tramway-kagoshima/) ![Light rail and streetcar tramways with grass](/img/changelog/grass-tramways.png)

## August 28, 2018

- **We made this “What’s new” box.** Now you know that when something changes, we did it on purpose!
- **Added “flex zone” items,** which are modern uses of curb space that include taxi and rideshare pickup/dropoff, food trucks, bikeshare stations, and a waiting area where a guy just stands around looking at his modern portable device. ![Bike share, taxi and rideshare pickup/dropoff, food truck](/img/changelog/flex-items.png)
- **Tooltips on the street component palette** now help you differentiate between all the cars that look the same.
- **Fixed a crash bug** that sometimes happens right after moving a street component around, which is literally the worst time for it to crash.

## August 20, 2018

- **The “My streets” gallery is only accessible when you sign in.** Click on your username to see it!
- **Filled in the backstory in this “What’s new” window.** None of this text actually existed at this time, but think of it like we’re writing a prequel.

## August 10, 2018

- **Chinese localization is here!** Multilingual Streetmix continues on with both traditional and simplified Chinese. 饮胜！
- **New blog!** [Check it out here.](https://medium.com/streetmixology)
