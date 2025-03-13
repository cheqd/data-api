import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	dialect: 'postgresql',
	schema: './src/database/schema.ts',
	out: './src/database/migrations/',
	verbose: true,
	dbCredentials: {
		url: process.env.DB_URL || 'postgres://postgres:postgres@localhost:5432/postgres',
	},
});
