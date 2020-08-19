# [Alan's Portfolio](https://alanjyu.com)

## Getting Started

The source code is in [src/](https://github.com/alanjyu/alanjyu.com/tree/master/src), and the production work (what is displayed on the website) is in [docs/](https://github.com/alanjyu/alanjyu.com/tree/master/docs). I will work on comments and make codes more readable!

## Compatibility

The website is tested primiary on Edge 80+ Chrome 80+ and Safari 13+. As it does not contain any obselete code or libraries, the website should work in all evergreen browsers (No IE support because I am too hip. Sorry!).

## Dependencies

[Node.js (v12+)](https://nodejs.org/en/)

[Sass](https://www.npmjs.com/package/sass)

All modules in [package.json](https://github.com/alanjyu/alanjyu.com/blob/master/package.json).

## Installation

With Node.js and npm installed, simply clone the master branch and start coding! It will automatically install all the needed modules listed in [package.json](https://github.com/alanjyu/alanjyu.com/blob/master/package.json).

I am also using [Parcel](https://parceljs.org/) to bundle my source code to production (from [src/](https://github.com/alanjyu/alanjyu.com/tree/master/src) to [docs/](https://github.com/alanjyu/alanjyu.com/tree/master/docs)). It is very easy to set up with no configuration needed. I have setup three scripts for develeopment and production:

`npm run dev`

for development with live changes.

`npm run build`

for local production, primarily used for debugging.

`npm run publish`

for final release.

## License

This project is licensed under the terms of [MIT License](https://github.com/alanjyu/alanjyu.com/blob/master/LICENSE). You're more than welcome to fork and modify my work.
