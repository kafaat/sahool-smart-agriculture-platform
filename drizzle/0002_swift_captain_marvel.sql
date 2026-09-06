CREATE TABLE `apiKeys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`keyPrefix` varchar(32) NOT NULL,
	`keyHash` varchar(128) NOT NULL,
	`scope` enum('full_access','read_only','limited') NOT NULL DEFAULT 'read_only',
	`status` enum('active','expired','revoked') NOT NULL DEFAULT 'active',
	`lastUsed` timestamp,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `apiKeys_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `communityGroups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` varchar(100),
	`members` int NOT NULL DEFAULT 1,
	`postsCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `communityGroups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `communityPosts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`authorName` varchar(255),
	`content` text NOT NULL,
	`likes` int NOT NULL DEFAULT 0,
	`comments` int NOT NULL DEFAULT 0,
	`groupName` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `communityPosts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crmActivities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`customerId` int,
	`customerName` varchar(255),
	`type` enum('call','meeting','email','task') NOT NULL,
	`description` text,
	`date` timestamp,
	`status` enum('scheduled','completed','cancelled') NOT NULL DEFAULT 'scheduled',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `crmActivities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320),
	`phone` varchar(40),
	`location` varchar(100),
	`farmsCount` int NOT NULL DEFAULT 0,
	`totalArea` int NOT NULL DEFAULT 0,
	`status` enum('active','vip','inactive') NOT NULL DEFAULT 'active',
	`lastContact` timestamp,
	`lifetimeValue` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `faqItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`question` varchar(500) NOT NULL,
	`answer` text NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `faqItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `integrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`slug` varchar(100) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`category` enum('gis','weather','communication','data','automation') NOT NULL,
	`enabled` boolean NOT NULL DEFAULT false,
	`status` enum('connected','disconnected','error') NOT NULL DEFAULT 'disconnected',
	`apiKeyRequired` boolean NOT NULL DEFAULT false,
	`hasApiKey` boolean NOT NULL DEFAULT false,
	`features` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `integrations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventoryItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` varchar(100),
	`quantity` int NOT NULL DEFAULT 0,
	`unit` varchar(50),
	`minStock` int NOT NULL DEFAULT 0,
	`price` int NOT NULL DEFAULT 0,
	`location` varchar(100),
	`status` enum('in_stock','low_stock','critical') NOT NULL DEFAULT 'in_stock',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inventoryItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `knowledgeArticles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`category` varchar(100),
	`content` text,
	`views` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `knowledgeArticles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `marketplaceListings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`price` int NOT NULL DEFAULT 0,
	`sellerName` varchar(255),
	`location` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `marketplaceListings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('irrigation','weather','disease','equipment','report','system') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pipelineDeals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`customerId` int,
	`customerName` varchar(255),
	`title` varchar(255) NOT NULL,
	`value` int NOT NULL DEFAULT 0,
	`stage` enum('lead','qualified','proposal','negotiation','won','lost') NOT NULL DEFAULT 'lead',
	`probability` int NOT NULL DEFAULT 0,
	`expectedClose` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pipelineDeals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `purchaseOrders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`code` varchar(50) NOT NULL,
	`supplier` varchar(255),
	`items` text,
	`totalAmount` int NOT NULL DEFAULT 0,
	`status` enum('pending','approved','delivered','cancelled') NOT NULL DEFAULT 'pending',
	`orderDate` timestamp,
	`expectedDelivery` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `purchaseOrders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `supportTickets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`subject` varchar(255) NOT NULL,
	`description` text,
	`status` enum('open','in_progress','resolved','closed') NOT NULL DEFAULT 'open',
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `supportTickets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workOrders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`code` varchar(50) NOT NULL,
	`field` varchar(255),
	`task` text,
	`assignedTo` varchar(255),
	`status` enum('scheduled','in_progress','completed','cancelled') NOT NULL DEFAULT 'scheduled',
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`startDate` timestamp,
	`dueDate` timestamp,
	`progress` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `workOrders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `status` enum('active','suspended','pending') DEFAULT 'active' NOT NULL;--> statement-breakpoint
CREATE INDEX `apikey_user_idx` ON `apiKeys` (`userId`);--> statement-breakpoint
CREATE INDEX `group_owner_idx` ON `communityGroups` (`ownerId`);--> statement-breakpoint
CREATE INDEX `post_user_idx` ON `communityPosts` (`userId`);--> statement-breakpoint
CREATE INDEX `activity_owner_idx` ON `crmActivities` (`ownerId`);--> statement-breakpoint
CREATE INDEX `customer_owner_idx` ON `customers` (`ownerId`);--> statement-breakpoint
CREATE INDEX `integration_user_idx` ON `integrations` (`userId`);--> statement-breakpoint
CREATE INDEX `inventory_owner_idx` ON `inventoryItems` (`ownerId`);--> statement-breakpoint
CREATE INDEX `article_user_idx` ON `knowledgeArticles` (`userId`);--> statement-breakpoint
CREATE INDEX `listing_user_idx` ON `marketplaceListings` (`userId`);--> statement-breakpoint
CREATE INDEX `notif_user_idx` ON `notifications` (`userId`);--> statement-breakpoint
CREATE INDEX `deal_owner_idx` ON `pipelineDeals` (`ownerId`);--> statement-breakpoint
CREATE INDEX `po_owner_idx` ON `purchaseOrders` (`ownerId`);--> statement-breakpoint
CREATE INDEX `ticket_user_idx` ON `supportTickets` (`userId`);--> statement-breakpoint
CREATE INDEX `wo_owner_idx` ON `workOrders` (`ownerId`);