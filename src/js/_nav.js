export default class Nav {
    constructor() {
        const navBurger = document.querySelector('.burger-wrapper');
        const navLinks = document.querySelectorAll('.nav__link');
        let currentActiveLink = document.querySelector('.nav__link__active');

        navBurger.addEventListener('click', () => {
            document.querySelectorAll('.burger').classList.toggle('burger__active');
        });

        navLinks.forEach(link => {
            link.addEventListener('mouseenter', () => {
                currentActiveLink.classList.remove('nav__link__active');
                link.classList.add('nav__link__active');
            });

            link.addEventListener('mouseleave', () => {
                link.classList.remove('nav__link__active');
                currentActiveLink.classList.add('nav__link__active');
            });
        });
    }
}