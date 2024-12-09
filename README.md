# [alanjyu.com](https://alanjyu.com)

This repository stores and serves my personal website. The source code used for development is stored in [src/](https://github.com/alanjyu/alanjyu.com/tree/master/src), and the compiled code used to display the web page is stored in [docs/](https://github.com/alanjyu/alanjyu.com/tree/master/docs).

## Compatibility

The website is built with native HTML, CSS, and Javascript, and supports all major browsers based on Chromium (Chrome, Edge, etc.), WebKit (Safari) and moz (Firefox).

## Dependencies

- [Node.js](https://nodejs.org/en/)
- [Sass](https://www.npmjs.com/package/sass)
- [Parcel](https://parceljs.org/docs/)
- [package.json](https://github.com/alanjyu/alanjyu.com/blob/master/package.json) contains all required modules.

## Using Parcel

Parcel is a compiler that takes all of your files and dependencies, transforms them, and merges them together into a smaller set of static files that can serve as a web page.

To install Parcel, use `npm install -D parcel`. You may also need install some dependencies. 


The following three commands, stored in [package.json](https://github.com/alanjyu/alanjyu.com/blob/master/package.json), are set up of develeopment, production and release:

- `npm run dev` is useful for development. It serves live page on localhost.
- `npm run build` is used for debugging and local testing. It complies the source code to [docs/](https://github.com/alanjyu/alanjyu.com/tree/master/docs) with local hyperlink references.
- `npm run publish` is for the final release. It complies the source code to [docs/](https://github.com/alanjyu/alanjyu.com/tree/master/docs) but with absolute hyperlink references ("https://alanjyu.com/...").

## License

This project is licensed under the terms of [MIT License](https://github.com/alanjyu/alanjyu.com/blob/master/LICENSE).
