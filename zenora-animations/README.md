# Zenora Hire – World Class Animations Plugin

## Installation (5 minutes)

1. Zip the `zenora-animations` folder.
2. In WordPress admin → **Plugins → Add New → Upload Plugin**.
3. Upload the zip and click **Activate**.

That's it. All animations load automatically on every page.

---

## What You Get

| Feature | How it works |
|---|---|
| **Page loader** | Branded dark screen fades out after page is ready |
| **Scroll progress bar** | Gradient bar at the very top of the viewport |
| **Custom cursor** | Accent-colour ring that follows the mouse (desktop only) |
| **Particle hero** | Connected-dot canvas background via `[zenora_particles]` |
| **Typewriter** | Cycling text via `[zenora_typewriter texts="A,B,C"]` |
| **Counters** | Count-up animation via `[zenora_counter end="500" label="Placements"]` |
| **Marquee ticker** | Infinite scrolling banner via `[zenora_marquee texts="A\|B\|C"]` |
| **3-D tilt cards** | Hover tilt + glare via `[zenora_tilt_card]...[/zenora_tilt_card]` |
| **AOS scroll reveals** | Add `data-aos="fade-up"` to any element |
| **GSAP reveals** | Headings and images auto-animate on scroll |
| **Parallax** | Add class `zenora-parallax` and `data-parallax-speed="0.2"` |
| **Morphing blobs** | Add class `zenora-blob zenora-blob-1` to a div |
| **Skill bars** | Add class `zenora-skill-bar` → child `.zenora-skill-fill` with `data-width="85%"` |
| **Timeline** | Add class `zenora-timeline` → children `zenora-timeline-item` |
| **Ripple buttons** | Add class `zenora-pulse-btn` to any `<a>` or `<button>` |
| **Back-to-top** | Appears automatically after scrolling 400 px |
| **Nav shrink** | Header gets glass blur effect on scroll |
| **Hover lift cards** | Add class `zenora-hover-lift` to any card |
| **Image zoom** | Wrap image in `<div class="zenora-img-zoom">` |
| **Gradient text** | Add class `zenora-gradient-text` |
| **Glassmorphism** | Add class `zenora-glass` |
| **Smooth anchor links** | All `href="#..."` links auto-scroll smoothly |

---

## Shortcode Quick Reference

```
[zenora_particles height="100vh"]

[zenora_typewriter texts="Find Top Talent,Build Dream Teams,Hire Smarter" speed="80"]

[zenora_counter end="500" label="Placements" suffix="+"]
[zenora_counter end="98"  label="Client Satisfaction" suffix="%" prefix="" duration="2"]

[zenora_marquee texts="We're Hiring|Top Talent|Fast Placements|Trusted Globally"]

[zenora_tilt_card]
  <h3>Your Card Title</h3>
  <p>Card content here.</p>
[/zenora_tilt_card]
```

---

## CSS Class Quick Reference

```html
<!-- Scroll reveal -->
<div class="zenora-reveal-up">...</div>
<div class="zenora-reveal-left">...</div>
<div class="zenora-reveal-right">...</div>

<!-- Staggered children -->
<div class="zenora-stagger">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<!-- AOS (any element) -->
<div data-aos="fade-up" data-aos-delay="200">...</div>

<!-- Parallax -->
<div class="zenora-parallax" data-parallax-speed="0.2">...</div>

<!-- Morphing blobs (put inside a position:relative container) -->
<div class="zenora-blob zenora-blob-1"></div>
<div class="zenora-blob zenora-blob-2"></div>

<!-- Gradient text -->
<h2 class="zenora-gradient-text">World Class Hiring</h2>

<!-- Pulse button -->
<a href="/contact" class="zenora-pulse-btn">Get Started</a>

<!-- Glass card -->
<div class="zenora-glass">...</div>

<!-- Hover lift -->
<div class="zenora-hover-lift">...</div>

<!-- Image zoom -->
<div class="zenora-img-zoom"><img src="..." /></div>

<!-- Skill bar -->
<div class="zenora-skill-bar">
  <div class="zenora-skill-fill" data-width="90%"></div>
</div>

<!-- Timeline -->
<div class="zenora-timeline">
  <div class="zenora-timeline-item"><h4>2024 – Launched</h4><p>...</p></div>
  <div class="zenora-timeline-item"><h4>2025 – 500 Placements</h4><p>...</p></div>
</div>
```

---

## Customising Colours

Edit `css/zenora-animations.css` lines 7-14 to match your brand:

```css
:root {
  --z-primary: #0a66c2;   /* main brand colour */
  --z-accent:  #00c9a7;   /* highlight / accent */
  --z-dark:    #0d1117;   /* dark background    */
}
```
