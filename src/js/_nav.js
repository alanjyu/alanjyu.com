export default class Nav {
    constructor() {
        this.navBurger = document.querySelector('.burger');
        this.navBurgerInner = document.querySelector('.burger__inner');
        
        this.navMenu = document.querySelector('.nav__menu'); 
        this.navList = document.querySelector('.nav__list');
        this.navLinks = document.querySelectorAll('.nav__list > li > a');
        this.navLinkDefault = this.navList.querySelector('.link--default');
        this.navRect = document.querySelector('.nav__rect');

        this.setRectToLink(this.navLinkDefault);

        this.navBurger.addEventListener('click', () => {
            this.navBurgerInner.classList.toggle('burger__inner--active');
            this.navMenu.classList.toggle('nav__menu--visible');
        });

        this.navLinks.forEach(link => {
            link.addEventListener('mouseenter', () => {
                // apply to a slower transition only when other links are hovered
                this.navRect.style.transition = 'transform var(--animation-time)';
                this.setRectToLink(link);
            });

            link.addEventListener('mouseleave', () => {
                this.setRectToLink(this.navLinkDefault);
            });
        });
    }

    setRectToLink(linkElement) {
        const linkRect = linkElement.getBoundingClientRect();
        const navListRect = this.navList.getBoundingClientRect();

        const offsetX = linkRect.left - navListRect.left;

        this.navRect.style.transform = `translateX(${offsetX}px)`;
    }
}
