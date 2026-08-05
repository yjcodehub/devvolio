# UI/UX Design System & Animation Strategy

This document details the visual guidelines, component designs, and interactive motion plans designed to give the portfolio a state-of-the-art feel, resembling the visual standards of Apple, Stripe, Linear, and Vercel.

---

## 1. Visual Design System

The visual design system employs a **luxury dark theme** with high-contrast typography, interactive gradients, glassmorphism layers, and subtle grain textures.

### 1.1 Color Palette
CSS design tokens defined in the root stylesheet:

```css
:root {
  /* Core Brand Colors */
  --background: 240 10% 3.9%;      /* Extremely deep obsidian black */
  --foreground: 0 0% 98%;          /* Crisp, slightly warm white */
  
  /* Primary Gradients & Accents */
  --primary: 250 89% 65%;          /* Premium Electric Violet (Stripe-like) */
  --primary-foreground: 0 0% 98%;
  --secondary: 180 100% 50%;       /* Cyan / Neon Teal (Vercel-like highlight) */
  --muted: 240 3.7% 15.9%;         /* Muted Slate Gray */
  --muted-foreground: 240 5% 64.9%;/* Medium gray for supporting copy */
  
  /* Structural Borders & Glass */
  --border: 240 5.9% 10%;          /* Dark obsidian borders */
  --glass-bg: rgba(10, 10, 12, 0.7);
  --glass-border: rgba(255, 255, 255, 0.05);
  --glow-color: rgba(120, 99, 245, 0.15);
  
  /* Accent Cards */
  --card: 240 10% 5%;
  --card-foreground: 0 0% 98%;
}
```

### 1.2 Typography
- **Primary Body Font**: **Inter** (Google Fonts) - Clean, neutral, high-legibility geometric sans-serif for body descriptions and forms.
- **Headings & Accents**: **Outfit** (Google Fonts) - Elegant, premium geometric sans-serif with a technical look.
- **Monospace Font**: **JetBrains Mono** - Used for code terminal windows and keyboard shortcut overlays.

---

## 2. Public Website layouts

### 2.1 Hero Section: Storytelling Experience
- **Mesh Background**: Dynamic, slow-moving SVG radial gradients floating in the background, creating a glowing depth effect.
- **Split-Text Reveal**: The heading ("Yashkumar Jais") scales and fades in letter-by-letter as the scroll position starts.
- **Interactive Coding Terminal**:
  - A mock terminal card with standard Mac window controls (Red, Yellow, Green dots).
  - Displays a simulated typing session of Yashkumar querying his developer profiles:
    ```bash
    $ yash --skills --featured
    > Loading Core Engineering Proficiencies...
    [■■■■■■■■■■] 100%
    Angular, React, Next.js, TypeScript, REST API Integration
    
    $ yash --status
    > Active Frontend Engineer. Passionate about performance.
    ```

### 2.2 Interactive Timeline
- A vertical timeline mapping education and job updates.
- A glowing line grows downwards triggered by GSAP's ScrollTrigger as the user scrolls.
- Each milestone node expands with a glowing spotlight card containing bullets (Relfor Labs, Webgurukul) when it enters the viewport.

### 2.3 Special Interactive Widgets
- **GitHub Contribution Graph Widget**: Feeds from the cached backend API, displaying the classic green grid formatted as an interactive 3D grid that tilts on mouse movement.
- **LeetCode Stats Widget**: Radial progress ring displaying solved questions categorized by difficulty (Easy, Medium, Hard).
- **Now Playing Widget**: Fetches live Spotify states. Displays a small wave equalizer animation if active, otherwise shows "Offline".

---

## 3. Admin Panel Layout

### 3.1 Design Aesthetic
- High-performance, clean, grid-based minimal interface inspired by the **Linear** interface.
- Standardized dashboard cards showing key statistics: Total page views, Contact Form submissions, and server API latencies.

### 3.2 Key Views
- **Media Manager**:
  - Visual gallery of all images uploaded to Cloudinary.
  - Quick-copy link helper and single-click delete.
- **Project Editor Modal**:
  - Text fields for title, category, descriptions, and Markdown editor for detailed case studies.
  - Image drop zone utilizing `react-dropzone` with instant backend Cloudinary upload and thumbnail generation.
- **SEO Configurations Portal**:
  - Live preview card showing how the site will render in Google Search results and OpenGraph shares.

---

## 4. Animation Strategy

We create a cohesive, natural motion system where animations are responsive, lightweight, and interruptible (using spring physics).

### 4.1 Lenis Smooth Scroll Configuration
To integrate GSAP ScrollTriggers smoothly, we enforce Lenis smooth scrolling globally:

```typescript
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Smooth exponential deceleration
  orientation: 'vertical',
  gestureOrientation: 'vertical',
  smoothWheel: true,
  wheelMultiplier: 1,
  touchMultiplier: 2,
  infinite: false,
});
```

### 4.2 GSAP ScrollTrigger Timelines
Used for scroll-driven page elements:
- **Pinning Hero**: As the user scrolls, the hero section pins for 100vh, shrinking the terminal window and scaling up the main developer tagline.
- **Timeline Progress**: The timeline line length maps directly to scroll progression.

### 4.3 Framer Motion Micro-Interactions
- **Page Transitions**: Custom route transition wrappers:
  ```typescript
  export const pageTransitionVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, y: -15, transition: { duration: 0.3 } }
  };
  ```
- **Magnetic Buttons**: Applied to navigation links and social icons. The button moves toward the cursor inside a 30px boundary to make buttons feel interactive and magnetic.
- **Spotlight Cards**: Mouse move listener updates absolute coordinates of a radial gradient background overlaying the card, creating a spotlight effect that follows the user's cursor.
