import { Client } from 'pg';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

// Default timeout for PostgreSQL queries (30 seconds)
const DEFAULT_POSTGRES_TIMEOUT = 30000;

export type DrizzleClient = NodePgDatabase<typeof schema>;

interface DbEnv {
	HYPERDRIVE: {
		connectionString: string;
	};
	ENVIRONMENT: string;
}

export async function dbInit(env?: DbEnv): Promise<{ db: DrizzleClient; client: Client }> {
	try {
		// Create a single PostgreSQL client
		const connectionString = env.HYPERDRIVE.connectionString;

		const client = new Client({
			connectionString,
			application_name: `DATA_API_${env.ENVIRONMENT}`,
			query_timeout: DEFAULT_POSTGRES_TIMEOUT,
			statement_timeout: DEFAULT_POSTGRES_TIMEOUT,
			connectionTimeoutMillis: DEFAULT_POSTGRES_TIMEOUT / 5, // 6s
		});

		// Connect to the database
		await client.connect();

		// Create drizzle ORM instance WITHOUT the logger
		const db = drizzle(client, {
			schema,
			logger: false, // Disable query logging
		});

		return {
			db,
			client,
		};
	} catch (error) {
		console.error('Error connecting to the database:', (error as Error).message);
		throw error;
	}
}

// Helper function to close database connection
export async function dbClose(instance: { client: Client }): Promise<void> {
	if (instance?.client) {
		await instance.client.end();
	}
}
