import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import drizzle from 'eslint-plugin-drizzle';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all,
});

export default [
	...compat.extends(
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:prettier/recommended',
		'plugin:drizzle/recommended'
	),
	{
		ignores: ['build/', 'dist/', 'node_nodules/', '.wrangler/', '*.ignore'],
	},
	{
		plugins: {
			'@typescript-eslint': typescriptEslint,
			drizzle,
		},
		languageOptions: {
			globals: {
				...globals.node,
			},
			parser: tsParser,
			ecmaVersion: 2018,
			sourceType: 'module',
		},
		rules: {
			'drizzle/enforce-delete-with-where': ['error', { drizzleObjectName: ['dbClient', 'db'] }],
			'drizzle/enforce-update-with-where': ['error', { drizzleObjectName: ['dbClient', 'db'] }],
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					args: 'all',
					argsIgnorePattern: '^_',
					caughtErrors: 'all',
					caughtErrorsIgnorePattern: '^_',
					destructuredArrayIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					ignoreRestSiblings: true,
				},
			],
		},
	},
];
