# supabase-js #2768 on Angular

Angular 21 repro for https://github.com/supabase/supabase-js/issues/2768, which claims
browsers silently fall back to LongPoll because `@supabase/phoenix` resolves
`opts.transport || global.WebSocket || LongPoll` and `global` is undefined in browser bundles.

This app checks which realtime transport is actually used. Versions are pinned:
Angular 21.2.26, `@supabase/supabase-js` 2.118.0 (realtime-js 2.118.0, phoenix 0.4.5).

## Run

```bash
npm install
npm start                          # dev server on http://localhost:4200
npm run build                      # production build in dist/
```

Open the page and wait about 3 seconds. supabase-js loads through a dynamic `import()`
(its own lazy chunk), and a second probe runs when you open `/lazy`. Each probe shows
`PASS` or `FAIL` and the raw values (also in `window.__results`).

- `PASS`: transport is the native WebSocket and at least one WebSocket was constructed.
- `FAIL`: transport is LongPoll or no WebSocket was constructed (the issue's symptom).

It uses a dummy URL and key, so no Supabase project is needed. `CHANNEL_ERROR` is
expected because nothing is listening. `typeof global` is `undefined` in the bundle,
as the issue describes.

## Result

`PASS` in dev and production, for both the root and lazy-route probes (Chromium).
Not covered: a real server (event delivery), `zone.js`, other browsers.

If you see `FAIL`, please share the output, your browser, and any polyfills or shims
that touch `self`, `window` or `WebSocket`.

Also see the plain Vite version: https://github.com/yannbf/supabase-js-2768-transport
