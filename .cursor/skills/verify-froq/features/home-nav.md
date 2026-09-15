# Home navigation

Home is the froQ landing: identity, doors into Essays / Journal / Cabinet / Dashboard, a scraps fold, and in-prose links to contact and stack. From any inner page, `← home` returns here.

## Sub-features

- `home-identity` shows the froQ mark and landing copy.
- `home-sections` opens Essays, Journal, Cabinet, and Dashboard from the landing rail.
- `home-scraps` scrolls to the scraps region and back to landing.
- `home-stack` opens Stack from the landing prose.
- `home-return` returns to `/` via `← home`.

## How to get to it (user POV)

- Open `/`.
- Choose `Essays`, `Journal`, `Cabinet`, or `Dashboard` in the `Sections` rail.
- Choose `contact` or `stack` in the landing prose.
- Choose `Scroll to scraps`, then `Back to landing`, on the home mast.
- From any inner page, choose `Home` (`← home`).

## Driving it with control-froq

Preconditions:

- froQ is healthy at `http://127.0.0.1:4317`.
- `control-froq doctor` reports `doctor=ok`.
- The browser starts at `/`.

- **Identity.** Open `/`. Navigate to `$(control-froq url)/`. The accessibility tree contains heading or text `froQ` and a navigation named `Sections`.
- **Essays door.** Choose `Essays`. Click the link named `Essays`. The URL is `/essays` and a heading `Essays` is visible.
- **Return.** Choose `Home`. Click the link named `Home`. The URL is `/` and `Sections` is visible again.
- **Journal door.** Choose `Journal`. Click the link named `Journal`. The URL is `/journal` and a heading `Journal` is visible. Return via `Home`.
- **Cabinet door.** Choose `Cabinet`. Click the link named `Cabinet`. The URL is `/cabinet` and a heading `Cabinet` is visible. Return via `Home`.
- **Dashboard door.** Choose `Dashboard`. Click the link named `Dashboard`. The URL is `/dashboard` and a heading `Dashboard` is visible. Return via `Home`.
- **Stack.** Choose `stack` in the landing copy. Click the link named `stack`. The URL is `/stack` and a heading `Stack` is visible. Return via `Home`.
- **Scraps.** On `/`, choose `Scroll to scraps`. Click the button named `Scroll to scraps`. A region named `Scraps` is in view. Choose `Back to landing`. Click the button named `Back to landing`. The landing `Sections` rail is in view again.
- **Proof.** Save ARIA and screenshot of `/` with `Sections` visible to `/tmp/verify-froq/artifacts/home-nav/home.aria.txt` and `home.png`. Save `/essays` after the Essays click as `essays.png`.

## Gotchas

- The logo is an SVG; the accessible name is the sr-only text `froQ`, not a visible heading.
- Section accessible names include the note. Match that or a prefix of `Essays`, `Journal`, `Cabinet`.
- Landing prose (`contact`, `stack`) is held invisible by the text stream for a beat. Wait until those links appear in the snapshot, or open `/contact` and `/stack` directly and still record the home entry as untried if you did not click it.
- A click on a rail link may focus without navigating. If the URL is still `/`, press Enter on the focused link.
- `Scroll to scraps` becomes `Back to landing` after the scraps mast sticks. Do not look for both names at once.
- Home has no `← home` link. That control exists only off `/`.
- Footer `github` is an external tab. Do not treat it as an in-app route.
- Do not click scrap reaction buttons (`React to …`).
