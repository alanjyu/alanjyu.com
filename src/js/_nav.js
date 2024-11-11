export default class Nav {
    constructor() {
        // Select all nav links
        const navLinks = document.querySelectorAll('.nav__link');

        // Track the currently active link
        let currentActiveLink = document.querySelector('.nav__link__active');

        // Add event listeners to each link
        navLinks.forEach(link => {
            link.addEventListener('mouseenter', () => {
                // Remove active class from current link
                currentActiveLink.classList.remove('nav__link__active');
                // Add active class to hovered link
                link.classList.add('nav__link__active');
            });

            link.addEventListener('mouseleave', () => {
                // Remove active class from hovered link
                link.classList.remove('nav__link__active');
                // Restore active class to original active link
                currentActiveLink.classList.add('nav__link__active');
            });
        });   
    }
}