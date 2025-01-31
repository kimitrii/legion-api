CREATE TABLE `otps` (
	`id` text NOT NULL,
	`otpHash` text(256) NOT NULL,
	`user_id` text NOT NULL,
	`createdAt` text NOT NULL
);
