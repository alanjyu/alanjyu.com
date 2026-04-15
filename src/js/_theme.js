export default class Theme {
  constructor() {
    const themeButtons = document.querySelectorAll('.nav__theme-btn');
    const savedTheme = localStorage.getItem('theme');
    const backgrounds = document.querySelectorAll('.fullframe');

    // check the system theme
    const getSystemTheme = () => {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    // check if savedTheme exists, if not use the system theme
    const themeToApply = savedTheme ? savedTheme : getSystemTheme();

    // apply the theme
    document.documentElement.setAttribute('data-theme', themeToApply);
    this.toggleBackgroundDarken(themeToApply, backgrounds);
    
    // Add click listeners to all theme buttons
    themeButtons.forEach(themeButton => {
      themeButton.addEventListener('click', () => {
        // Remove rotating class from all buttons first
        themeButtons.forEach(btn => btn.classList.remove('rotating'));
        
        // Add to clicked button
        themeButton.classList.add('rotating');
        
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.toggleBackgroundDarken(newTheme, backgrounds);

        setTimeout(() => {
          themeButtons.forEach(btn => btn.classList.remove('rotating'));
        }, 400);
      });
    });      
  }

  toggleBackgroundDarken(theme, backgrounds) {
    // darken backgrounds by adding .background--darken
    backgrounds.forEach(background => {
      if (theme === 'dark') {
        background.classList.add('filter--darken');
      } else {
        background.classList.remove('filter--darken');
      }
    });
  }
}