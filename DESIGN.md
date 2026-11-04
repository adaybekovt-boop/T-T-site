# DESIGN.md

## Position

The page is a night-sky observation of the T&T Labs mark. The two discs of
the logo rise over a planet horizon and slowly cross, like an eclipse, and the
copper light on the horizon dims as they overlap. Everything below that hero is
a quiet, well-set directory of real projects on warm paper, with the same copper
light used only where it describes something (the logo, a project plate, a focus
ring). The Games section goes to night because the game it shows is set in the dark.

## Why this is not an Anthropic cliché

The brief explicitly asked for an Anthropic-inspired direction and supplied five
references with cream paper, serif headings and copper light. Each of those
choices is anchored in the mark, not taken from the prior:

- **Cream & Terracotta (briefed, then constrained).** The copper is the copper
  disc of the T&T Labs logo, sampled from the supplied artwork, not a generic
  terracotta. The paper is the warm off-white of the reference set. We do *not*
  use Instrument Serif / Fraunces, we do not set a full sentence at hero size,
  and the hero headline is the company name in roman. Italic appears once per
  section heading, on the word that carries the information, as in the references.
- **Not Cyber-Dark.** The Games section is dark, but it is a violet-tinted night
  (`--night`) taken from the game reference, with no acid accent, no mono display,
  no scanlines or status dots.
- **Not Broadsheet.** Cards and plates keep a real radius scale, there are no
  dense columns, no masthead, no numbered section labels (`01 / SKILLS` from the
  references was removed: the order is not information).

## Color tokens

| Token | Value | Job | Origin |
|---|---|---|---|
| `--paper` | `oklch(0.955 0.010 70)` / `#F3EFE9` | page surface | reference paper, tinted toward the copper hue |
| `--ink` | `oklch(0.235 0.010 50)` / `#231F1C` | primary text, primary button | the charcoal of the discs' overlap |
| `--mute` | `oklch(0.500 0.014 55)` / `#6C645D` | secondary text, captions (≥ 4.5:1 on paper) | ink mixed into paper |
| `--copper` | `oklch(0.660 0.170 45)` / `#E2692B` | the mark, project plates, focus ring | the copper disc of the logo |
| `--line` | `oklch(0.880 0.012 65)` / `#DDD5CB` | hairlines, card borders | paper darkened |
| `--night` | `oklch(0.205 0.012 310)` / `#1D1A1F` | Games section, project plates | the dusk of the game reference |

The mark's artwork (`components/Logo.tsx`, `app/icon.svg`)
keeps its own gradient stops: those are the logo, sampled from the supplied
artwork, not UI colors. No component outside the mark uses a raw hex.

Derived (not new hues): card surface = `color-mix(--paper, white 45%)`; text on
night = `--paper`; hero sky = `color-mix(--paper, --copper 12–30%)`. Copper text
is never used for body copy (contrast); text on copper never occurs.

## Type roles

| Role | Family | Weights | Size | Tracking | Used for |
|---|---|---|---|---|---|
| Display | EB Garamond | 400, 500, italic 400 | `clamp(2.6rem, 1.4rem + 4.2vw, 5.4rem)` sections; `clamp(3.6rem, 1.6rem + 8vw, 9rem)` hero | -0.02em | wordmark, hero name, section headings, project names |
| Body | IBM Plex Sans | 400, 500 | 16–19px | 0 | paragraphs, navigation, buttons, descriptions |
| Data | IBM Plex Mono | 400 | 13px | 0 | repository paths only (they are code-like) |

Why: the references set headings in a Garamond-class serif and the wordmark in
the logo is a book serif; EB Garamond matches the logo's proportions better than
Instrument Serif or Fraunces and is never used for full paragraphs. IBM Plex Sans
is an engineering face with a slightly mechanical rhythm, which suits a team
that ships developer tools, and it is what the reference navigation uses.
Minimum UI text is 12px.

## Radius scale

| Token | Value | Used on | Not used on |
|---|---|---|---|
| `--r-0` | 0 | hairlines, the horizon | anything clickable |
| `--r-sm` | 6px | small tags, code chips | cards |
| `--r-md` | 14px | cards, plates, banners | buttons |
| `--r-pill` | 999px | buttons and the nav action (as in the references) | cards, images |

Elevation: hairline borders on paper; no drop shadows except the copper light
inside illustrations.

## Density

Editorial for the hero and story (base unit 8px, section padding 120–160px on
desktop); regular for the project directory (card gutters 20px).

## Motion philosophy

Revised on the client's request: the site should feel more animated, on phones
too, without the page ever jumping. Every animation moves only `opacity` and
`transform`, so nothing reflows.

- Home: one still picture (the eclipse over a planet, hills, a river at dusk)
  in a window; the three story screens over it only fade in once, like every
  other section. No pinning, no scroll-driven animation.
- Touch & feel (client asked for a site you can "touch"):
  - the pointer (or a finger) is a warm spark that lights the home picture;
  - cards tilt toward the mouse with a glare; on phones the card in the middle
    of the screen plays its drawing the way hover does on desktop;
  - View projects and GitHub lean toward the mouse;
  - the story ends with a toy: drag the copper disc onto the grey one; when they
    meet in the eclipse of the mark the sky darkens and "T&T Labs" lights up.
  Mouse effects are off under reduced motion; the toy works with arrow keys.
- Section headings rise line by line, and cards rise in a short stagger, when
  they scroll into view (`data-reveal`, `components/RevealObserver.tsx`).
- Route changes cross-fade through React `<ViewTransition>` (`PageTransition`).
- Hover (pointer devices only): border darkens, art zooms inside its frame,
  arrows nudge, plate drawings show what the product does. Touch: a light
  press response instead, so no hover state sticks on a phone.
- Mobile menu overlays the page (it never pushes content down) and its links
  stagger in.
- Lazy loading: project drawings mount when near the viewport (`LazyMount`),
  images are lazy `next/image` over a shimmer (`FadeImage`); each route has a
  `loading.tsx` skeleton with the same grid as the page.

Still forbidden: parallax, scroll hijacking (the story pins, it never takes over the wheel), marquees, particles, hover scale
on whole cards, loading screens. `prefers-reduced-motion: reduce` shows
everything in place: no reveals, no page transitions.

## Surface and grain

- Home picture: `public/images/hero/landscape.webp`, supplied by the client
  (860 x 1828). It is upscaled on wide screens; a larger original would be sharper.
- Film grain on pictures only (`.grain-on`: plates, illustrations, screenshots,
  the home picture), never on the page background, as in the reference.
- Revised at the owner's request: a moving film grain also covers the whole
  page (`.film-grain` in `components/LiveLayer.tsx`), jittering at ~11 fps like
  projected film; it stops under reduced motion.

## Hands-on layer

`components/LiveLayer.tsx` (tilt and magnet stay in `Interactions.tsx`):
- Elastic drag: any heading, paragraph, list row or card can be pulled. It
  follows with rubber-band resistance (90px at most) and springs back with one
  overshoot. A drag never opens the link beneath it. The eclipse toy is excluded.
- Text cannot be selected or copied (code and form fields excepted).

## Signature

Name: The eclipse horizon.

What it is: the logo's two discs, large, resting on a lit planet horizon.
They drift into and out of overlap; the overlap is computed each frame and the
copper rim light on the horizon follows it.

Why a competitor cannot steal it: it is the T&T Labs mark itself, behaving
like the eclipse it depicts. Without the mark it is just a planet.

What stays quiet: every other section uses flat paper, hairlines and serif
headings. No other section contains a planet, orb or glow.

## Layout concept

Four screens, as in the references. Home is the hero plus the team's
philosophy; each division has its own route.

```
/              one picture in a rounded window with paper around it
               (public/images/hero/landscape.webp, grain on top), and the story
               over it, top to bottom:
                 hero: "We build tools, apps and games." + View projects (-> /skills),
                       on the pale sky, the picture's eclipse beside it
                 then the story in three screens on the dark hills (lib/story.ts):
                 "It began with something small." / "One light caught another." /
                 "When two orbits meet, the sky changes." ... "T&T Labs"
               nothing else: the divisions are reached from the header only
/skills        "Skills for AI agents."  four plates -> GitHub
/applications  "Software for Windows and industry."  IZDAR lead + two plates
/games         night. "One game, in development."  one wide SVG plate -> game page
               (eclipsed sun over Aktobe panel blocks; screenshots stay on the
               game's own page)
```

Copy rule (client): one heading, one sentence, a clean card, a click. No
eyebrows (`01 / SKILLS`, "INDUSTRIAL SOFTWARE", "Dark fantasy · Godot"), no
native-name subtitles, no side captions that repeat the heading, no footer
captions under banners.

## Content model

```
BLOCK: Hero
JOB:   know whose site this is and get to the projects
SHAPE: the company name, one factual sentence, one button, the animated mark
NOT:   a slogan headline, two CTAs, a play button for a non-existent video
```

```
BLOCK: About (philosophy)
JOB:   understand who the team is and where it came from, without spin
SHAPE: two-line heading, three-sentence paragraph, then a directory band that
       lists every project by division (it doubles as the site index)
NOT:   a decorative banner image, values grid, team photos, milestones
```

```
BLOCK: Skills
JOB:   pick one of four agent skills and open its repository
SHAPE: four plates of equal weight (they are four equal kinds of object:
       public repositories for coding agents) with a product-specific
       illustration, platform tag, one factual line and the repository path
NOT:   icon + heading + paragraph tiles; "Learn more" buttons
```

```
BLOCK: Applications
JOB:   open the right product page
SHAPE: one lead plate (IZDAR has a real website, the most verified content
       and an industrial subject) and two smaller plates stacked beside it
NOT:   three equal cards, links to GitHub
```

```
BLOCK: Games
JOB:   see the game and open its page
SHAPE: one wide plate with the game's own art on a night background
NOT:   a carousel, a fake trailer, a release date
```

```
BLOCK: Product page (VeloBoost, MyPC, game)
JOB:   understand what the product does and where to get it
SHAPE: name, one-paragraph description, a short verified fact list, the
       source link, a link back to the division
NOT:   a marketing landing with feature grid and download counters
```

## Uniqueness tests

1. Swap logo, name and two accent colors: still plausible for another company?
   - Answer: the directory sections alone could be; the hero cannot, because
     the illustration *is* the logo and its overlap drives the light. The
     project plates show Roblox asset grids, Luau, Blender meshes, emission
     journals: content no other company has.
   - Change made before code: removed the reference's generic copper-silk banner
     in About and replaced it with the real project index.
2. Would this palette / pairing / layout appear for a generic "modern SaaS" prompt?
   - Answer: cream + serif would appear for the *Anthropic-like* prompt, which is
     what the brief asked for. The difference is that copper only appears where
     the mark's light is, and the headline is a name, not a sentence.

## Domain artifact on the page

The T&T Labs mark rendered as a live eclipse over its own horizon, plus the
real repository paths on every Skill plate.

## States

- [x] empty: not applicable to a static directory; every list has fixed content
- [x] error: custom 404 with links back into the directory
- [x] loading: static pages; images have intrinsic sizes, no spinners
- [x] overflow: long names (`LuauAISkill`, `IZDAR Industrial`) wrap; repository
      paths break anywhere on narrow screens
- [x] mobile ~390: single column, menu disclosure, no horizontal scroll
- [x] `:focus-visible`: 2px copper ring with 3px offset on paper and on night
- [x] `prefers-reduced-motion`: static discs, no smooth scroll, no transitions

## Anti-slop audit (after build, against slop-patterns-2026.md)

Screenshots reviewed at 1600×900, 1440×900, 768×1024 and 390×844, plus hover,
keyboard focus, mobile menu, product pages and 404.

```
WAVE-1 hits:   none. (#3 no pure white; #5 no shadows; #6 the four Skill plates are
               equal because they are four equal repositories, each with a distinct
               drawing, not icon+heading+sentence; #11 no left rails; #13 Applications
               is one lead plate + two subordinates sized by content, not a bento;
               #14 the Luau fragment is the product's subject, not a fake terminal;
               #19 radius is a scale: 6 / 14 / pill; #25 arrows are static;
               #28 hover changes border + illustration state, no lift or scale)
WAVE-2 hits:   A (cream + serif + copper) — briefed by the client and anchored to the
               logo; not counted as a default. Mitigations: roman hero name instead of
               an italic sentence, no tracked mono eyebrows (12px+ sentence-case
               labels only on plates), copper limited to the mark and plates.
COPY hits:     none. No slogans, no invented numbers (3,604 comes from the TKRS index),
               no testimonials, no em-dash cadence. Every button names its result.
SKELETON hit:  no (no logos, metrics, quotes, pricing, FAQ, final CTA)
INTERCHANGEABLE at greyscale: no — the eclipse over the horizon is the logo itself
DOMAIN ARTIFACT on the page: yes — the live mark; Roblox asset grid, Luau code,
               Blender mesh, emission readings; real game screenshots
SIGNATURE still singular: yes — only the hero moves on its own
STATES: 404, overflow (repo paths wrap), 390px no horizontal scroll, focus-visible,
        reduced motion (discs static, verified), mobile menu (Esc / outside click)
MOTION jobs:   disc crossing -> overlap area dims the horizon (it is an eclipse);
               load sequence -> name, sentence, action in reading order;
               header color -> tells you the page under it changed;
               plate hovers -> TKRS search match moves, wait() becomes task.wait(),
               mesh turns, priority ring fills and returns (reversible), screen locks.

VERDICT: ship
```

Changes made because of the audit: removed the tiled planet surface texture
(tile seams, and it competed with the signature; later replaced by a single
seamless relief, see below), removed the decorative ring and
monitor drawings from the VeloBoost and MyPC pages (they only repeated the
home-page cards), switched internal "Product page" arrows from ↗ to →, made the
header solid as soon as the page scrolls.

## Chanel check

Removed before shipping: the vertical scroll-line in the hero, the play button,
the "OUR APPROACH ↗" link with no destination, all `01 / 02 / 03` labels, the
footer captions under About and Games, and the second hero button.
