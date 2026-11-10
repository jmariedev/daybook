# Daybook

A cozy daily journal prompt app: a home screen to choose what to journal today, and illustrated prompt cards with Gratitude, Reflection, Creative and Story stacks plus a Done stack. It has 2,000+ built-in prompts, and each stack holds 4 and fills back up every morning.

Built with Vite, React and TypeScript.

## Commands

```bash
npm install
npm run dev      # local preview
npm test         # run the tests
npm run build    # type-check and package for production
npm run format   # format the code
```

## Where things live

| Folder            | What is there                                              |
| ----------------- | ---------------------------------------------------------- |
| `src/components/` | Card stack, filters, buttons, grid, list and illustrations |
| `src/data/`       | Prompts, categories, the card store and saving             |
| `src/sound/`      | Card sounds and the sound setting                          |

Progress is always saved in the browser. Signing in with a password or an emailed link also syncs it to Supabase (`src/data/cloudSync.ts`). Copy `.env.example` to `.env.local` and add the project URL and publishable key; without them the app runs in browser-only mode.

Ideas and next steps are in [NOTES.md](NOTES.md). All illustrations are original SVG in `src/components/Illustrations.tsx`.

## Future idea: AI prompts

AI-generated prompts were removed for now and can be added later. The plan was a server function that asks the Claude API for a few new prompts per category each day, with the API key kept only in server settings and the results cached per category and date to limit cost. Built-in prompts would remain the fallback.
