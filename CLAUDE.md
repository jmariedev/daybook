# daybook

A cozy daily journal-prompt app. Four illustrated card stacks (Gratitude, Reflection, Creative, Story/fantasy world) plus a Done stack; each holds 4 cards and refills every morning from 2,000+ built-in prompts. It is a prompt app only: there is no place to write answers, and that is on purpose.

Live: https://hellodaybook.vercel.app (Vercel project `daybook`, deploy with `vercel deploy --prod`).

## Stack
Vite + React + TypeScript. Supabase for optional sign-in and sync. Vitest for tests, Prettier for formatting.

## Commands
```bash
npm run dev      # local preview
npm test         # vitest
npm run build    # tsc --noEmit, then vite build
npm run format   # prettier
```

## Where things live
- `src/components/` - card stack (`Deck.tsx`), dashboard, grid/list views, buttons, `Illustrations.tsx` (all art is original inline SVG)
- `src/data/` - `prompts.ts`, `categories.ts`, the card store (`store.ts`), browser saving (`persistence.ts`), Supabase sync (`cloudSync.ts`, `cloudRows.ts`)
- `src/sound/` - card sounds and the sound setting
- `supabase/email-templates/` - styled sign-in emails (only used once a custom SMTP sender is set up)

Progress always saves in the browser. Supabase sync only turns on when `.env.local` has the URL and publishable key (see `.env.example`); without them the app runs browser-only. Never commit `.env.local`.

## Look and feel
Flat, cozy 2D. Don't bring back the old 3D version (backup lives in `~/daybook-3d-backup`).
- Font: Figtree (400-800)
- Colors (in `src/styles.css`): mist `#dbe5e8` background, paper `#ffffff` cards, ink `#22302f`, muted `#51656c`, blue `#4f6f7e`, bookmark orange `#e0a077`
- Soft shadows (`--lift`), rounded cards, springy easing (`--glide`, `--spring`)
- Logo: open white book with an orange bookmark on a `#4f6f7e` rounded square (`public/favicon.svg`)

## Notes
- Ideas, open checks and the "before going public" list are in `NOTES.md`. Check it before starting new work.
- AI-generated prompts were removed; the plan for bringing them back is in the README. Built-in prompts must stay the fallback.
- The page must not scroll or rubber-band on phones (body is fixed on purpose).

## Working here
- Deploy: `cd ~/daybook && vercel deploy --prod`. Always run it from this folder, never from `~`.
- No git yet. Don't run `git init` or commit until asked.
- Supabase sign-in redirect URLs must include https://hellodaybook.vercel.app (set in the Supabase dashboard).
- The footer credit reads "made by jmarie.dev". When the jmarie.dev domain goes live, update its link in `src/App.tsx`.
- Copy and UI rules: no em dashes, no emojis, no eyebrow labels above titles, no gradients. Use commas or periods, and icons instead of emoji.
- Copy must present the 4 cards in a stack as options to choose from, not a to-do list.
- Show a mockup first for big visual changes, and give options before picking colors or branding.

## Updates and to-dos (Notion)
Ideas, bugs and changes for daybook are tracked in Jackie's "app updates" Notion database:
https://app.notion.com/p/d25a73a0c1bb47f28b57919e217c066a (data source `collection://a240fba4-441f-4f7e-9ec7-86e38c22651d`).
Each row links to its app through the `project` relation. This app's project page is https://app.notion.com/p/81a92e71cb6a4153af865533334ccaff.
Fields: `name`, `type` (idea, bug, update, polish), `status` (inbox, next, in progress, done), `priority` (high, medium, low), `notes`, `done on`.

- Before starting work, check this app's open items (status inbox, next or in progress) and mention any that relate to the task.
- When Jackie asks what's next, answer from this list: `next` first, then by priority.
- When you start an item, set its status to `in progress`. When it ships, set status `done`, set `done on` to today, and add a one-line note of what changed.
- If you notice a bug or idea outside the current task, add it as a new row (status `inbox`, the right `type`, linked to this project) instead of fixing it unasked.
- If the Notion tools aren't available, list the changes at the end of your reply so Jackie can update the database.

## Keep Notion in sync
This file is mirrored in the "claude context" toggle at the bottom of the daybook page in Jackie's Notion projects database:
https://app.notion.com/p/81a92e71cb6a4153af865533334ccaff

Whenever you change this file, or change anything it describes (stack, commands, folder layout, rules, colors, fonts, logo), also:
1. Update this file so it stays accurate.
2. Update the "claude context" toggle on the Notion page to match. Use the Notion tools if they're connected; edit only that toggle and leave the rest of the page (description, to-do lists, cover, icon) alone.
3. If the project's status, live URL, tech stack or one-line notes changed, update those properties on the same Notion page too.

If the Notion tools aren't available, say so at the end of your reply and list what needs updating, so Jackie can do it.
