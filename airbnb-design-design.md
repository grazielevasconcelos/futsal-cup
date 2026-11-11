# Airbnb DLS — Design Style Reference

```yaml
# How this file was made. Sources are first-party; nothing here is
# read from a rendered page. Full breakdown at source_page below.
method: restated-from-official-docs
confidence: medium
verified_at: unknown
source_page: https://www.designsystems.one/design-systems/airbnb-design
sources:
  - https://medium.com/airbnb-design
  - https://airbnb.com/
```

> **Unofficial, community-authored reference.** Compiled by [designsystems.one](https://www.designsystems.one). Not affiliated with, endorsed by, or sponsored by Airbnb. "Airbnb DLS" and related marks belong to their respective owners. This document describes publicly observable style attributes in original words — it contains no copied documentation, logos, icon artwork, or original token files. Always defer to the official source for canonical, current values.

**System:** Airbnb DLS
**Owner:** Airbnb
**Official documentation:** https://medium.com/airbnb-design
**Visual character:** Belong-anywhere hospitality: Cereal's rounded warmth, coral-to-pink gradients, 12px card corners, and photography doing the heavy lifting.

---

## Summary

Travel-and-stay design language built around photography and trust.

_Editorial confidence: medium. Most values are publicly documented; a few are best-effort readings of the live product. DLS is internal; values reflect the public product surface and published brand history. Field-level evidence: 0/71 claims source-linked, 0/71 dated. Confidence is not verification; validate canonical values before implementation._

[Inspect every field and its evidence](https://www.designsystems.one/api/style-spec?system=airbnb-design)

## Color tokens

| Color | Value | CSS variable | Role |
| --- | --- | --- | --- |
| Rausch / Brand | `#ff5a5f` | `--airbnb-rausch` | Historic brand coral-red |
| Gradient Pink | `#e61e4d` | `--airbnb-pink` | Current CTA gradient anchor |
| Babu Teal | `#00a699` | `--airbnb-babu` | Secondary accent |
| Hof Text | `#222222` | `--airbnb-hof` | Primary text |
| Foggy Secondary | `#717171` | `--airbnb-foggy` | Secondary text |
| White | `#ffffff` | `--airbnb-white` | Surfaces |
| Light Surface | `#f7f7f7` | `--airbnb-light` | Subtle background |
| Border | `#dddddd` | `--airbnb-border` | Hairlines |

## Typography

- **Body:** Airbnb Cereal — weights 400, 500, 600, 700 — `'Airbnb Cereal VF', Circular, -apple-system, 'Helvetica Neue', sans-serif`

## Type scale

| Step | Size | Line height |
| --- | --- | --- |
| display | `48px` | `56px` |
| heading-1 | `32px` | `36px` |
| heading-2 | `22px` | `26px` |
| body | `16px` | `24px` |
| small | `14px` | `18px` |

## Spacing

Base unit: `8px`

Scale: `8px` · `16px` · `24px` · `32px` · `48px` · `64px`

## Corner radius

| Name | Value |
| --- | --- |
| small | `8px` |
| card | `12px` |
| pill | `9999px` |

## Elevation / shadows

| Name | Value |
| --- | --- |
| card | `0 6px 16px rgba(0,0,0,0.12)` |
| floating | `0 3px 12px rgba(0,0,0,0.15)` |

## Motion

| Name | Value |
| --- | --- |
| default | `250ms cubic-bezier(0.2, 0, 0, 1)` |

## Quick start (CSS)

```css
/* Airbnb DLS — illustrative tokens, restated as CSS custom properties.
   Unofficial reference by designsystems.one; values are indicative, not
   canonical. Native dp/sp values are omitted, never silently converted.
   Official reference: https://medium.com/airbnb-design
   Reference scope: DLS is internal; values reflect the public product surface and published brand history.
   Field evidence: https://www.designsystems.one/api/style-spec?system=airbnb-design */

:root {
  /* Color */
  --airbnb-rausch: #ff5a5f; /* Historic brand coral-red */
  --airbnb-pink: #e61e4d; /* Current CTA gradient anchor */
  --airbnb-babu: #00a699; /* Secondary accent */
  --airbnb-hof: #222222; /* Primary text */
  --airbnb-foggy: #717171; /* Secondary text */
  --airbnb-white: #ffffff; /* Surfaces */
  --airbnb-light: #f7f7f7; /* Subtle background */
  --airbnb-border: #dddddd; /* Hairlines */

  /* Typography */
  --font-body: 'Airbnb Cereal VF', Circular, -apple-system, 'Helvetica Neue', sans-serif;

  /* Type scale */
  --text-display: 48px; /* line-height 56px */
  --text-heading-1: 32px; /* line-height 36px */
  --text-heading-2: 22px; /* line-height 26px */
  --text-body: 16px; /* line-height 24px */
  --text-small: 14px; /* line-height 18px */

  /* Spacing */
  --space-1: 8px;
  --space-2: 16px;
  --space-3: 24px;
  --space-4: 32px;
  --space-5: 48px;
  --space-6: 64px;

  /* Radius */
  --radius-small: 8px;
  --radius-card: 12px;
  --radius-pill: 9999px;

  /* Elevation */
  --shadow-card: 0 6px 16px rgba(0,0,0,0.12);
  --shadow-floating: 0 3px 12px rgba(0,0,0,0.15);

  /* Motion */
  --motion-default: 250ms cubic-bezier(0.2, 0, 0, 1);
}
```

## Origin

Airbnb codified its Design Language System (DLS) around 2016 — one of the earliest large-product design systems with a public voice. It has evolved through the 2022 product redesign and the introduction of Categories, while keeping the same core philosophy: photography is the hero, copy is restrained, and the system stays out of the way of the listing.

## Governance

Central design org owns DLS; Airbnb's design team publishes guidance, talks, and case studies at airbnb.design. The component implementations are internal. The system's evolution is documented through public posts and engineering talks rather than RFCs.

## Known for

- Image-first listing patterns — the listing card and gallery components are reference examples for travel and stay products.
- A coherent map-and-list dual interaction model with documented transition behavior between the two surfaces.
- Restraint — the system gets out of the way of host-supplied photos rather than competing with them.

## Underrated

- Their typography stack (Cereal, designed in-house) is a load-bearing brand asset documented with weight, size, and pairing rules.
- The booking-flow patterns — date pickers, guest selectors, price breakdowns — are well-thought-out and frequently copied without credit.

## Watch out for

- DLS assumes high-quality photography exists. Applying it to a content-light product means the visual hierarchy collapses.
- Patterns are tuned for travel transactions — host/guest dynamics, calendar booking, trust signals. Outside that domain they need real translation.

## Components worth studying

- **ListingCard** — Photo-led card with title, location, price, rating, and date-aware availability state.
- **DateRangePicker** — Calendar component with availability, minimum-stay, and price-per-night overlay — the reference for travel booking.
- **PhotoGallery** — Full-screen image viewer with caption, room-tag chips, and accessibility-friendly keyboard navigation.

## When to choose Airbnb DLS

Study Airbnb DLS if you're building travel, hospitality, marketplace, or any product where user-supplied media is the centerpiece. Don't apply it to data-heavy or copy-led products; its restraint becomes emptiness without the photos.

## Apply this style with an AI tool

Paste this into your AI coding assistant as a direction, then iterate:

> Design in the spirit of Airbnb DLS by Airbnb — Travel-and-stay design language built around photography and trust. Character: Belong-anywhere hospitality: Cereal's rounded warmth, coral-to-pink gradients, 12px card corners, and photography doing the heavy lifting. Use a primary colour near #ff5a5f, the typeface "Airbnb Cereal" (or a close equivalent), corner radius around 8px, a spacing rhythm on a 8px base. Lean into what it's known for: Image-first listing patterns — the listing card and gallery components are reference examples for travel and stay products. Match the intent, not the pixels; adapt it to my product rather than cloning it.

## Official references

- [Airbnb Design (Medium)](https://medium.com/airbnb-design)
- [Designing the future of Airbnb](https://news.airbnb.com/designing-the-future-of-airbnb/)
- [Building a Visual Language (DLS origin)](https://medium.com/airbnb-design/building-a-visual-language-behind-the-scenes-of-our-airbnb-design-system-224748775e4e)

---

_Generated by [designsystems.one](https://www.designsystems.one/design-systems/airbnb-design) — a catalogue of public design systems. Style facts are reported for reference and education; adapt them to your own product. Report issues or takedown requests via the site._
