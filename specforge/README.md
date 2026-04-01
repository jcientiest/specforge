# SpecForge

**Build the spec. Claude builds the rest.**

Design your project visually — pick a template, configure your stack, define your data model. Export a complete context bundle. Upload to Claude and type `continue`.

## What it generates

Every export `.zip` contains:
- `CLAUDE.md` — Full project brief. Claude reads this first.
- `spec.json` — Machine-readable source of truth.
- `prompts/` — One focused prompt per build module (auth, database, api, frontend, testing).
- `scaffold/` — Complete folder structure with placeholder files.
- `.env.example` — All required environment variables.
- `README.md` — Project readme.

## Quick start

```bash
# 1. Clone
git clone https://github.com/yourname/specforge
cd specforge

# 2. Install
npm install

# 3. Run locally
npm run dev
# Open http://localhost:3000
```

## Deploy to GitHub Pages

1. Push this repo to GitHub
2. Go to **Settings → Pages → Source** → select **GitHub Actions**
3. Push to `main` — the workflow auto-builds and deploys
4. Your site is live at `https://yourname.github.io/specforge`

That's it. No environment variables, no server, no config needed.

## How to use the export

1. Pick a template or start blank
2. Fill in your project details across each section
3. Click **Review & export** → **Analyze spec** (catches missing pieces)
4. Click **Export .zip** — downloads immediately
5. Upload the zip to Claude Projects or attach `CLAUDE.md` to a new conversation
6. Type `continue` — Claude reads the full context and starts building

## Stack

- **Next.js 15** — App Router
- **TypeScript** — Strict mode
- **Tailwind CSS** — Styling
- **Zustand** — State (persisted to localStorage)
- **dnd-kit** — Drag and drop (Phase 2)
- **JSZip** — Client-side zip generation
- **Claude API** — AI gap analysis

## Project structure

```
src/
  app/                  # Next.js pages and API routes
  components/
    spec/               # Builder UI sections
    preview/            # Live CLAUDE.md preview
  lib/
    generators/         # CLAUDE.md, prompts, and zip generators
    defaults.ts         # Default stack and conventions
  store/
    spec.store.ts       # Zustand store — single source of truth
  templates/
    index.ts            # Pre-built project templates
  types/
    spec.ts             # TypeScript types for the entire spec
```

## Contributing

Templates live in `src/templates/index.ts` — a template is just a pre-filled `spec.json`. 
PRs for new templates are welcome.

## License

MIT
