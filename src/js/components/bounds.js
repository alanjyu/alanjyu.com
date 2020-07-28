import Bounds from 'bounds.js';

export default class Boundary {
    constructor() {
        this.boundary = Bounds({
            margins: {
                bottom: 400
            }
        });

        this.gallery = document.querySelectorAll('[data-src]');
        this.gallery.forEach(img => {
            this.boundary.watch(img, this.loadImage(img));
        })
    }

    loadImage(image) {
        return () => {
            image.src = image.dataset.src;
        }
    }
}