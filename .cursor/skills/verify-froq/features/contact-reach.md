# Contact

Contact is the reach sheet: email, WeChat copy, X, and public find-me links. A visitor can read handles and copy WeChat without leaving the page.

## Sub-features

- `contact-open` opens Contact from home prose or `/contact`.
- `contact-email` shows the mailto handle.
- `contact-copy-wechat` copies `_froq_` from the WeChat control.
- `contact-home` returns via `← home`.

## How to get to it (user POV)

- From home, choose `contact` in the landing copy.
- Open `/contact` directly.
- Choose `Email sayhola@froq.me` (do not require the mail client to open).
- Choose `Copy WeChat @_froq_`.
- Choose `Home`.

## Driving it with control-froq

Preconditions:

- froQ is healthy at `http://127.0.0.1:4317`.
- `control-froq doctor` reports `doctor=ok`.

- **Open.** Open Contact. Navigate to `$(control-froq url)/contact` or click `contact` from `/`. Heading `Contact` is visible. `← home` is present.
- **Email.** Find the link named `Email sayhola@froq.me`. Its href is `mailto:sayhola@froq.me`. Do not click it; asserting the name and href is enough. Opening mailto is a host-OS action, not a froQ page.
- **WeChat copy.** Choose `Copy WeChat @_froq_`. Click the button named `Copy WeChat @_froq_`. The control remains on `/contact`. If the browser clipboard is readable, it equals `_froq_`. If clipboard is blocked, still pass when the button exists and the click does not navigate away.
- **Proof.** Snapshot and screenshot `/contact` at `/tmp/verify-froq/artifacts/contact-reach/contact.aria.txt` and `contact.png`. Both show heading `Contact` and the email handle.

## Gotchas

- WeChat is a button (copy), not a link. Email and X are links.
- Pending find-me items may exist as glyphs without hrefs. Do not require every icon to navigate.
- Do not treat `github` in the site footer as this page's GitHub row.
- Color-scheme toggle in the footer is shared chrome, not a Contact feature.
