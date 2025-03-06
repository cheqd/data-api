CREATE TYPE "public"."denoms_enum_mainnet" AS ENUM('ncheq');--> statement-breakpoint
CREATE TYPE "public"."denoms_enum_testnet" AS ENUM('ncheq');--> statement-breakpoint
CREATE TYPE "public"."operation_type_enum_mainnet" AS ENUM('cheqd.did.v2.MsgCreateDidDoc', 'cheqd.did.v2.MsgUpdateDidDoc', 'cheqd.did.v2.MsgDeactivateDidDoc', 'cheqd.resource.v2.MsgCreateResource');--> statement-breakpoint
CREATE TYPE "public"."operation_type_enum_testnet" AS ENUM('cheqd.did.v2.MsgCreateDidDoc', 'cheqd.did.v2.MsgUpdateDidDoc', 'cheqd.did.v2.MsgDeactivateDidDoc', 'cheqd.resource.v2.MsgCreateResource');--> statement-breakpoint
CREATE TABLE "denom_mainnet" (
	"id" serial PRIMARY KEY NOT NULL,
	"ledger_denom" varchar NOT NULL,
	"friendly_denom" "denoms_enum_mainnet" NOT NULL,
	"exponent" integer NOT NULL,
	"description" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "denom_testnet" (
	"id" serial PRIMARY KEY NOT NULL,
	"ledger_denom" varchar NOT NULL,
	"friendly_denom" "denoms_enum_testnet" NOT NULL,
	"exponent" integer NOT NULL,
	"description" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "did_mainnet" (
	"id" serial PRIMARY KEY NOT NULL,
	"did_id" varchar(54) NOT NULL,
	"operationType" bigint NOT NULL,
	"fee_payer" varchar(44) NOT NULL,
	"amount" bigint NOT NULL,
	"denom" bigint NOT NULL,
	"block_height" bigint NOT NULL,
	"transaction_hash" varchar(64) NOT NULL,
	"created_at" timestamp NOT NULL,
	"success" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "did_testnet" (
	"id" serial PRIMARY KEY NOT NULL,
	"did_id" varchar(54) NOT NULL,
	"operation_type" bigint NOT NULL,
	"fee_payer" varchar(44) NOT NULL,
	"amount" bigint NOT NULL,
	"denom" bigint NOT NULL,
	"block_height" bigint NOT NULL,
	"transaction_hash" varchar(64) NOT NULL,
	"created_at" timestamp NOT NULL,
	"success" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "operation_types_mainnet" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "operation_type_enum_mainnet" NOT NULL,
	"description" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "operation_types_mainnet_type_unique" UNIQUE("type")
);
--> statement-breakpoint
CREATE TABLE "operation_types_testnet" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "operation_type_enum_testnet" NOT NULL,
	"description" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "operation_types_testnet_type_unique" UNIQUE("type")
);
--> statement-breakpoint
CREATE TABLE "resource_mainnet" (
	"id" serial PRIMARY KEY NOT NULL,
	"resource_id" uuid NOT NULL,
	"resource_type" varchar NOT NULL,
	"resource_name" varchar NOT NULL,
	"operation_type" bigint NOT NULL,
	"did_id" varchar(54),
	"fee_payer" varchar(44) NOT NULL,
	"amount" bigint NOT NULL,
	"denom" bigint NOT NULL,
	"block_height" bigint NOT NULL,
	"transaction_hash" varchar(64) NOT NULL,
	"created_at" timestamp NOT NULL,
	"success" boolean NOT NULL,
	CONSTRAINT "resource_mainnet_transaction_hash_unique" UNIQUE("transaction_hash")
);
--> statement-breakpoint
CREATE TABLE "resource_testnet" (
	"id" serial PRIMARY KEY NOT NULL,
	"resource_id" uuid NOT NULL,
	"resource_type" varchar NOT NULL,
	"resource_name" varchar NOT NULL,
	"operation_type" bigint NOT NULL,
	"did_id" varchar(54),
	"fee_payer" varchar(44) NOT NULL,
	"amount" bigint NOT NULL,
	"denom" bigint NOT NULL,
	"block_height" bigint NOT NULL,
	"transaction_hash" varchar(64) NOT NULL,
	"created_at" timestamp NOT NULL,
	"success" boolean NOT NULL,
	CONSTRAINT "resource_testnet_transaction_hash_unique" UNIQUE("transaction_hash")
);
--> statement-breakpoint
ALTER TABLE "did_mainnet" ADD CONSTRAINT "did_mainnet_operationType_operation_types_mainnet_id_fk" FOREIGN KEY ("operationType") REFERENCES "public"."operation_types_mainnet"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "did_mainnet" ADD CONSTRAINT "did_mainnet_denom_denom_mainnet_id_fk" FOREIGN KEY ("denom") REFERENCES "public"."denom_mainnet"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "did_testnet" ADD CONSTRAINT "did_testnet_operation_type_operation_types_testnet_id_fk" FOREIGN KEY ("operation_type") REFERENCES "public"."operation_types_testnet"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "did_testnet" ADD CONSTRAINT "did_testnet_denom_denom_testnet_id_fk" FOREIGN KEY ("denom") REFERENCES "public"."denom_testnet"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_mainnet" ADD CONSTRAINT "resource_mainnet_operation_type_operation_types_mainnet_id_fk" FOREIGN KEY ("operation_type") REFERENCES "public"."operation_types_mainnet"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_mainnet" ADD CONSTRAINT "resource_mainnet_denom_denom_mainnet_id_fk" FOREIGN KEY ("denom") REFERENCES "public"."denom_mainnet"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_testnet" ADD CONSTRAINT "resource_testnet_operation_type_operation_types_testnet_id_fk" FOREIGN KEY ("operation_type") REFERENCES "public"."operation_types_testnet"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_testnet" ADD CONSTRAINT "resource_testnet_denom_denom_testnet_id_fk" FOREIGN KEY ("denom") REFERENCES "public"."denom_testnet"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_did_mainnet_tx_op_did" ON "did_mainnet" USING btree ("transaction_hash","operationType","did_id");--> statement-breakpoint
CREATE INDEX "idx_did_testnet_tx_op_did" ON "did_testnet" USING btree ("transaction_hash","operation_type","did_id");--> statement-breakpoint
CREATE INDEX "idx_resource_mainnet_tx_op_resource" ON "resource_mainnet" USING btree ("transaction_hash","operation_type","resource_id");--> statement-breakpoint
CREATE INDEX "idx_resource_testnet_tx_op_resource" ON "resource_testnet" USING btree ("transaction_hash","operation_type","resource_id");