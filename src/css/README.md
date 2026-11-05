# Stylesheet organization

The seven root `.scss` files are page entry points referenced by HTML. They compose
modules in cascade order; put selector rules in a partial rather than an entry point.

| Folder | Owns | Examples |
| --- | --- | --- |
| `abstracts/` | Sass variables, maps, functions, and mixins; emits no CSS | Spacing, breakpoints, acrylic effects, container mixins |
| `base/` | Global defaults and theme foundations | Reset, fonts, site theme, shared keyframes |
| `layout/` | Shared page structure | Navigation, footer, section and container classes |
| `components/` | Reusable UI independent of a particular page or app | Cards, panels, subtitles, tooltips, hover treatments |
| `features/` | Styles owned by a particular page or experience | Home sections, gallery, resume timeline, fluid background, Clef, synth |

Choose ownership by purpose, rather than selector size. A generic panel belongs in
`components/`; the Clef settings panel belongs in `features/clef/`. Shared navigation
belongs in `layout/`. Feature-local layout files stay with their feature because
they describe that feature's internal structure.

## Naming and imports

- Use lowercase names with hyphens for multiple words, such as `_paper-texture.scss`.
- Prefix partials with `_`; only root page entry points compile to page stylesheets.
- Use `_index.scss` to compose a feature or foundation, imported as `@use "base"`
  or `@use "features/clef"`. Keep these files focused on imports.
- Use descriptive responsibilities such as `_theme.scss`, `_layout.scss`, and
  `_keyboard.scss`; avoid generic names such as `_style.scss`.
- Use `@use` with explicit namespaces for helpers. The existing variables module
  uses `as *`; keep shared design values in `abstracts/_variables.scss`.
- Keep breakpoint rules and interaction states beside the selector they affect.
- Keep feature-only materials and helpers with their feature, such as Clef's
  `_buttons.scss`. Promote them to `abstracts/` when they become shared.

`abstracts/_layout.scss` contains geometry mixins without global selectors.
`layout/_structure.scss` emits `.section`, `.container`, `.sticky`, and `.fullframe`.
Load the latter explicitly from page or feature entry points when those classes
are needed. Importing a mixin should not silently add unrelated global styles.

Import order is intentional. Sass emits a module once per compilation, where it
is first loaded; moving an import can change the cascade. The feature entry points
preserve the existing order, including the position of shared layout classes.

## Feature map

- `clef/`: `_theme` owns page defaults, `_background` the ambient room lighting,
  `_layout` the sheet/piano arrangement,
  `_staff` notation, `_piano` the housing and panel slots, `_keyboard` playable keys,
  `_buttons` shared button mixins, `_controls` toolbar/settings/install controls,
  and `_results` challenge results and statistics.
- `synth/`: `_theme` owns material variables, `_layout` the instrument frame,
  and the remaining partials each own a named instrument module.
- `home/`: `_mixins` shares section treatments; `_hero`, `_banner`, and `_page`
  own the corresponding sections and page spacing.

## Validation

Run `npm run check:styles` to compile every page in memory and confirm that
`abstracts/` emits no CSS. This does not write production assets to `docs/`.
Use `git diff --check` to catch whitespace errors.

Keep CSS asset URLs consistent with the root page stylesheets and Parcel's current
resolution. Moving a partial deeper is not a reason to add `../` segments to an
existing working asset URL. Check asset loading through Parcel when changing URLs.
