# Read a journal entry

Journal is the public hub for dated personal writing. A visitor opens the index, chooses an entry, and reads the title that matches the file. They can go back to Journal.

## Sub-features

- `journal-hub` opens the Journal index.
- `journal-article` opens the fixture entry and shows its title.
- `journal-back` returns from the entry to Journal.

## How to get to it (user POV)

- From home, choose `Journal`.
- Open `/journal` directly.
- Choose the article titled `Speaking English: A Comedy of Errors and Small Victories`.
- On the article, choose `← Journal`.

## Driving it with control-froq

Preconditions:

- froQ is healthy at `http://127.0.0.1:4317`.
- `control-froq doctor` reports `doctor=ok`.
- The fixture file `docs/journal/speaking-english.md` is present with that title.

- **Hub.** Open Journal. Navigate to `$(control-froq url)/journal` or click `Journal` from `/`. Heading `Journal` is visible. Navigation `Sections` contains `Essays`, `Journal`, and `Cabinet`.
- **Article.** Choose that title. Click the link named `Speaking English: A Comedy of Errors and Small Victories`. The URL is `/journal/speaking-english`. The heading matches the title. A `← Journal` link is present.
- **Back.** Choose `← Journal`. Click that link. The URL is `/journal` and the heading is `Journal`.
- **Proof.** Snapshot and screenshot the article at `/tmp/verify-froq/artifacts/journal-read/article.aria.txt` and `article.png`. Both show the fixture title and froQ chrome (`← home` or `← Journal`).

## Gotchas

- Draft/void filters default to showing drafts and hiding void. Do not toggle them unless the recipe under test is the filter itself.
- Article like buttons are isolated in a verification launch. Missing like counts are not a fail.
