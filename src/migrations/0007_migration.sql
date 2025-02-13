PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_refreshToken` (
	`id` text NOT NULL,
	`user_id` text NOT NULL,
	`token` text(600) NOT NULL,
	`userAgent` text(256) NOT NULL,
	`expiresAt` text(24) NOT NULL,
	`revoked` integer DEFAULT false NOT NULL,
	`createdAt` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_refreshToken`("id", "user_id", "token", "userAgent", "expiresAt", "revoked", "createdAt") SELECT "id", "user_id", "token", "userAgent", "expiresAt", "revoked", "createdAt" FROM `refreshToken`;--> statement-breakpoint
DROP TABLE `refreshToken`;--> statement-breakpoint
ALTER TABLE `__new_refreshToken` RENAME TO `refreshToken`;--> statement-breakpoint
PRAGMA foreign_keys=ON;