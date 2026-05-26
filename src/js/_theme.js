export default class Theme {
  constructor() {
    const themeToggle = document.querySelector('#theme-toggle');
    const storedTheme = localStorage.getItem('theme');

    // check the system theme
    const getSystemTheme = () => {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    // check if storedTheme exists, if not use the system theme
    const themeToApply = storedTheme ? storedTheme : getSystemTheme();

    // apply the theme
    document.documentElement.setAttribute('data-theme', themeToApply);
    
    // add click listeners to all theme buttons
    themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    });
  }
}