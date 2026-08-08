---
title: Simplify Corpus Structure
created: 2025-11-06
status: form
last_modified: 2026-06-16 04:43:34
lang: en
translated: true
---

I simplified the structure of Corpus.

---

#scope/meta/corpus

## Overhaul

### Structure

So, according to the discussion [here](aut-20251105.md),
Corpus has an issue of over-differentiation.
The solution proposed there is adopted here, which is
to only keep the top-level categories, i.e., the six layers,
and implement sub-categories through tags.

`corpus.zsh` and other scripts are completely rewritten,
removing all the logic for handling sub-categories.

A new `--insta` flag is added for quickly creating and
opening a headless nvim instance for editing.

### Template

Template system has been modified
[here](aut-template-change-20251105212955.md),
changing the English and Latin prompts to Traditional Chinese
to enhance (for my) readability (embarrassed).
However, after the hierarchy merge, a single template is inevitably
not suitable for all entries under a hierarchy,
so the prompt content in the template is simply removed,
leaving only the YAML header, and all content is edited by users themselves.

---

Let's see how it works in practice.
