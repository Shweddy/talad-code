# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

ตลาดโค้ด (Talad Code) — a monthly curated "fresh market" of open-source projects for Thai developers, inspired by HelloGitHub. Fully static Astro site; GitHub is the CMS; infrastructure cost target is ~฿0/month.

## Commands

```bash
npm run dev        # dev server at http://localhost:4321
npm run build      # static build to dist/ — ALSO validates all content against the Zod schema
npm run preview    # serve dist/
npm run sync-stars # refresh src/data/stars.json from GitHub API (GITHUB_TOKEN env optional)
```

There is no test suite or linter. **The build is the content validator**: malformed issue frontmatter fails `npm run build` with a Zod error. To check content changes, run the build.

## Architecture

**Content pipeline (the core of everything):**
- One Markdown file per monthly issue: `content/issues/NNN.md`. Frontmatter holds the entire project list (name, repo, category, level, thaiMade, description ≤280, why ≤280, optional website); the Markdown body is the editor's note. Schema lives in `src/content.config.ts` (collection loads via glob from `./content/issues`, *not* `src/content/`).
- `draft: true` = file is schema-validated but excluded from all pages. Issue 013 exists as a commented draft skeleton — the template volunteers copy for new issues.
- Publishing flow: edit Markdown → PR → `ci.yml` runs the build (schema errors turn the PR red) → merge to main → `deploy.yml` builds and deploys to Cloudflare Pages (project `taladcode`). The deploy step self-skips with a warning until `CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID` repo secrets exist.

**Star counts are offline data, never live:**
- `scripts/sync-stars.mjs` scrapes `repo:` slugs from issue frontmatter, hits the GitHub API, and writes `src/data/stars.json`. Run daily by the `sync-stars.yml` cron, which bot-commits the result. `ProjectCard.astro` reads that JSON at build time. **Never call the GitHub API at build or runtime** — no rate limits, fast builds, free hosting.

**Cross-file couplings to keep in sync:**
- The `category` and `level` enums in `src/content.config.ts` are duplicated in the community submission form `.github/ISSUE_TEMPLATE/submit-project.yml`. Change one → change both.
- All GitHub repo links in UI come from the `REPO` constant in `src/config.ts` (one-line change if the repo moves to an org). Exception: links inside issue Markdown bodies are hardcoded.
- Schema changes must be backward-compatible optional fields only — old issue files must keep building.

## Agent team

Custom agents live in `.claude/agents/`. For any multi-step feature, fix, or release, delegate to **primus** (purple, the orchestrator) rather than doing everything inline — it decomposes work and routes it to the specialists:

| Agent | Color | Owns |
|---|---|---|
| `primus` | purple | Orchestration only — delegates, sequences dev → tester → reviewer → deploy, synthesizes |
| `dev` | blue | Astro components/pages/styles, content schema, scripts |
| `devops` | orange | GitHub Actions workflows, Cloudflare Pages config, star-sync pipeline |
| `tester` | green | Build + schema-rejection tests, screenshots, accessibility floor, link/data integrity |
| `reviewer` | yellow | Read-only diff review: correctness, couplings, brand/voice compliance |
| `curator` | pink | Thai editorial content, project vetting against selection criteria |
| `deploy` | red | Commits/pushes/merges and watching Actions — only when the user asked to ship |

Every code change goes through `tester` before being reported done; `deploy` is never invoked speculatively.

## Non-negotiable conventions

- **Language & voice:** all reader-facing copy is Thai, warm and plainspoken, using the fresh-market metaphor consistently (issues = แผง, curators = พ่อค้าแม่ค้าอาสาสมัคร, readers เดินตลาด and หยิบใส่ตะกร้า). Every project entry answers "ทำไมต้องลอง" in one line. Code, configs, and commit messages are English.
- **Visual identity:** palette is fixed as CSS vars in `src/styles/global.css` — mo-hom indigo backgrounds (`--indigo-deep/--indigo/--indigo-soft`), marigold accent, cream text, leaf green for levels/success. Fonts: Chakra Petch (headings), Sarabun (body), IBM Plex Mono (labels/stats), self-hosted via @fontsource imports in `Base.astro`. The marigold garland divider (`Garland.astro`) separates sections; everything else stays quiet. Don't introduce new colors or fonts.
- **Quality floor:** mobile-responsive, visible keyboard focus (marigold outline in global.css), `prefers-reduced-motion` respected (blanket rule in global.css). Preserve these when touching styles.
- **Editorial rules:** one issue per month, 5–10 projects, at least one มือใหม่-level pick, Thai-made projects flagged with `thaiMade: true`.
- **Static-first:** no backend/accounts unless a feature truly requires user state. New features must serve readers discovering projects or volunteers publishing issues — cut anything that serves neither.
