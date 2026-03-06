Use Node 24
Use pnpm
Use Nuxt 4 (LTS)
Use Nuxt Content (LTS)
Use NUxt UI
Use TypeScript

If better-sqlite3 fails to load after switching Node versions, rebuild it:
cd node_modules/.pnpm/better-sqlite3@12.6.2/node_modules/better-sqlite3 && pnpm rebuild

Use prefixed routes (/br, /en). Default is "en"
No hardcoded localisations/translations. All translations should be in i18n.config.ts

Preferably:

Prioritise composables for logic

Components should have 120 lines or less. Maximum 200 lines for exceptions. If needed, break into more components or reuse logic with composables. Do not condense CSS for this purpose. Don't over fragment the codebase. Avoid prop drilling and event bubbling for marginal gains.

All requests should watch locale. All data must be computed.
Components should have 100 lines or less.
Fonts source is Google Fonts

Use SCSS scoped
Use viewTransition slide animations between pages

IMAGES:
You are allowed to search the internet for free images. Always download them, instead of referencing them on remote servers.

If the app spec changes, update this file accordingly.

If you encounter some difficult that took a lot o time to fix, document it in this document to avoid repeting the issue.
