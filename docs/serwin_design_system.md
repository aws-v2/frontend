# Serwin 'Radiant' Design System

> "Build with the precision of code, scale with the power of Serwin."

This document details the visual language, color palette, and component patterns used in the new Serwin Systems interface (formerly n8n-inspired). Use this guide to replicate the premium, high-tech aesthetic across the platform.

## 1. Color Palette

The theme allows for deep contrast with vibrant, energetic accents.

### Primary Colors
| Token | Value | Usage |
| :--- | :--- | :--- |
| **`bg-void`** | `#0b0d17` | Main page background. Deep, almost black blue. |
| **`text-radiant`** | `#ff6d5a` | Primary CTA, Accents, Highlights. A warm, energetic orange-red. |
| **`text-radiant-light`** | `#ff9c8f` | Hover states, gradients. |

### Surface Colors
| Token | Value | Usage |
| :--- | :--- | :--- |
| **`surface-base`** | `#141829` | Cards, Panels, Modals. Slightly lighter than void. |
| **`surface-highlight`** | `#1f2334` | Hover states for list items or secondary cards. |
| **`border-subtle`** | `rgba(255, 255, 255, 0.05)` | Default borders. |
| **`border-glow`** | `rgba(255, 109, 90, 0.5)` | Active/Focus borders. |

---

## 2. Typography

We use **Inter** for its clean, technical legibility at all sizes.

- **Headings**: `font-bold` or `font-extrabold`. `tracking-tight` (-0.025em) for a modern, compact feel.
- **Body**: `text-slate-400` for primary text to reduce eye strain against the dark background.
- **Monospace**: `font-mono` (JetBrains Mono or standard mono) for code snippets, IDs, and technical data.

### Hierarchy
- **H1 (Hero)**: `text-5xl md:text-7xl font-bold leading-[1.1]`
- **H2 (Section)**: `text-3xl md:text-4xl font-bold`
- **H3 (Card)**: `text-xl font-bold`

---

## 3. Component Patterns

### Buttons
**Primary (The "Radiant" Button)**
```html
<button class="px-6 py-3 bg-[#ff6d5a] text-white font-bold rounded-lg 
               hover:bg-[#ff6d5a]/90 transition-all shadow-[0_0_30px_rgba(255,109,90,0.3)] hover:scale-105">
    Action
</button>
```
*Key Detail*: The `shadow-[...]` creates a "glow" effect that mimics light emitting from the button.

**Secondary (Ghost)**
```html
<button class="px-6 py-3 bg-transparent border border-white/10 text-white font-medium rounded-lg 
               hover:bg-white/5 transition-all">
    Secondary
</button>
```

### Cards (Glass/Gradient)
Cards should feel like physical panes of glass or slightly elevated surfaces.

```html
<div class="relative overflow-hidden bg-[#141829] rounded-2xl p-8 border border-white/5 group">
    <!-- Inner Gradient for Hover Glow -->
    <div class="absolute inset-0 bg-gradient-to-br from-[#ff6d5a]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    
    <div class="relative z-10">
        <!-- Content -->
    </div>
</div>
```

### The "Grid" Background
To add texture without noise, use a subtle CSS grid.

```css
.bg-grid {
    background-image: 
        linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: 40px 40px;
}
```

---

## 4. Visual Metaphors

### Nodes & Connections
Since Serwin is about infrastructure, use **Nodes** and **Lines** to represent connection.
- **Nodes**: Rounded rectangles or circles with icons.
- **Lines**: SVG bezier curves connecting nodes.
- **Animation**: Use `animate-pulse` on active nodes or connections to show "data flow".

### Gradients
Don't use flat colors for large areas. Use subtle gradients:
- **Text Gradient**: `bg-gradient-to-r from-[#ff6d5a] to-[#ff9c8f] bg-clip-text text-transparent`

---

## 5. Implementation Checklist for New Pages

1.  **Background**: Start with `#0b0d17` and add the grid texture.
2.  **Navbar**: Sticky, `backdrop-blur-lg`, `border-b border-white/5`.
3.  **Hero**: Center aligned, massive text, "Radiant" primary button.
4.  **Content**: Use the Card pattern for features.
5.  **Footer**: Simple, `border-t border-white/5`.
