CREATE TABLE `refreshToken` (
	`id` text NOT NULL,
	`user_id` text NOT NULL,
	`token` text(256) NOT NULL,
	`userAgent` text(256) NOT NULL,
	`expiresAt` text(24) NOT NULL,
	`revoked` integer DEFAULT false NOT NULL,
	`createdAt` text NOT NULL
);
