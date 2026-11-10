# Daybook notes

Daybook is a flat, cozy 2D app. It stays a prompt app, with no place to write answers. The earlier 3D version is saved outside this project in `~/daybook-3d-backup`.

Live at https://hellodaybook.vercel.app (Vercel project `daybook`). Deploy with `vercel deploy --prod`.

## Still to check

- Add the live address to Supabase (Authentication, URL Configuration), then create an account with a real email and compare cards on two devices. Password sign-in, reset links and sync have only been tested with faked responses.
- Each new account and reset uses one of the built-in sender's 2 emails an hour.
- Sign-in uses Supabase's built-in sender for now, which allows 2 emails an hour and plain default emails. To go wider or use the styled emails, add your own sender (Authentication, SMTP).
- With your own sender, paste `supabase/email-templates/magic-link.html` and `confirm-signup.html` into Authentication, Email Templates. If the live address changes, update the image addresses in both.
- The Sound switch only appears in the sign-in popup, which needs Supabase set up.
- Try it on a real phone, including dragging cards and how the animations feel.

## Ideas

| Idea                                        | Why                                                     | Size |
| ------------------------------------------- | ------------------------------------------------------- | ---- |
| More illustrations per stack                | Grid view repeats one picture for each stack            | M    |
| Calendar or gentle streak of finished cards | Shows the habit building, with no guilt for missed days | M    |
| Search and favorite cards                   | Useful once there are many cards                        | S    |
| Add your own prompts                        | Especially for the fantasy world in Story               | M    |
| Export prompts to text or PDF               | Lets people keep their favorites                        | S    |
| Install on a phone and work offline         | Fits a daily habit                                      | M    |
| Daily reminder                              | Depends on installing, and phone support varies         | M    |
| AI prompts                                  | See the plan in the README                              | M    |

Size means rough effort: S is under an hour, M is a few hours.

## Before making it public

- Add page previews and a sharing image, and write the portfolio description.
