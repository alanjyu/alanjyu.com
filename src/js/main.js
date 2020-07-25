import '../css/main.scss';
import 'typeface-public-sans';
import 'typeface-playfair-display';

import {toggleTheme} from './mod/dark-mode';
import {toggleMenu} from './mod/burger';
import {typeWriter} from './mod/type-writer';
import {switchCanvas} from './mod/carousel';
import {trackMouse} from './mod/mouse-track';

console.clear();

document.addEventListener('DOMContentLoaded', () => {
    toggleMenu();
    toggleTheme(); 
    typeWriter();
    trackMouse();
    switchCanvas();
});

window.addEventListener('load', () => {
    
});

window.addEventListener('resize', () => {
});