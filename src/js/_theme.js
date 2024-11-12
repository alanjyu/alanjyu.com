export default class Theme {
  constructor() {
    const themeCheckbox = document.querySelector('#checkbox');
    const savedTheme = localStorage.getItem('theme');
    const backgrounds = document.querySelectorAll('.fullframe');

    console.log(backgrounds)

    // check the system theme
    const getSystemTheme = () => {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    // check if savedTheme exists, if not use the system theme
    const themeToApply = savedTheme ? savedTheme : getSystemTheme();

    // apply the theme
    document.documentElement.setAttribute('data-theme', themeToApply);
    themeCheckbox.checked = themeToApply === 'dark';
    this.toggleBackgroundDarken(themeToApply, backgrounds);
    
    themeCheckbox.addEventListener('change', () => {
      const newTheme = themeCheckbox.checked ? 'dark' : 'light';
  
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      this.toggleBackgroundDarken(newTheme, backgrounds);
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