# DealiX logo system

## Assets

- `public/brand/dealix-logo-dark.svg` — primary horizontal logo for dark surfaces.
- `public/brand/dealix-logo-light.svg` — primary horizontal logo for light surfaces.
- `public/brand/dealix-icon-black.svg` and `dealix-icon-white.svg` — icon-only marks.
- `app/icon.tsx` and `app/apple-icon.tsx` — generated PNG browser and Apple app icons using the same D mark.

The D is the symbol and first letter. Its central four-point star is negative space, so it always takes the colour of the surface behind it. The horizontal wordmark intentionally begins with `ealiX`.

## Sizing and clear space

| Use | Minimum | Recommended |
| --- | ---: | ---: |
| Horizontal logo | 104 px wide | 156–234 px wide |
| Icon only | 20 px | 24–48 px |
| Favicon | 16 px | 32 px |

Keep clear space equal to one quarter of the icon height on every side. Do not place text, borders, or controls inside that area. Below 104 px wide, use the icon only rather than compressing the horizontal mark.

## Palette

| Token | Hex | Use |
| --- | --- | --- |
| Ink | `#10131A` | light-surface logo / favicon ground |
| Paper | `#F8FAFC` | dark-surface logo |
| Acid lime | `#C7FF3A` | X accent only |
| Product night | `#080B13` | preferred dark backdrop |

The monochrome treatment uses Ink or Paper for the entire mark. The lime accent is optional and must be reserved for the X; never recolour the D or star.

## Rules

Use the supplied SVGs at their native aspect ratio. Do not add gradients, shadows, outlines, effects, alternate colours, or typography substitutions. The icon must retain its negative-space star and should be used alone for compact navigation, browser chrome, and app icons.
