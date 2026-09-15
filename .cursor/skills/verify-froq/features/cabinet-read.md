# Read a cabinet piece

Cabinet is the public hub for found and made materials. A visitor opens the index, chooses a piece, and reads the title that matches the file. They can go back to Cabinet.

## Sub-features

- `cabinet-hub` opens the Cabinet index.
- `cabinet-article` opens the fixture piece and shows its title.
- `cabinet-back` returns from the piece to Cabinet.

## How to get to it (user POV)

- From home, choose `Cabinet`.
- Open `/cabinet` directly.
- Choose the piece titled `如此荒诞`.
- On the piece, choose `← Cabinet`.

## Driving it with control-froq

Preconditions:

- froQ is healthy at `http://127.0.0.1:4317`.
- `control-froq doctor` reports `doctor=ok`.
- The fixture file `docs/cabinet/absurdity.md` is present with that title.

- **Hub.** Open Cabinet. Navigate to `$(control-froq url)/cabinet` or click `Cabinet` from `/`. Heading `Cabinet` is visible. Navigation `Sections` contains `Essays`, `Journal`, and `Cabinet`.
- **Article.** Choose that title. Click the link named `如此荒诞`. The URL is `/cabinet/absurdity`. The heading matches the title. A `← Cabinet` link is present.
- **Back.** Choose `← Cabinet`. Click that link. The URL is `/cabinet` and the heading is `Cabinet`.
- **Proof.** Snapshot and screenshot the piece at `/tmp/verify-froq/artifacts/cabinet-read/article.aria.txt` and `article.png`. Both show the fixture title and froQ chrome (`← home` or `← Cabinet`).

## Gotchas

- The fixture title is Chinese. Match the exact string; do not translate it in the assertion.
- Draft/void filters default to showing drafts and hiding void. Do not toggle them unless the recipe under test is the filter itself.
- Article like buttons are isolated in a verification launch. Missing like counts are not a fail.
