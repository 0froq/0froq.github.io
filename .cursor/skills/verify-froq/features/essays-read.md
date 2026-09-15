# Read an essay

Essays is the public hub for finished arguments and technical writing. A visitor opens the index, chooses an article, and reads the title that matches the file. They can go back to Essays.

## Sub-features

- `essays-hub` opens the Essays index.
- `essays-article` opens the fixture article and shows its title.
- `essays-back` returns from the article to Essays.

## How to get to it (user POV)

- From home, choose `Essays`.
- Open `/essays` directly.
- Choose the article titled `透明溞不是老鼠`.
- On the article, choose `← Essays`.

## Driving it with control-froq

Preconditions:

- froQ is healthy at `http://127.0.0.1:4317`.
- `control-froq doctor` reports `doctor=ok`.
- The fixture file `docs/essays/d-hyalina-is-not-rat.md` is present with that title.

- **Hub.** Open Essays. Navigate to `$(control-froq url)/essays` or click `Essays` from `/`. Heading `Essays` is visible. Navigation `Sections` contains `Essays`, `Journal`, and `Cabinet`.
- **Article.** Choose that title. Click the link named `透明溞不是老鼠`. The URL is `/essays/d-hyalina-is-not-rat`. The heading matches the title. A `← Essays` link is present.
- **Back.** Choose `← Essays`. Click that link. The URL is `/essays` and the heading is `Essays`.
- **Proof.** Snapshot and screenshot the article at `/tmp/verify-froq/artifacts/essays-read/article.aria.txt` and `article.png`. Both show the fixture title and froQ chrome (`← home` or `← Essays`).

## Gotchas

- The fixture title is Chinese. Match the exact string; do not translate it in the assertion.
- Article like buttons are isolated in a verification launch. Missing like counts are not a fail.
