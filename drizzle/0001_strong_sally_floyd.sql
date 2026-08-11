ALTER TABLE "time_entries" DROP CONSTRAINT "entry_break_valid";--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "entry_break_valid" CHECK ("time_entries"."break_minutes" >= 0);