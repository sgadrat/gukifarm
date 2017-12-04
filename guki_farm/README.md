Cute invaders
=============

Grow your cute little chickens to have the cutest farm in the world! Featuring the awesome and critically acclaimed game system of loot boxes!

This game is part of the LudumDare 40, fitting to the theme **The more you have, the worse it is.**

Game design
===========

You are the owner of a little farm, growing cute chicken. Each chicken is a little tamagochi: the more you have, the more you will have to take care. On top of that, loot boxes appearing so often that you will have to open it, if only to see the screen. The more you have unopened loot boxes, the harder it is to take care of your chickens. As loot boxes drop new chickens, you are rapidly overwhelmed.

An interesting fact about the game design of this game is that it sets no goal. You cannot lose, you cannot win, there is not even any scoring. Yet, the overwhelming number of actions to do suffice to put the player in a rush for self stated goals (mainly keeping the chickens alive).

Technical performances
======================

To move, chickens implement **steering behaviors**. It is a simple system to implement (great for game jams) featuring nice organic movements. For the chickens to not cross the fence, it is as simple as implementing a steering behavior pushing them away from it when they are near. To know how far a chicken is from a fence, the game solve the fence as a line equation of the form "ax + bx + c = 0", then compute the distance of the chicken using [this formula](https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line#Line_defined_by_an_equation).

When we started the project, we did not though we would **use maths to reduce a fence to an equation**! It is quite challenging, and we are now better at mathematics :)

Used tools
==========

We gone for a **100% Free and open source stack** for this jam. Thanks to our artist's Windows that crashed two days before the jam. So we used:

* **Ubuntu** and **Archlinux** as operating systems
* **Krita**, **The Gimp** and **Image Magick** for graphics
* **Sfxr** and **Audacity** for sound authoring
* **Vim** for code edition
* **RTGE** (home-made game engine) as the game engine

More, elsewhere
===============

Follow [@MargaritaGadrat​](https://twitter.com/MargaritaGadrat), **the artist**, on twitter

Follow [@RogerBidon​](https://twitter.com/RogerBidon), **the nerd**, on twitter
