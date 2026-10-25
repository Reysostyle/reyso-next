import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_orders_status_history_status" AS ENUM('pending_payment', 'registered', 'sewing', 'ready', 'shipped', 'cancelled');
  CREATE TYPE "public"."enum_notifications_channel" AS ENUM('sms', 'telegram');
  CREATE TYPE "public"."enum_notifications_result" AS ENUM('sent', 'failed', 'not_configured');
  CREATE TABLE "orders_status_history" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"status" "enum_orders_status_history_status",
  	"at" timestamp(3) with time zone
  );
  
  CREATE TABLE "notifications" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order_id" integer,
  	"channel" "enum_notifications_channel" NOT NULL,
  	"to" varchar,
  	"text" varchar NOT NULL,
  	"result" "enum_notifications_result" NOT NULL,
  	"error" varchar,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "notifications_id" integer;
  ALTER TABLE "orders_status_history" ADD CONSTRAINT "orders_status_history_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "notifications" ADD CONSTRAINT "notifications_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "orders_status_history_order_idx" ON "orders_status_history" USING btree ("_order");
  CREATE INDEX "orders_status_history_parent_id_idx" ON "orders_status_history" USING btree ("_parent_id");
  CREATE INDEX "notifications_order_idx" ON "notifications" USING btree ("order_id");
  CREATE INDEX "notifications_updated_at_idx" ON "notifications" USING btree ("updated_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_notifications_fk" FOREIGN KEY ("notifications_id") REFERENCES "public"."notifications"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_notifications_id_idx" ON "payload_locked_documents_rels" USING btree ("notifications_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "orders_status_history" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "notifications" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "orders_status_history" CASCADE;
  DROP TABLE "notifications" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_notifications_fk";
  
  DROP INDEX "payload_locked_documents_rels_notifications_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "notifications_id";
  DROP TYPE "public"."enum_orders_status_history_status";
  DROP TYPE "public"."enum_notifications_channel";
  DROP TYPE "public"."enum_notifications_result";`)
}
