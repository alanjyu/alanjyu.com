import Bounds from 'bounds.js';

export default class Boundary {
    constructor() {
        this._boundary = Bounds({
            margins: {
                bottom: 400
            }
        });

        this._gallery = document.querySelectorAll('[data-src]');
        this._gallery.forEach(img => {
            this._boundary.watch(img, this.loadImage(img));
        })
    }

    loadImage(image) {
        return () => {
            image.src = image.dataset.src;
        }
    }
}