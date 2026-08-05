# Launch & Deployment Checklists

This document contains actionable checklists for Security, Performance, and SEO to guarantee the website is stable, safe, search-optimized, and lightning fast.

---

## 1. Security Checklist (Backend & API)

- [ ] **HTTPS Enforced**: Ensure all traffic is redirected to HTTPS at the Vercel and Railway edge levels.
- [ ] **Helmet Integration**: Set secure HTTP response headers on the Express server to prevent clickjacking and mime sniffing:
  ```typescript
  app.use(helmet());
  ```
- [ ] **CORS Settings**: Restrict CORS access. Only allow requests from Yash's specific domain and localhost (in development mode):
  ```typescript
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? 'https://yashjais.com' : 'http://localhost:3000',
    credentials: true
  }));
  ```
- [ ] **JWT Cookie Settings**: Enforce safety properties on Set-Cookie headers:
  - `httpOnly: true` (Blocks javascript access, preventing XSS-based token theft).
  - `secure: true` (Only transmits cookies over encrypted HTTPS channels).
  - `sameSite: 'strict'` (Stops browser from sending cookies in cross-site requests, blocking CSRF attacks).
- [ ] **NoSQL Injection Block**: Clean incoming user data structures (e.g. `$ne` or `mongo` operators) in request bodies:
  - Validate parameters using a request validator schema library (Zod or Joi).
- [ ] **Rate Limiting**: Protect public routes (Contact Form submission, Login) from brute-force and DDoS attacks:
  ```typescript
  import rateLimit from 'express-rate-limit';
  
  export const contactRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per window
    message: { success: false, message: 'Too many messages sent. Please try again later.' }
  });
  ```

---

## 2. Performance Checklist (Lighthouse 95+)

- [ ] **NextJS Image Optimizations**: Use Next's `<Image>` tag with preset widths and WebP format options to ensure layouts do not shift on image load (CLS minimization).
- [ ] **Dynamic Imports (Code Splitting)**: Lazy load high-overhead modules (e.g., Lottie players, Three.js/Canvas components, markdown editors) using Next's `dynamic()` helper:
  ```typescript
  const CodingTerminal = dynamic(() => import('@/components/terminal/CodingTerminal'), {
    ssr: false,
    loading: () => <TerminalSkeleton />
  });
  ```
- [ ] **CSS/Fonts Optimization**: Preload premium fonts (Outfit/Inter) utilizing `next/font/google` to optimize render block times and prevent Flash of Unstyled Text (FOUT).
- [ ] **GSAP Performance**: Clean up GSAP timelines on component unmount to prevent memory leaks:
  ```typescript
  useEffect(() => {
    const ctx = gsap.context(() => { ... });
    return () => ctx.revert(); // Reverts timelines and releases DOM node references
  }, []);
  ```
- [ ] **Lenis Smooth Scroll**: Throttle mouse scroll bindings and skip smooth scroll events on mobile devices (use native touch scroll properties) to save battery and rendering cycles.

---

## 3. SEO Checklist

- [ ] **Unique Page Titles**: Configure page metadata matching Google's optimal header length (50-60 characters).
- [ ] **Meta Descriptions**: Compelling descriptions containing target keywords under 160 characters.
- [ ] **OpenGraph/Twitter Cards**: Define default preview images for share cards:
  ```typescript
  export const metadata = {
    openGraph: {
      title: 'Yashkumar Jais | Senior Frontend Engineer',
      description: 'Portfolio showcasing 6+ years of UI engineering experience.',
      images: [{ url: '/og-image.jpg', width: 1200, height: 630 }]
    }
  };
  ```
- [ ] **Robots.txt Configuration**: Set indexing rules for public scrapers:
  ```
  User-agent: *
  Allow: /
  Disallow: /api/
  Disallow: /admin/
  Sitemap: https://yashjais.com/sitemap.xml
  ```
- [ ] **Dynamic Sitemap.xml**: Automate sitemap updates including project slug routes.
- [ ] **Structured Schema Data (JSON-LD)**: Inject schema scripts defining Yashkumar Jais's profile to improve rich-result displays in search results:
  ```json
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Yashkumar Jais",
    "jobTitle": "Frontend Software Engineer",
    "email": "lakshraj2121@gmail.com",
    "url": "https://yashjais.com",
    "sameAs": [
      "https://github.com/yjcodehub",
      "https://linkedin.com/in/yashjais97"
    ]
  }
  ```
