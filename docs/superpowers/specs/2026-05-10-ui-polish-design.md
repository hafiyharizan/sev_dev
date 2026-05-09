# UI/UX Polish — Surau Elmina Valley Portal

**Date:** 2026-05-10  
**Scope:** Navbar, Banner, Pengumuman, Buletin, Galeri, globals.css  
**Constraint:** Keep original color palette, fonts, layouts, and imagery — polish only, no redesign.

---

## 1. Navbar (`app/components/Navbar/Navbar.tsx`)

### Changes
- **Dropdown component:** Replace the `Disclosure` used for the "Pautan" dropdown with Headless UI's `Menu` component. `Menu` provides native outside-click-to-close behavior that `Disclosure` lacks.
- **Nav link hover transitions:** Add `transition-colors duration-200` to all `<Link>` nav items.
- **"Hubungi Kami" button:** Add `transition-colors duration-200` to match nav link timing.
- **Mobile hamburger button:** Add `hover:bg-gray-100 rounded-md transition-colors duration-200` for tactile hover feedback.
- **Dropdown panel:** Add `ring-1 ring-black/5` subtle border outline; add enter/leave transition classes for a fade-in/out appearance.

### What stays the same
Logo, nav link labels, routing, Drawer/Drawerdata mobile components, Contactusform.

---

## 2. Banner (`app/components/Banner/index.tsx`)

### Changes
- **Mute button layout:** Move from standalone flex-row sibling of the video → absolute overlay inside the video container (`absolute bottom-3 left-3 z-10`). The video wrapper becomes `relative`.
- **Remove awkward layout:** The current `flex-col → lg:flex-row` wrapping the mute button + video creates dead space at mobile. The cleaner structure is: video container (relative) with button pinned inside.
- **Location button:** Add `hover:scale-105 transition-transform duration-200` for a subtle lift effect on hover.

### What stays the same
Video source, autoplay/loop/muted logic, `isMuted` state, hero text, surau image column.

---

## 3. Pengumuman Cards (`app/components/Aboutus/index.tsx`)

### Changes
- **Image height normalization:** Wrap each `<Image>` in a `<div className="relative h-36 w-full mb-5">` with `fill` + `object-contain` props to enforce consistent height regardless of source dimensions (currently 130px / 220px / 150px mix).
- **Card transition:** Upgrade `transition-colors` → `transition-all duration-300` for smoother multi-property animation.
- **ChevronRightIcon color:** Add `group-hover:text-white transition-colors duration-300` — currently stays blue on dark hover state.
- **"Info Lanjut" underline:** No change needed — the white pseudo-element works correctly against the `navyblue` hover background.

### What stays the same
Card data, hover background color (`hover:bg-navyblue`), card layout, heading sizes, link routing.

---

## 4. Buletin Carousel (`app/components/Articles/index.tsx`)

### Changes
- **"Lihat Buletin" button positioning:** Remove `article-img` class (uses `position: absolute; top: 225px; right: 30px` — fragile pixel values). Replace with a flex-based overlay: wrap the image in a `relative` div, position the button as `absolute bottom-3 right-3` inside it, so it anchors to the image regardless of card height.
- **Card hover lift:** Add `hover:shadow-2xl hover:-translate-y-1 transition-all duration-300` to the card wrapper div.
- **Date/label typography:** Wrap `{items.name}` and `{items.date}` in a single `<div>` with `border-t border-gray-100 pt-4 mt-4` separator; unify both to `text-sm text-gray-400`.
- **globals.css:** Remove dead rule `.nextarrow { background-color: aqua }`.

### What stays the same
Carousel settings, slide data, autoplay behavior, `react-slick` library usage.

---

## 5. Galeri Carousel (`app/components/Featured/index.tsx`)

### Changes
- **Deprecated opacity classes:** Replace `text-opacity-50` → `text-white/50` and `text-opacity-25` → `text-white/25` on the stacked headings.
- **Arrow component cleanup:** Remove the inline `style={{}}` objects from `SampleNextArrow` and `SamplePrevArrow`. Replace with a `className` string passed through props; use Tailwind utilities for background, padding, and border-radius.
- **iframe responsiveness:** Add `aspect-video` class and remove the hardcoded `height="384"` attribute — height becomes width-driven.

### What stays the same
Section background color (`bg-bgblue`), carousel data, slide content, `react-slick` settings, `bg-featured` background image.

---

## 6. globals.css Cleanup (`app/globals.css`)

### Changes
- Remove `.nextarrow { background-color: aqua }` — unused dead rule (line 222).
- Remove `.article-img` rule (lines 263–273) — no longer used after Buletin button is refactored to flex overlay positioning.

### What stays the same
All actively used CSS rules, background texture, slick carousel overrides, scroll behavior, navbar scroll state rules.

---

## Constraints Summary

| Constraint | Status |
|---|---|
| Color palette unchanged | ✅ |
| Fonts unchanged (Urbanist, Dancing Script) | ✅ |
| Section order and layout unchanged | ✅ |
| All content and imagery unchanged | ✅ |
| No new dependencies | ✅ (Menu is already in @headlessui/react) |
| No page routing changes | ✅ |
