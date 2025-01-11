PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` text NOT NULL,
	`name` text(256) NOT NULL,
	`username` text(256) NOT NULL,
	`password` text(256),
	`email` text(256),
	`kats` integer DEFAULT 0,
	`rank` integer,
	`isActive` integer DEFAULT true NOT NULL,
	`isDeleted` integer DEFAULT false NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "name", "username", "password", "email", "kats", "rank", "isActive", "isDeleted", "createdAt") SELECT "id", "name", "username", "password", "email", "kats", "rank", "isActive", "isDeleted", "createdAt" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;