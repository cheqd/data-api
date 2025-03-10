ALTER TABLE "resource_mainnet" DROP CONSTRAINT "resource_mainnet_transaction_hash_unique";--> statement-breakpoint
ALTER TABLE "resource_testnet" DROP CONSTRAINT "resource_testnet_transaction_hash_unique";--> statement-breakpoint
ALTER TABLE "denom_mainnet" ADD CONSTRAINT "denom_mainnet_ledger_denom_unique" UNIQUE("ledger_denom");--> statement-breakpoint
ALTER TABLE "denom_testnet" ADD CONSTRAINT "denom_testnet_ledger_denom_unique" UNIQUE("ledger_denom");