"What else would you expect from a nerd?"

# 3ditties

![logo](https://repository-images.githubusercontent.com/479563116/39c0ac48-7294-48a4-b1f7-7f596b2ecf03)

A node.js 3D engine based on text output.
Right now it is in active development
and is not available as a module.
To see the progress with your own eyes
write `node .` in your terminal.

Movement inside the simulation is `WASD`, rotation uses `QE`,
move the floating cube up and down with `IJ` respectively.
To exit the 3D engine, type the letter `X`.

Currently supported features:
* A buildin Math library
* ... With advanced Vector and Quaternion calculations
* Camera -> Screen output conversion
* ... That means, support for multiple cameras
* Rendering using Ray Casting
* Multiple Light Sources possible
* ... Aswell as proper calculations of light level
* Several Implicit Shapes and a Composed Shape structure
* Tick System improving rendering speed and event timeline
* Keyboard Listener
* ... And already setup player controller
* Output using ASCII thickness
* ANSI Escapes for fast canvas redrawing
* FPS and Tick Skip statistics
* Well structured system of world objects


Currently working on:
* Collision system
* ... Movement collision is ready for most of the objects
* ... Rotation collision is yet not started
* Player structure

Features will be probably added in the future:
* Physics
