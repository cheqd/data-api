ALTER TABLE "operation_types_mainnet" RENAME COLUMN "type" TO "ledger_operation_type";--> statement-breakpoint
ALTER TABLE "operation_types_testnet" RENAME COLUMN "type" TO "ledger_operation_type";--> statement-breakpoint
ALTER TABLE "operation_types_mainnet" DROP CONSTRAINT "operation_types_mainnet_type_unique";--> statement-breakpoint
ALTER TABLE "operation_types_testnet" DROP CONSTRAINT "operation_types_testnet_type_unique";--> statement-breakpoint
ALTER TABLE "denom_mainnet" ALTER COLUMN "ledger_denom" SET DATA TYPE denoms_enum_mainnet;--> statement-breakpoint
ALTER TABLE "denom_mainnet" ALTER COLUMN "ledger_denom" SET DEFAULT 'ncheq';--> statement-breakpoint
ALTER TABLE "denom_mainnet" ALTER COLUMN "friendly_denom" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "denom_mainnet" ALTER COLUMN "friendly_denom" SET DEFAULT 'CHEQ';--> statement-breakpoint
ALTER TABLE "denom_testnet" ALTER COLUMN "ledger_denom" SET DATA TYPE denoms_enum_testnet;--> statement-breakpoint
ALTER TABLE "denom_testnet" ALTER COLUMN "ledger_denom" SET DEFAULT 'ncheq';--> statement-breakpoint
ALTER TABLE "denom_testnet" ALTER COLUMN "friendly_denom" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "denom_testnet" ALTER COLUMN "friendly_denom" SET DEFAULT 'ncheq';--> statement-breakpoint
ALTER TABLE "operation_types_mainnet" ADD COLUMN "friendly_operation_type" varchar DEFAULT 'friendly' NOT NULL;--> statement-breakpoint
ALTER TABLE "operation_types_testnet" ADD COLUMN "friendly_operation_type" varchar DEFAULT 'friendly' NOT NULL;--> statement-breakpoint
ALTER TABLE "operation_types_mainnet" ADD CONSTRAINT "operation_types_mainnet_ledger_operation_type_unique" UNIQUE("ledger_operation_type");--> statement-breakpoint
ALTER TABLE "operation_types_testnet" ADD CONSTRAINT "operation_types_testnet_ledger_operation_type_unique" UNIQUE("ledger_operation_type");