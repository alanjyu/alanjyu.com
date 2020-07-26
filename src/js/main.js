import '../css/main.scss';
import 'typeface-dm-sans';
import 'typeface-dm-serif-display';

// import ThemeToggler from './components/dark-mode';
import {toggleTheme} from './components/dark-mode';
import {toggleMenu} from './components/burger';
import {typeWriter} from './components/type-writer';
import {switchCanvas} from './components/carousel';
import {trackMouse} from './components/mouse-track';

console.clear();

// const components = [
//     {
//         class: ThemeToggler,
//         selector: '.js-theme-switch'
//     },    
// ]

// components.forEach(component => {
//     if (document.querySelector(component.selector) !== null) {
//         document.querySelectorAll(components.selector).forEarch(
//             element => new component.class(ele, compoment.options)
//         );
//     };
// });

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