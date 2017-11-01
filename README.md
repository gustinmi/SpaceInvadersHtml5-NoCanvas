# SpaceInvadersHtml5-NoCanvas
Recreation of Space Invaders game. Created with HTML5 and Javascript, without Canvas API. Only HTML5 elements and Javascript animations with the help of jQuery are used.

You can play it [here](http://invaders.mitjagustin.com/).

## Introduction
I created this recreation of famous Space Invaders game in order to learn about HTML5 game programming with keyboard. There are multiple valuable lessons learned so far:

1. How to use event throttling and why
1. How to minimaze global event handler on window object
1. How to program efectively the user interaction (for example, how to achieve, that base ship nevers leaves the viewport)

## Game design
I wanted to implement this classical game without any Canvas API. I used only HTML elements, and refitted all game chanracters and functionality simply to interaction between HTML elements. So for example, when you fire a shot, this is done in background:
1. an IMG tag is created
2. wav sound is played
3. IMG tag gets animated, the x axis stays the same, but y-axis is changing
4. Occasionaly the colision between end of vieport and invaders is checked. If we have a collision, appropriate action is fired.

Another example: all invaders characters come from special font.and this simplify things. changing the character is simply changing the word letter.

## Problems
There are still numerous problems, mainly due to browser box and content models. The playe occupied is always a square, despite the fact, that when element is drawn by the browser, it looks like we have a triangle or circle. This causes little inconvenience, that look like bug.

The mobile devices are not supported yet. 
