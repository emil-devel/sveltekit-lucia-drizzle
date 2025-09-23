ALTER TABLE "profile" DROP CONSTRAINT "profile_name_user_username_fk";
--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profile_name_user_username_fk" FOREIGN KEY ("name") REFERENCES "public"."user"("username") ON DELETE cascade ON UPDATE cascade;