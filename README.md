# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Shared expense manager

The private expense manager is at `/expenses`. It is designed for quick entry on a phone: enter the amount, pick or type a category and optional subcategory, and save. New categories and subcategories can be created in their own autocomplete fields. Subcategory suggestions are scoped to the selected category. The ledger supports monthly totals, category totals, editing, and deletion. All phones read from the same database.

Before entering real expenses:

1. Run [`supabase/migrations/20260929000000_expenses.sql`](supabase/migrations/20260929000000_expenses.sql), [`supabase/migrations/20260929010000_expense_subcategories.sql`](supabase/migrations/20260929010000_expense_subcategories.sql), and [`supabase/migrations/20260929020000_private_access.sql`](supabase/migrations/20260929020000_private_access.sql) in order in the Supabase SQL editor.
2. Set the server environment variables `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` shown in `.env.example` on the deployment and local server. Never expose the secret key with a `VITE_` prefix.
3. Run `npm run access:set-password`. This generates a new password, stores only its salted hash in Supabase, and prints the password once. To choose a password instead, pipe it to the command on standard input. Open `/expenses` on each phone and enter that password.

If the database is not configured, the page remains readable but saving is disabled, so no entry appears to sync when it has only been saved on one device.

PosApp revenue is shown as disconnected until the cafe's PosApp Open API access and revenue endpoint details are provided. The existing static insights data is not presented as live revenue.

### Private pages

The homepage (`/`, `/en`, `/vi`) is public. All other pages require a password.
With Supabase configured, the password hash is stored in `private_access` and
only the server's secret key can read it. Keep the key in the server environment:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-server-only-secret-key
```

A successful sign-in stays valid for 60 days on that device. Changing the
password revokes previous sessions within 30 seconds. The session signing key
is derived from the Supabase secret key unless `ACCESS_SESSION_SECRET` is set.
Keep either key stable across deployments. Without Supabase, local development
can use `ACCESS_PASSWORD` and `ACCESS_SESSION_SECRET` as a legacy fallback.

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.
