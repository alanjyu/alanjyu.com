import Bounds from 'bounds.js';

export default class Boundary {
    constructor() {
        this._boundary = Bounds({
            margins: { bottom: -400 }
        });

        const img = document.querySelectorAll('img');
    }
}