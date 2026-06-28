# Database Migration Workflow

## CRITICAL RULE: Preventing Data Loss
When making any changes to the database schema (`lib/db/src/schema.ts`), you MUST strictly follow the migration workflow below.
Do NOT use `drizzle-kit push` or `drizzle-kit push --force` against production environments, as this can cause catastrophic data loss if columns are dropped or renamed unexpectedly.

## The Workflow
1. **Modify Schema**: Make the necessary changes to `lib/db/src/schema.ts`.
2. **Generate Migration Script**: Run the following command locally to generate a new `.sql` migration file in `lib/db/drizzle`:
   ```bash
   pnpm --filter @workspace/db run generate
   ```
3. **Mandatory Review**: You MUST pause and ask the user to manually review the generated `.sql` file, specifically looking for `DROP` commands. This is to ensure no data is wiped when a column is renamed or an ENUM is modified. Wait for explicit user confirmation before proceeding.
4. **Commit and Push**: Once approved by the user, commit the `schema.ts` changes, the `drizzle` folder contents (including the `.sql` file and `meta/` updates), and push to the remote repository.
5. **Deployment**: Railway (or the CI/CD pipeline) will automatically execute `drizzle-kit migrate` (via the `migrate` script in `lib/db/package.json`) during the build process to safely apply the migration to the live database.
