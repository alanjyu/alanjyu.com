export function applyTheme(theme) {
  if (theme !== 'light' && theme !== 'dark') return;
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem('theme', theme); } catch { /* The theme still changes for this visit. */ }
}

export default class Theme {
  constructor() {
    const themeToggle = document.querySelector('#theme-toggle');
    let storedTheme;
    try { storedTheme = localStorage.getItem('theme'); } catch { /* Use the system theme when storage is unavailable. */ }

    // check the system theme
    const getSystemTheme = () => {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    // check if storedTheme exists, if not use the system theme
    const themeToApply = storedTheme ? storedTheme : getSystemTheme();

    // apply the theme
    document.documentElement.setAttribute('data-theme', themeToApply);
    const syncToggle = () => {
      if (themeToggle.hasAttribute('data-clef-theme')) {
        themeToggle.setAttribute('aria-pressed', String(document.documentElement.getAttribute('data-theme') === 'dark'));
      }
    };
    syncToggle();
    
    // add click listeners to all theme buttons
    themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

      applyTheme(newTheme);
      syncToggle();
    });
  }
}
