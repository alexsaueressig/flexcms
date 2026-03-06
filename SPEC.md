# CMS — Product Specification

|                  |            |
| ---------------- | ---------- |
| **Version**      | 1.0.0      |
| **Status**       | Draft      |
| **Last Updated** | 2026-03-06 |

> A headless, multilingual content management system with hierarchical content, dynamic schemas, role-based access, and rich media management.

---

## 1. Product Overview

**CMS** is a web-based CMS that lets teams manage structured, hierarchical content across multiple languages. Content editors create tree-structured entries (like pages, articles, or any nested content), define custom field schemas (blueprints) per section, and fill in localized field values. The system supports passwordless login, role-based permissions, media uploads, full-text search, and a public read-only API for delivering content to any frontend.

---

## 2. Technology Stack

| Layer                | Technology                                         | Notes                                                      |
| -------------------- | -------------------------------------------------- | ---------------------------------------------------------- |
| Runtime              | Node.js 24                                         | Required minimum version; use NVM to manage versions       |
| Package Manager      | pnpm                                               | Workspace setup                                            |
| Framework            | Nuxt 4 (LTS)                                       | Full-stack Vue 3 framework with SSR                        |
| UI Library           | Nuxt UI                                            | Component library for forms, modals, tables, buttons, etc. |
| Content Module       | Nuxt Content (LTS)                                 | Integrated but mainly for project docs/static content      |
| State Management     | Pinia                                              | Vue store pattern                                          |
| Internationalization | @nuxtjs/i18n                                       | URL-prefix strategy (`/en`, `/br`)                         |
| Database ORM         | Prisma                                             | PostgreSQL as primary database                             |
| Rich Text Editor     | TipTap (10+ extensions)                            | Bold, italic, underline, lists, links, code blocks, tasks  |
| Authentication       | Passwordless OTP via email                         | Nodemailer for SMTP delivery                               |
| Media Storage        | Firebase Cloud Storage                             | Server-signed upload URLs, admin SDK                       |
| Geocoding            | Google Places API                                  | For geolocation fields                                     |
| Validation           | Zod                                                | Schema validation on forms                                 |
| Styling              | SCSS (scoped) + Tailwind (via Nuxt UI)             |                                                            |
| Fonts                | Google Fonts (self-hosted)                         | Inter (UI text), JetBrains Mono (code)                     |
| Drag & Drop          | vue-draggable-plus                                 | Blueprint field reordering                                 |
| Utilities            | VueUse, nanoid, lowlight                           | Composables, ID generation, syntax highlighting            |
| Dev/Test             | TypeScript strict, ESLint, @nuxt/test-utils, Faker |                                                            |

---

## 3. Core Concepts

### 3.1 Entries (Content Tree)

Entries are the fundamental content unit. They form an **unlimited-depth tree** — any entry can have children. Each entry has:

- **Title** — human-readable name
- **Slug** — URL-friendly identifier (auto-generated from title using kebab-case), unique among siblings
- **Parent** — optional; null for root entries
- **Order** — manual integer ordering among siblings
- **Archived flag** — soft-delete; archived entries and all descendants are hidden but recoverable

### 3.2 Blueprints (Dynamic Schemas)

A blueprint is a schema definition that belongs to a single entry. It defines **what fields the children of that entry will have**. Think of it as a template: if a "Blog" entry has a blueprint with fields like "Cover Image", "Body", "Author" — then every child entry under "Blog" will have those fields to fill in.

Blueprint fields have:

- **Label** — display name
- **Key** — machine name (lowercase letters, numbers, underscores)
- **Type** — one of 17 field types (see Field Types)
- **Order** — drag-and-drop reorderable
- **Required flag**
- **Hidden flag**
- **Config** — type-specific settings (e.g., max length for strings, choices for selects)

### 3.3 Field Values (Localized Content)

Field values are stored per entry, per field, per locale. This means each entry's content can exist independently in every language. The system uses an EAV (Entity-Attribute-Value) pattern with typed columns:

- Text value — for strings, rich text, tags, colors, selects
- Number value — for numbers
- Boolean value — for toggles
- JSON value — for complex types (geo coordinates, date ranges, datetimes, raw JSON)
- Media value — for Firebase storage paths

### 3.4 Locales

The system supports multiple locales loaded from the database. Each locale has:

- **Code** — short identifier (e.g., "en", "br")
- **Name** — display name (e.g., "English", "Português (BR)")
- **Language tag** — BCP-47 (e.g., "en-US", "pt-BR")
- **Default flag** — one locale is the default
- **Active flag** — inactive locales are hidden

The URL routing uses a prefix strategy: `/en/entries/123`, `/br/entries/123`. Default locale is English.

Seeded locales: **Brazilian Portuguese (br)** and **English (en)**.

### 3.5 Content Lifecycle

Every entry has a **publish status** that controls whether it is visible through the public API:

| Status        | Visible in Admin | Visible in Public API   | Description                                                                           |
| ------------- | ---------------- | ----------------------- | ------------------------------------------------------------------------------------- |
| **Draft**     | Yes              | No                      | Default state on creation. Work-in-progress content.                                  |
| **Published** | Yes              | Yes                     | Live content served to consumers.                                                     |
| **Scheduled** | Yes              | No (until publish date) | Content with a future publish date. Automatically published when the date is reached. |

- An entry's publish status is **per-locale** — content can be published in English while still in draft in Portuguese.
- Publishing requires the **edit** permission on that entry.
- Scheduled entries store a `publishAt` timestamp. A on-request check promotes them to **Published** once the time is reached.
- Unpublishing moves an entry back to **Draft** without losing any content.
- The admin UI shows a status badge on each entry (colored dot: grey for draft, green for published, blue for scheduled).

---

## 4. Field Types (17 total)

| Type              | What It Does                         | Configuration Options                                                                |
| ----------------- | ------------------------------------ | ------------------------------------------------------------------------------------ |
| **String**        | Single-line text input               | Max length, placeholder                                                              |
| **Rich Text**     | Full WYSIWYG editor (TipTap)         | Toolbar: bold, italic, underline, bullet/ordered lists, headings, code blocks, links |
| **Number**        | Numeric input                        | Min, max, step, prefix, suffix                                                       |
| **Boolean**       | Toggle switch                        | Custom true/false labels                                                             |
| **Media Image**   | Image upload to Firebase             | Max size, allowed formats; shows preview                                             |
| **Media Video**   | Video upload to Firebase             | Max size, allowed formats                                                            |
| **Media File**    | Generic file upload to Firebase      | Max size, allowed extensions                                                         |
| **Date/Time**     | Date and time picker                 | Includes timezone selector (common timezones); stores ISO + timezone                 |
| **Date Range**    | Start and end date pickers           | Stores start/end ISO dates                                                           |
| **Select Single** | Dropdown from predefined choices     | List of label/value pairs                                                            |
| **Select Multi**  | Multi-select from predefined choices | List of label/value pairs                                                            |
| **Tags**          | Free-form tag entry                  | Enter or comma to add; stored as array                                               |
| **Relation One**  | Link to a single other entry         | Optional: restrict to children of a specific entry                                   |
| **Relation Many** | Link to multiple entries             | Optional: restrict to children of a specific entry; ordered                          |
| **Geo**           | Google Places autocomplete           | Stores latitude, longitude, formatted address; optional country restriction          |
| **JSON**          | Raw JSON textarea                    | Live validation with error display                                                   |
| **Color**         | Color picker + hex input             | Native color swatch + text field                                                     |

Each field type is registered in the database with an icon, label, description, and a JSON Schema for its configuration. This makes the system extensible.

---

## 5. Authentication & Authorization

### 5.1 Passwordless Login

1. User enters email on the login page
2. System generates a **6-digit OTP code**, hashes it (SHA-256), and stores it with 15-minute expiry
3. OTP is emailed to the user (in development mode, the code is returned in the response, shown in the console and in the interface, auto-filled on the verify page, and submitted automatically)
4. User enters the code on the verification page (skipped in dev mode)
5. On success, a **session** is created:
   - Token: random 48-character string
   - Stored in an HttpOnly cookie (`cms_session`)
   - 30-day duration (configurable)
   - IP address and user agent recorded for audit

### 5.2 Role-Based Access Control (RBAC)

**Four system roles** (cannot be deleted or renamed):

| Role            | View | Create | Edit | Publish | Archive |
| --------------- | ---- | ------ | ---- | ------- | ------- |
| **Super Admin** | Yes  | Yes    | Yes  | Yes     | Yes     |
| **Publisher**   | Yes  | Yes    | Yes  | Yes     | No      |
| **Editor**      | Yes  | Yes    | Yes  | No      | No      |
| **Viewer**      | Yes  | No     | No   | No      | No      |

Custom roles can be created with any combination of permissions.

**Permission scoping:**

- **Global permissions** — apply everywhere (entry ID is null)
- **Entry-scoped permissions** — apply only to a specific entry and its subtree
- Resolution: scoped permission checked first, then falls back to global
- A user has the **union** of all their roles' permissions

### 5.3 User Management

- Super Admins can invite users by email (assigning roles)
- Users can be set to Active or Inactive status
- Users cannot deactivate or delete themselves
- No password — login is always via OTP email

---

## 6. Pages & Navigation

### 6.1 Layout

The app has two layouts:

**Authenticated layout (default):**

- **Sidebar** (collapsible to icon-only):
  - App logo/name at top
  - Navigation links: Entries, Archive, (Users and Roles for Super Admin)
  - Content tree below navigation: shows root entries in a recursive expandable tree with child counts, lazy-loaded on expand
  - Clicking an entry in the tree navigates to its **detail/children page** if it has a blueprint (i.e., it can have children), or directly to the **edit page** if it has no blueprint (leaf entry)
  - "New entry" button at the top of the tree
- **Header bar:**
  - Sidebar toggle button
  - Global search trigger (Cmd+K / Ctrl+K shortcut)
  - Locale switcher (flag emoji + code for each locale)
  - Color mode toggle (light/dark)
  - User menu dropdown (avatar + name shown, email inside menu, logout action)
- **Main content area** fills the remaining space

**Auth layout:** Centered card on a plain background (login/verify pages).

### 6.2 Pages

_All URLs below omit the locale prefix (e.g., `/en`, `/br`) for brevity._

| Page               | URL                | Access        | Purpose                                                                                                                                                                                                                                                                                   |
| ------------------ | ------------------ | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Login**          | /auth/login        | Public        | Enter email to request OTP                                                                                                                                                                                                                                                                |
| **Verify**         | /auth/verify       | Public        | Enter 6-digit code                                                                                                                                                                                                                                                                        |
| **Entries** (Home) | /                  | Authenticated | Table of root entries with search, pagination (25/page), create/edit/delete modals                                                                                                                                                                                                        |
| **Entry Detail**   | /entries/[id]      | Authenticated | Breadcrumb trail, "Edit fields" button, children table with filters and configurable pagination, blueprint definition modal. **Only accessible for entries that have a blueprint** (i.e., entries that can have children). Entries without a blueprint redirect to the edit page instead. |
| **Entry Editor**   | /entries/[id]/edit | Authenticated | Locale switcher, dynamic form with all blueprint fields, "Magic Populate" button (auto-fill with fake data), save button                                                                                                                                                                  |
| **Archive**        | /archive           | Authenticated | Archived entries table with restore action                                                                                                                                                                                                                                                |
| **Users**          | /admin/users       | Super Admin   | User list with search, invite modal (name + email + roles), edit modal (name + status)                                                                                                                                                                                                    |
| **Roles**          | /admin/roles       | Super Admin   | Role cards with permission grids (view/create/edit/archive checkboxes), create/delete roles                                                                                                                                                                                               |

### 6.3 Page Transitions

All page changes use **View Transition API** with a slide animation

---

## 7. Key Workflows

### 7.1 Content Creation

1. From the home page or sidebar tree, click "New Entry"
2. Fill in title (slug auto-generates from title in kebab-case)
3. Optionally select a parent entry
4. If the parent has a blueprint, additional fields from that blueprint appear in the creation form
5. Entry is created and appears in the tree

### 7.2 Navigation Behavior

When a user clicks on an entry (in the sidebar tree, a table row, or any link):

- **Entry has a blueprint** → navigates to the **detail page** (children list + blueprint editor)
- **Entry has no blueprint** → navigates directly to the **edit page** (field editor)

This means leaf entries (those that are not meant to have children) skip the children listing entirely and go straight to content editing. The detail/children page is only useful for entries that serve as containers for other entries.

### 7.3 Content Editing

1. Navigate to an entry (or click a leaf entry which opens the editor directly)
2. Click "Edit fields" to go to the editor (if on the detail page)
3. Switch between locales using the locale pill buttons (each locale's content is independent)
4. Fill in each field (the available fields come from the parent's blueprint)
5. Optionally click "Magic Populate" to auto-fill all fields with realistic fake data (uses Faker)
6. Click Save — field values are stored per locale

### 7.4 Blueprint Definition

1. Navigate to an entry's detail page
2. Click "Define Blueprint" (or edit existing)
3. A modal opens with a drag-and-drop field list
4. Add fields: each gets a label, auto-generated key, type selector, required checkbox
5. For types that need configuration (selects need choices, numbers need min/max, etc.), a configurator panel appears
6. Drag to reorder fields
7. Save — now all children of this entry will have these fields

### 7.5 Entry Listing Filters

All entry tables (root listing, children listing, archive) support the following filters:

| Filter             | Control            | Behavior                                                                                   |
| ------------------ | ------------------ | ------------------------------------------------------------------------------------------ |
| **Publish status** | Multi-select chips | Filter by Draft, Published, or Scheduled (per current locale). All selected by default.    |
| **Has blueprint**  | Toggle             | Show only entries that have a blueprint defined (container entries), or only leaf entries. |
| **Created date**   | Date range picker  | Filter entries created within a start/end date range.                                      |
| **Updated date**   | Date range picker  | Filter entries last updated within a start/end date range.                                 |

- Filters are displayed in a collapsible bar above the table, collapsed by default.
- Active filters show a count badge on the filter toggle button.
- Filters combine with the search query (AND logic).
- Filter state is **not** persisted — it resets on page navigation.

### 7.6 Configurable Pagination

Users can choose their preferred page size from a dropdown beside the pagination controls. Available options: **10, 25, 50, 100**. The default is **25**.

- The chosen page size is saved as a **user preference** and applies globally across all entry tables.
- The preference is stored via the existing UserPreference mechanism and synced on login.
- Site Settings defines the **default** (25) and **maximum** (100) pagination limits, which bound the available options.

### 7.7 Search

- Press Cmd+K (or Ctrl+K) anywhere in the app
- Type a search query — results appear in real-time (300ms throttle)
- Results show entry title with parent breadcrumb path
- Click a result to navigate to it
- Search covers entry titles, slugs, and field text values in the current locale

### 7.8 Media Upload

1. In a media field (image/video/file), click the dropzone or drag a file onto it
2. The frontend requests a signed upload URL from the server
3. The file uploads directly to Firebase Cloud Storage (shows progress bar)
4. Once complete, the file URL is stored as the field value
5. Images show a preview; videos and files show download links

### 7.9 Entry Archiving & Restoration

- Deleting an entry soft-archives it (and recursively all its descendants)
- Archived entries appear on the Archive page
- From the Archive page, entries can be restored
- From the Archive page, entries can be permanently deleted (modal confirmation)

### 7.10 Entry Relations

- Relation fields (one or many) link entries to each other
- A picker modal opens with a search bar to find target entries
- Relations are stored separately from field values, with ordering support
- Relations can optionally be restricted to children of a specific blueprint entry

---

## 8. Public API (Content Delivery)

The system exposes a **read-only public API** at `/api/v1/` that requires no authentication. This is designed for external frontends (websites, mobile apps) to consume content:

| Endpoint                                      | What It Returns                                         |
| --------------------------------------------- | ------------------------------------------------------- |
| `GET /api/v1/entries/[id]?locale=en`          | Single entry with all field values for the given locale |
| `GET /api/v1/entries/[id]/children?locale=en` | Paginated children list with field values               |
| `GET /api/v1/search?q=...&locale=en`          | Search results across titles, slugs, and field values   |

Only non-archived, **published** entries are returned. The API supports pagination with limit/offset.

### 8.1 Rate Limiting

The public API enforces rate limiting to prevent abuse:

- **Default limit**: 1000 requests per minute per IP address
- Exceeding the limit returns `429 Too Many Requests` with a `Retry-After` header
- Rate limit settings are configurable via Site Settings

### 8.2 CORS

Cross-Origin Resource Sharing is configured for the public API:

- **Allowed origins**: configurable list stored in Site Settings (defaults to `*` in development)
- **Allowed methods**: `GET`, `OPTIONS`
- **Allowed headers**: `Content-Type`, `Accept`, `Accept-Language`
- **Max age**: 86400 seconds (24 hours) for preflight cache
- CORS headers are only applied to `/api/v1/**` routes — internal API routes are not exposed cross-origin

---

## 9. Internationalization (i18n)

**All UI text is translatable** — nothing is hardcoded. Translations live in a single configuration file organized by section:

- `app` — general app labels (app name, loading, save, cancel, etc.)
- `nav` — navigation items (entries, archive, users, roles)
- `auth` — login/verify flow text
- `entries` — entry management (create, edit, delete, fields, etc.)
- `blueprint` — blueprint editor text
- `fields` — field type labels and descriptions
- `roles` — role management text
- `archive` — archive page text
- `users` — user management text
- `table` — table UI (search, pagination, empty states)
- `search` — search modal text
- `contentTree` — sidebar tree labels
- `common` — shared terms

Currently supports **English (en)** and **Brazilian Portuguese (br)**. New locales can be added via the admin API.

Locale flags are rendered as emoji using Unicode regional indicator conversion from the language code.

---

## 10. User Interface Conventions

- **Modals** for create/edit/delete actions (not separate pages)
- **Tables** with search bars and filter controls, paginated with a user-configurable page size (default 25; options: 10, 25, 50, 100)
- **Breadcrumb trails** on entry detail pages showing the full parent path
- **Toast notifications** for success/error feedback
- **Color mode** support (light and dark themes)
- **Responsive sidebar** that collapses to icon-only mode
- **Keyboard shortcuts**: Cmd+K / Ctrl+K for global search
- **Drag-and-drop** for reordering blueprint fields
- **Flag emojis** next to locale codes in switchers
- All data is **reactive to locale changes** — switching locale refreshes content automatically

---

## 11. Data Model Summary

### Entry Hierarchy

```
Entry (root)
├── Entry (child)
│   ├── Entry (grandchild)
│   └── Entry (grandchild)
└── Entry (child)
    └── ...
```

Each entry can optionally have a **Blueprint** that defines the schema for its children.

### Key Relationships

- **User → Roles** — many-to-many (through UserRole)
- **Role → Permissions** — one-to-many; each permission targets an entry (or null for global)
- **Entry → Entry** — self-referencing parent/child tree
- **Entry → Blueprint** — one-to-one (optional); defines child schema
- **Blueprint → BlueprintField** — one-to-many; ordered field definitions
- **Entry → FieldValue** — one-to-many; values per field per locale
- **Entry → EntryRelation** — many-to-many (source/target) through relation fields
- **Entry → MediaRecord** — one-to-many; uploaded files
- **User → UserPreference** — one-to-many; UI state persistence (optionally scoped to an entry). Includes pagination page-size preference.
- **Locale → FieldValue** — one-to-many; each value belongs to a locale

### Site Settings

A key-value store for global configuration:

- Site name
- OTP expiry (minutes)
- Session duration (days)
- Max upload size (KB)
- Supported image formats
- Default/max pagination limits
- Rate limit (requests/min per IP)
- CORS allowed origins

---

## 12. Email System

- Uses **SMTP** (configurable host, port, user, pass)
- Currently sends only **OTP emails** with an HTML + plain text template
- Branded with the configured app name and the OTP code prominently displayed
- In development mode, emails are skipped and the code is returned in the API response

---

## 13. Media & File Storage

- **Firebase Cloud Storage** is used for all file uploads
- The backend generates a **signed upload URL** (15-minute expiry) so the frontend uploads directly to Firebase (no server bottleneck)
- A **MediaRecord** in the database tracks each upload: file name, MIME type, size, dimensions (for images), storage path, public URL, and who uploaded it
- Public URLs follow the pattern: `https://storage.googleapis.com/{bucket}/{path}`

---

## 14. Development Conventions

- **Composables** are the primary pattern for extracting reusable logic
- **Components** should be under 120 lines (200 max for exceptions); break into smaller components or composables if larger
- **SCSS scoped** for component styles; no CSS condensing for line-count purposes
- **No prop drilling or event bubbling** for marginal gains
- **All API data must be reactive** — watch locale changes, use computed properties
- **Zod** for form validation schemas
- **Auto-slug generation** from titles (kebab-case)
- **Soft-delete pattern** — archive instead of permanent delete
- Images should be **downloaded and self-hosted**, not referenced from remote servers

---

## 15. Environment Configuration

The app requires the following environment variables:

| Variable                                                                                                                                                                    | Purpose                              |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `DATABASE_URL`                                                                                                                                                              | PostgreSQL connection string         |
| `NUXT_SESSION_SECRET`                                                                                                                                                       | Secret for session encryption        |
| `NUXT_SMTP_HOST`, `NUXT_SMTP_PORT`, `NUXT_SMTP_USER`, `NUXT_SMTP_PASS`, `NUXT_SMTP_FROM`                                                                                    | SMTP email configuration             |
| `NUXT_FIREBASE_SERVICE_ACCOUNT`                                                                                                                                             | Firebase Admin SDK JSON credentials  |
| `NUXT_FIREBASE_STORAGE_BUCKET`                                                                                                                                              | Firebase Cloud Storage bucket name   |
| `NUXT_PUBLIC_FIREBASE_API_KEY`, `NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NUXT_PUBLIC_FIREBASE_PROJECT_ID`, `NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NUXT_PUBLIC_FIREBASE_APP_ID` | Firebase client-side config          |
| `NUXT_PUBLIC_GOOGLE_PLACES_API_KEY`                                                                                                                                         | Google Places API key for geo fields |
| `NUXT_PUBLIC_APP_NAME`                                                                                                                                                      | Display name (default: "FlexCMS")    |

---

## 16. Database Seeding

On first setup, the seed script creates:

1. Two locales: English (default) and Brazilian Portuguese
2. All 17 field type definitions with icons, descriptions, and JSON Schema configs
3. Nine site settings with sensible defaults
4. Three system roles: Super Admin, Editor, Viewer (with appropriate permissions)
5. One initial admin user (email/name from environment variables)

---

## 17. Security Considerations

- **Passwordless auth** eliminates password-related vulnerabilities
- **OTP codes** are SHA-256 hashed before storage, with 15-minute expiry
- **Session tokens** are long random strings (48 chars), stored in HttpOnly cookies
- **RBAC** is enforced at the API level — every mutating endpoint checks permissions
- **Server middleware** protects all `/api/**` routes except auth and public v1 endpoints
- **Signed upload URLs** expire after 15 minutes
- **Soft-delete** prevents accidental permanent data loss
- **Self-protection** — users cannot deactivate or delete their own account
- **System roles** are protected from modification or deletion

---

## 18. Local Development Setup

1. **Install NVM** (Node Version Manager) — required to manage Node.js versions
2. Install and use Node.js 24: `nvm install 24 && nvm use 24`
3. Set Node 24 as default: `nvm alias default 24`
4. Install dependencies: `pnpm install`
5. If `better-sqlite3` fails to load after switching Node versions, rebuild it:
   ```
   cd node_modules/.pnpm/better-sqlite3@12.6.2/node_modules/better-sqlite3 && pnpm rebuild
   ```
6. Start the dev server: `pnpm dev`
