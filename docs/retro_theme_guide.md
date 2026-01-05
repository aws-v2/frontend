# Retro Black & White Theme Guide (Serwin Edition)

This document defines the "Retro Flat" aesthetic used in Serwin Cloud. It focuses on heavy borders, hard shadows, monochrome colors, and mixed typography.

## 1. Core Principles

- **Borders**: Heavy black borders (`4px` for containers, `2px` for components).
- **Shadows**: Hard, non-blurred offsets (`12px` for large items, `6px/8px` for smaller items).
- **Colors**: Strictly Monochrome with CSS variable support for Dark Mode.
- **Corners**: Flat (`0px`) - No rounding allowed.
- **Typography**: 
    - **Headers**: `'Architects Daughter', cursive`
    - **Body**: `'Roboto', sans-serif`
    - **Meta/Console**: `'Roboto Mono', monospace`

---

## 2. Global Styles & Variables

Implemented in `src/assets/main.css`:

```css
:root {
  --bg-main: #ffffff;
  --text-main: #000000;
  --border-main: #000000;
  --shadow-color: rgba(0, 0, 0, 1);
  --input-bg: #ffffff;
  --accent-warning: #FFD700; /* Yellow */
  --accent-info: #00F0FF;    /* Cyan */
  --accent-error: #FF4D4D;   /* Red */
}

[data-theme='dark'] {
  --bg-main: #121212;
  --text-main: #ffffff;
  --border-main: #ffffff;
  --shadow-color: rgba(255, 255, 255, 0.4);
  --input-bg: #1e1e1e;
  --accent-warning: #CCA300;
  --accent-info: #00B4CC;
  --accent-error: #990000;
}
```

---

## 3. Component Patterns

### The "Retro Box"
Standard container for cards and sections.

```html
<div class="retro-box p-8 bg-white">
  <!-- Content -->
</div>
```

### Buttons
Use the following classes for consistent retro buttons:

```html
<!-- Primary (Black background, white text) -->
<button class="btn-retro-primary">Deploy Now</button>

<!-- Secondary (White background, black text) -->
<button class="btn-retro-secondary">Cancel</button>
```

### Forms & Inputs
Inputs should always be `rounded-none` and use the mono font for values.

```html
<div>
  <label class="label-retro">Email Address</label>
  <input type="email" class="input-retro" placeholder="user@serwin.io">
</div>
```

### Toast Notifications
Pop-in notifications with heavy accent borders.

```html
<div class="bg-black text-white p-6 border-l-8 border-white shadow-[8px_8px_0_0_rgba(0,0,0,0.5)]">
  <p class="text-[10px] uppercase tracking-widest font-black opacity-50">SUCCESS</p>
  <p class="text-sm font-bold">Action completed!</p>
</div>
```

### Progress Loaders
Retro animated bars instead of spinners.

```html
<div class="loader-retro">
  <div class="loader-retro-bar"></div>
</div>
```

### Accented Banners
Banners are used for high-priority status or alerts. They use the `--accent` variables to pop from the monochrome base.

```html
<div class="banner-retro" style="background-color: var(--accent-warning);">
  <div class="badge">!</div>
  <span>CRITICAL ALERT CONTENT</span>
</div>
```

---

## 4. Layout Patterns

### Navigation
The Navbar should be sticky with a heavy bottom border and theme toggle.

```html
<nav class="border-b-4 border-black p-6 bg-[var(--bg-main)] flex justify-between items-center sticky top-0 z-50">
  <div class="text-3xl font-black uppercase tracking-tighter">Serwin</div>
  <!-- Links & Toggle -->
</nav>
```

### Dashboard Cards
Stats cards should have hover effects (e.g., `hover:invert`).

```html
<div class="retro-box p-6 bg-white group hover:invert transition-all duration-300">
  <p class="label-retro">Instances</p>
  <span class="text-4xl font-black">12</span>
</div>
```

---

## 5. Dark Mode Strategy
1. **Color Variables**: Always use `var(--text-main)`, `var(--bg-main)`, etc.
2. **Shadows**: Use `var(--shadow-color)` which softens in dark mode.
3. **Inversion**: Use Tailwind's `dark:` modifier or grouping for specific dark mode adjustments if variables aren't enough.
