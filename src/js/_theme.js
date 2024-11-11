export default class Theme {
  constructor() {
    const themeCheckbox = document.getElementById('checkbox');
    const savedTheme = localStorage.getItem('theme');
    const themeToApply = savedTheme || window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';;

    // Apply the theme
    document.documentElement.setAttribute('data-theme', themeToApply);

    // Set checkbox state based on applied theme
    themeCheckbox.checked = themeToApply === 'dark';
    
    // Toggle theme and save preference
    themeCheckbox.addEventListener('change', () => {
      const newTheme = themeCheckbox.checked ? 'dark' : 'light';
    
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    });      
  }
}