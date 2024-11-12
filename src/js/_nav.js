export default class Nav {
    constructor() {
        const navBurger = document.querySelector('.burger');
        const navBurgerInner = document.querySelector('.burger__inner');
        const navMenu = document.querySelector('.nav__menu'); 
        const navLinks = document.querySelectorAll('.nav__list > li');
        let currentActiveLink = document.querySelector('.highlight');
        
        navBurger.addEventListener('click', () => {
            navBurgerInner.classList.toggle('burger__inner--active');
            navMenu.classList.toggle('nav__menu--visible');
        });

        navLinks.forEach(link => {
            link.addEventListener('mouseenter', () => {
                currentActiveLink.classList.remove('highlight');
                link.classList.add('highlight');
            });

            link.addEventListener('mouseleave', () => {
                link.classList.remove('highlight');
                currentActiveLink.classList.add('highlight');
            });
        });
    }
}