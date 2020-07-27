import Bounds from 'bounds.js';

export default class Boundary {
    constructor() {
        console.log('running');
        this._boundary = Bounds({
            margins: {
                bottom: 400
            }
        });

        this._gallery = document.querySelectorAll('[data-src]');
        this._gallery.forEach(img => {
            console.log(img);
            this._boundary.watch(img, this.loadImage(img));
        })

    }

    loadImage(image) {
        return () => {
            image.src = image.dataset.src;
        }
    }
}