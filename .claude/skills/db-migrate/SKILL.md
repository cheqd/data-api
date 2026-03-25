---
name: db-migrate
description: Generate and review Drizzle ORM database migrations after schema changes
disable-model-invocation: true
---

# Database Migration Workflow

Run the full Drizzle ORM migration workflow after schema changes.

## Steps

1. Review changes in `src/database/schema.ts` to understand what changed
2. Run `npm run db:generate` to generate a new migration SQL file
3. Read the newly generated SQL file in `src/database/migrations/` and review it for correctness
4. Report the migration SQL to the user for confirmation before proceeding
5. Only run `npm run db:migrate` if the user explicitly confirms
