# Rootstrap Boilerplate — Figma Component Lint

`figma-lint.js` — the adoption and component lint used to keep the
[Rootstrap UI + DS boilerplate](https://www.figma.com/community) free of foreign
bindings and dead component properties.

Current version: **v2.8** (2026-09-07)

Raw URL (this is the one to use):

```
https://raw.githubusercontent.com/fabianacorvini-spec/RSBoilerplate-Figma-Lint/main/figma-lint.js
```

---

## What problem this solves

A design system only holds together if every paint, radius and spacing value in
every component resolves to that file's own variables and text styles.

The fastest way to break that is to paste a component in from another kit. It
looks correct, and it silently drags along bindings to variables that live in
some other file. Rebrand the primitives and those pasted parts don't follow.
Nothing in Figma warns you.

This script finds them.

## What it checks

**A. Base property lint.** Paints, strokes, corner radii and spacing values that
carry no variable binding, plus text nodes with no text style. Off-scale spacing
values have a documented exception path so intentional one-offs don't produce
permanent noise.

**B. Foreign-binding adoption lint.** Every variable and style binding that does
not resolve to the file's own `2. Semantic` or `3. Component` collections is
reported. This is the check that catches pasted components.

**C. Property binding parity and the defaults trap.** Component properties that
are wired on some variants of a set but dead on others, and subtrees that can
never render on a fresh instance. Added in v2.6 after three live defects survived
a clean run of the previous version: a Textarea with every property dead on its
hover and focus variants, a Select with two properties dead on nine variants, and
two components with a Footer subtree that could not appear on a fresh instance.
None of those touch a paint or a binding, so A and B could not see them.

## How to run it

The script runs inside Figma's plugin context, so it needs a bridge between an
agent and your file.

1. Open your file in Figma Desktop.
2. Open the Figma Desktop Bridge (MCP Bridge) plugin.
3. Ask your agent to fetch the raw URL above and run it.

Run it:

- in the boilerplate before every publish, and
- in any project copy after pasting anything in from outside.

## Two modes

**Report mode is read-only.** It changes nothing. Start here, always.

**Fix mode rebinds only value-identical matches.** If a foreign binding resolves
to exactly the same value as a local token, it is swapped for the local one.
Anything whose value differs is reported and left alone, because a value change
is a design decision and not the script's call.

Read the report before running fix mode. A clean report means there is nothing
for fix mode to do.

## Before you trust a clean run

The allowlists near the top of the file (`SANCTIONED_VAR_KEYS`,
`SANCTIONED_STYLE_KEYS`) suppress specific known bindings by key. Those keys are
**Rootstrap-specific** — they cover scaffolding in our own file and libraries.

If you are running this on your own file, those entries do nothing useful for you
and one of them may suppress something you want to see. Read the comments,
delete what doesn't apply to you, and add your own.

An allowlist entry suppresses a report. It does not fix a file.

## Version notes

- **v2.8** — one allowlist entry, no logic changes.
- **v2.7** — fixed resolution of Figma's composed-color variables (alias plus
  alpha). They previously failed to resolve and could collide in the value index
  that fix mode reads. **Fix mode was unsafe in any file using composed colors
  before v2.7.** Report mode was unaffected, so earlier clean reports remain
  valid.
- **v2.6** — added check C.
- **v2.5** — four resolution and traversal fixes, no new checks.

If you are on anything below v2.7, update before running fix mode.

## Feedback

Open an issue, or comment on the Figma Community file. Both get read.

---

Maintained by [Rootstrap](https://www.rootstrap.com).
