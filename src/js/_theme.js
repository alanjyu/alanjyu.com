export default class Theme {
  constructor() {
    const themeCheckbox = document.getElementById('checkbox');
    const savedTheme = localStorage.getItem('theme');
    const themeToApply = savedTheme || getSystemTheme();

    // Apply the theme
    document.documentElement.setAttribute('data-theme', themeToApply);

    // Set checkbox state based on applied theme
    themeCheckbox.checked = themeToApply === 'dark';
    
    // Get the system's theme preference
    const getSystemTheme = () => {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };
    
    // Toggle theme and save preference
    themeCheckbox.addEventListener('change', () => {
      const newTheme = themeCheckbox.checked ? 'dark' : 'light';
    
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      console.log(localStorage.getItem('theme'))
    });      
  }
}