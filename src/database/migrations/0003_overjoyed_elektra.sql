ALTER TABLE "did_mainnet" RENAME COLUMN "operationType" TO "operation_type";--> statement-breakpoint
ALTER TABLE "did_mainnet" DROP CONSTRAINT "did_mainnet_operationType_operation_types_mainnet_id_fk";
--> statement-breakpoint
DROP INDEX "idx_did_mainnet_tx_op_did";--> statement-breakpoint
ALTER TABLE "did_mainnet" ADD CONSTRAINT "did_mainnet_operation_type_operation_types_mainnet_id_fk" FOREIGN KEY ("operation_type") REFERENCES "public"."operation_types_mainnet"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_did_mainnet_tx_op_did" ON "did_mainnet" USING btree ("transaction_hash","operation_type","did_id");