import '../css/main.scss';
import 'typeface-dm-sans';
import 'typeface-dm-serif-display';

import ThemeToggler from './components/theme-switch';
import Burger from './components/burger';
import TypeWriter from './components/type-writer';
import Carousel from './components/carousel';
import MouseTracker from './components/mouse-tracker';

const components = [
    {
        class: TypeWriter,
        selector: '.js-type-writer'
    },
    {
        class: Carousel,
        selector: '.js-carousel'
    },
    {
        class: Burger,
        selector: '.js-burger'
    },
    {
        class: ThemeToggler,
        selector: '.js-theme-switch'
    },
    {
        class: MouseTracker,
        selector: '.js-mouse-tracker'
    }
];

document.addEventListener('DOMContentLoaded', () => {
    components.forEach(component => {
        console.log(document.querySelector(component.selector));
        if (document.querySelector(component.selector) !== null) {
            document.querySelectorAll(component.selector).forEach(
                element => new component.class(element, component.options)
            );
        };
    });
});



// document.addEventListener('DOMContentLoaded', () => {
//     toggleMenu();
// //    typeWriter();
//     trackMouse();
//     switchCanvas();
// });