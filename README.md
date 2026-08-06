# Tempo

Tempo is a production-oriented time-tracking SaaS built with Next.js 16, TypeScript, Tailwind CSS, Better Auth, Drizzle ORM, and Neon PostgreSQL.

## Local development

1. Copy `.env.example` to `.env.local` and add a Neon `DATABASE_URL` and a random `BETTER_AUTH_SECRET` of at least 32 characters.
2. Install dependencies with `npm install`.
3. Apply the checked-in database migration with `npm run db:migrate`.
4. Start the app with `npm run dev`.

Without a database connection, authentication forms enter a clearly labelled local demo mode so the product UI can be reviewed. With `DATABASE_URL` configured, private routes use Better Auth's database-backed sessions.

## Production services

- `RESEND_API_KEY` and `EMAIL_FROM` enable verification and password-reset emails. Development safely logs an email preview instead.
- `BLOB_READ_WRITE_TOKEN` is reserved for private generated report files.
- Set `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` to `https://clockify.abdulwadood.com` in production.

## Commands

- `npm run dev` — development server
- `npm run build` — optimized production build
- `npm run typecheck` — strict TypeScript verification
- `npm run lint` — ESLint
- `npm run db:generate` — generate a versioned migration
- `npm run db:migrate` — apply versioned migrations
