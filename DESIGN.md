# Design notes — myanmardev.com

Typography-driven, mobile-first, neutral grayscale + one warm accent. WCAG AA
contrast. Lighthouse-friendly (no heavy client JS). Images from `public/images/`.

## Accent color: warm amber / gold

**Why:** Myanmar is the "Golden Land" — amber/gold evokes that identity and reads
warm and welcoming rather than corporate-cold or hype-blue. It pairs cleanly
with a neutral gray UI and gives the brand a distinct, memorable presence.

Palette (Tailwind `accent.*`, an amber ramp):

| Token      | Hex       | Use                                           |
| ---------- | --------- | --------------------------------------------- |
| accent-50  | `#fffbeb` | hero card bg, notice banners                  |
| accent-100 | `#fef3c7` | tag bg, highlighted row bg                    |
| accent-300 | `#fcd34d` | hero card border, OG accents                  |
| accent-500 | `#f59e0b` | card hover border, status indicators          |
| accent-600 | `#d97706` | primary button bg                             |
| accent-700 | `#b45309` | links, primary button hover, headings accents |
| accent-800 | `#92400e` | link/button hover text on light               |

Contrast: accent-700/800 on white and white on accent-600 both meet WCAG AA for
normal text. Body text is `gray-800` on white (AAA).

## Theme tokens (CSS custom properties)

### Light mode
| Variable        | Value                         |
| --------------- | ----------------------------- |
| `--base`        | `#F4F2ED`                     |
| `--surface`     | `#FFFFFF`                     |
| `--ink`         | `#141414`                     |
| `--accent`      | `#d97706` (accent-600)        |
| `--accent-dim`  | `#b45309` (accent-700)        |
| `--muted`       | `#6B7280`                     |
| `--wash`        | `#EAE7DF`                     |
| `--rule`        | `#D6D2C8`                     |
| `--border`      | `#D6D2C8`                     |

### Dark mode (`[data-theme='dark']`)
| Variable        | Value                         |
| --------------- | ----------------------------- |
| `--base`        | `#141414`                     |
| `--surface`     | `#1a1a1a`                     |
| `--ink`         | `#F4F2ED`                     |
| `--accent`      | `#d97706` (accent-600)        |
| `--accent-dim`  | `#f59e0b` (accent-500, lighter for dark) |
| `--muted`       | `#8a8a8a`                     |
| `--wash`        | `#1e1e1e`                     |
| `--rule`        | `#2a2a2a`                     |
| `--border`      | `#2a2a2a`                     |

## Font stack

- **English / Latin:** system stack —
  `system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`.
  Zero font download, instant render.
- **Display headings:** `Georgia, 'Times New Roman', serif` — classic warmth,
  no external font request.
- **Monospace (labels, stats, code):** `'SFMono-Regular', Menlo, Consolas, 'Liberation Mono', monospace`.
- **Burmese:** **Noto Sans Myanmar** (weights 400/600/700) via
  `@fontsource/noto-sans-myanmar`, self-hosted (no Google Fonts request).
  Applied on `html[lang="my"]` with slightly relaxed line-height for Burmese
  glyph stacking.

## Buttons

Brutalist style — zero border-radius, mono uppercase, small font size
(`0.6875rem`), letter-spacing `0.14em`.

| Variant       | Background    | Text        | Border           | Hover                           |
| ------------- | ------------- | ----------- | ---------------- | ------------------------------- |
| `.btn`        | `--accent`    | `--base`    | `--accent`       | `--ink` bg + `--base` text      |
| `.btn--ghost` | transparent   | `--ink`     | `--ink`          | `--ink` bg + `--base` text      |

Card hover: `--wash` background with `--accent` top border.

## Images used

| Image                         | Where              | Purpose                    |
| ----------------------------- | ------------------ | -------------------------- |
| `images/logo/myanmardev-logo.svg` | Header           | Brand logo                 |
| `images/logo/myanmardev-icon.svg` | Header (mobile)  | Compact icon               |
| `images/hero/hero-bg.svg`     | Hero section       | Background pattern         |
| `images/products/subdomain-card.svg`  | Products   | Subdomain product card     |
| `images/products/website-builder-card.svg` | Products | Website builder card  |
| `images/products/portfolio-card.svg`  | Products   | Portfolio product card     |
| `images/icons/trust-*.svg`    | Trust signals      | Security/instant/no-card   |
| `images/social/og-image.svg`  | Layout `<head>`    | Open Graph share image     |
| `images/dns.png`              | Hero               | DNS illustration           |
| `images/myanmar.png`          | Hero/About         | Myanmar identity image     |
| `images/banner.png`           | Hero background    | Full-width banner          |

## Spacing & layout scale

- Content widths: `max-w-3xl` (~prose), `max-w-4xl` (grid), `max-w-5xl` (header/footer/home).
- Horizontal padding: `px-5` mobile, `sm:px-6` ≥640px.
- Vertical section rhythm: `py-12` standard, `py-16/20` for the hero.
- Card padding `p-6`, radius `rounded-xl`, gap `gap-4`.

## Component inventory

| Component                    | Role                                            |
| ---------------------------- | ----------------------------------------------- |
| `layouts/Layout.astro`       | HTML shell, SEO/OG meta, fonts, theme toggle    |
| `components/Header.astro`    | Brand, primary nav, auth, theme toggle          |
| `components/Hero.astro`      | Hero banner + terminal mockup + CTA buttons     |
| `components/Products.astro`  | Product card grid with images                   |
| `components/Pricing.astro`   | Token pricing table                             |
| `components/AuthButton.tsx`  | Sign in / sign out (React)                      |
| `components/TokenBalance.tsx`| User token display (React)                      |
| `components/ThemeToggle.astro` | Sun/moon dark mode toggle                     |
