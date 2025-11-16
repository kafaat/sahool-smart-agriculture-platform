CREATE TABLE `alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`farmId` int,
	`fieldId` int,
	`alertType` enum('weather','irrigation','pest','disease','harvest','maintenance','system') NOT NULL,
	`severity` enum('info','warning','critical') DEFAULT 'info',
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`isRead` boolean DEFAULT false,
	`actionRequired` boolean DEFAULT false,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crops` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`scientificName` varchar(255),
	`category` varchar(100),
	`growingSeasonDays` int,
	`waterRequirement` enum('low','medium','high'),
	`temperatureMin` int,
	`temperatureMax` int,
	`soilTypePreferred` varchar(100),
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `crops_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `farms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`totalArea` int NOT NULL,
	`location` text,
	`address` text,
	`country` varchar(100),
	`region` varchar(100),
	`farmType` enum('crop','livestock','mixed','greenhouse','organic') DEFAULT 'crop',
	`status` enum('active','inactive','maintenance') DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `farms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fertilizationEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fieldId` int NOT NULL,
	`date` timestamp NOT NULL,
	`fertilizerType` varchar(100),
	`amount` int,
	`method` enum('broadcast','banding','foliar','fertigation'),
	`npkRatio` varchar(50),
	`cost` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fertilizationEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fields` (
	`id` int AUTO_INCREMENT NOT NULL,
	`farmId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`area` int NOT NULL,
	`boundaries` text,
	`soilType` varchar(100),
	`cropType` varchar(100),
	`plantingDate` timestamp,
	`expectedHarvestDate` timestamp,
	`irrigationType` enum('drip','sprinkler','flood','pivot','manual'),
	`status` enum('active','fallow','preparing','harvesting') DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fields_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `harvestRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fieldId` int NOT NULL,
	`cropType` varchar(100),
	`harvestDate` timestamp NOT NULL,
	`quantity` int,
	`quality` enum('excellent','good','fair','poor'),
	`marketPrice` int,
	`totalRevenue` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `harvestRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `iotDevices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fieldId` int,
	`farmId` int,
	`deviceId` varchar(100) NOT NULL,
	`deviceType` enum('soil_moisture','temperature','humidity','ph','weather_station','camera','valve','pump') NOT NULL,
	`manufacturer` varchar(100),
	`model` varchar(100),
	`protocol` varchar(50),
	`location` text,
	`status` enum('online','offline','maintenance','error') DEFAULT 'offline',
	`lastReading` timestamp,
	`batteryLevel` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `iotDevices_id` PRIMARY KEY(`id`),
	CONSTRAINT `iotDevices_deviceId_unique` UNIQUE(`deviceId`)
);
--> statement-breakpoint
CREATE TABLE `irrigationEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fieldId` int NOT NULL,
	`startTime` timestamp NOT NULL,
	`endTime` timestamp,
	`waterAmount` int,
	`method` enum('drip','sprinkler','flood','pivot','manual'),
	`automated` boolean DEFAULT false,
	`deviceId` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `irrigationEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `marketPrices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cropType` varchar(100) NOT NULL,
	`region` varchar(100),
	`price` int NOT NULL,
	`currency` varchar(10) DEFAULT 'USD',
	`source` varchar(100),
	`date` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `marketPrices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recommendations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`farmId` int,
	`fieldId` int,
	`recommendationType` enum('irrigation','fertilization','pest_control','planting','harvesting','general') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`priority` enum('low','medium','high') DEFAULT 'medium',
	`status` enum('pending','accepted','rejected','completed') DEFAULT 'pending',
	`confidence` int,
	`validUntil` timestamp,
	`appliedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `recommendations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`farmId` int,
	`reportType` enum('monthly','seasonal','annual','custom','government') NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text,
	`fileUrl` text,
	`startDate` timestamp,
	`endDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sensorReadings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`deviceId` int NOT NULL,
	`fieldId` int,
	`readingType` varchar(100) NOT NULL,
	`value` text NOT NULL,
	`unit` varchar(50),
	`timestamp` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sensorReadings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `weatherData` (
	`id` int AUTO_INCREMENT NOT NULL,
	`farmId` int NOT NULL,
	`timestamp` timestamp NOT NULL,
	`temperature` int,
	`humidity` int,
	`rainfall` int,
	`windSpeed` int,
	`windDirection` int,
	`pressure` int,
	`uvIndex` int,
	`source` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `weatherData_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','farmer_small','farmer_medium','enterprise','government') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `country` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `region` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `language` varchar(10) DEFAULT 'ar';--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionTier` enum('free','pro','enterprise') DEFAULT 'free';