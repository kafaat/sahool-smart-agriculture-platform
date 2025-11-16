import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with role-based access for different user types
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "farmer_small", "farmer_medium", "enterprise", "government"]).default("user").notNull(),
  phone: varchar("phone", { length: 20 }),
  country: varchar("country", { length: 100 }),
  region: varchar("region", { length: 100 }),
  language: varchar("language", { length: 10 }).default("ar"),
  subscriptionTier: mysqlEnum("subscriptionTier", ["free", "pro", "enterprise"]).default("free"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

/**
 * Farms table - represents agricultural farms
 */
export const farms = mysqlTable("farms", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  totalArea: int("totalArea").notNull(), // in square meters
  location: text("location"), // JSON string with lat/lng
  address: text("address"),
  country: varchar("country", { length: 100 }),
  region: varchar("region", { length: 100 }),
  farmType: mysqlEnum("farmType", ["crop", "livestock", "mixed", "greenhouse", "organic"]).default("crop"),
  status: mysqlEnum("status", ["active", "inactive", "maintenance"]).default("active"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Fields table - represents individual fields within farms
 */
export const fields = mysqlTable("fields", {
  id: int("id").autoincrement().primaryKey(),
  farmId: int("farmId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  area: int("area").notNull(), // in square meters
  boundaries: text("boundaries"), // JSON string with polygon coordinates
  soilType: varchar("soilType", { length: 100 }),
  cropType: varchar("cropType", { length: 100 }),
  plantingDate: timestamp("plantingDate"),
  expectedHarvestDate: timestamp("expectedHarvestDate"),
  irrigationType: mysqlEnum("irrigationType", ["drip", "sprinkler", "flood", "pivot", "manual"]),
  status: mysqlEnum("status", ["active", "fallow", "preparing", "harvesting"]).default("active"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * IoT Devices table - represents sensors and actuators
 */
export const iotDevices = mysqlTable("iotDevices", {
  id: int("id").autoincrement().primaryKey(),
  fieldId: int("fieldId"),
  farmId: int("farmId"),
  deviceId: varchar("deviceId", { length: 100 }).notNull().unique(),
  deviceType: mysqlEnum("deviceType", ["soil_moisture", "temperature", "humidity", "ph", "weather_station", "camera", "valve", "pump"]).notNull(),
  manufacturer: varchar("manufacturer", { length: 100 }),
  model: varchar("model", { length: 100 }),
  protocol: varchar("protocol", { length: 50 }), // LoRaWAN, MQTT, etc.
  location: text("location"), // JSON string with lat/lng
  status: mysqlEnum("status", ["online", "offline", "maintenance", "error"]).default("offline"),
  lastReading: timestamp("lastReading"),
  batteryLevel: int("batteryLevel"), // percentage
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Sensor Readings table - stores IoT sensor data
 */
export const sensorReadings = mysqlTable("sensorReadings", {
  id: int("id").autoincrement().primaryKey(),
  deviceId: int("deviceId").notNull(),
  fieldId: int("fieldId"),
  readingType: varchar("readingType", { length: 100 }).notNull(),
  value: text("value").notNull(), // stored as string to handle different data types
  unit: varchar("unit", { length: 50 }),
  timestamp: timestamp("timestamp").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Irrigation Events table - tracks irrigation activities
 */
export const irrigationEvents = mysqlTable("irrigationEvents", {
  id: int("id").autoincrement().primaryKey(),
  fieldId: int("fieldId").notNull(),
  startTime: timestamp("startTime").notNull(),
  endTime: timestamp("endTime"),
  waterAmount: int("waterAmount"), // in liters
  method: mysqlEnum("method", ["drip", "sprinkler", "flood", "pivot", "manual"]),
  automated: boolean("automated").default(false),
  deviceId: int("deviceId"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Fertilization Events table - tracks fertilization activities
 */
export const fertilizationEvents = mysqlTable("fertilizationEvents", {
  id: int("id").autoincrement().primaryKey(),
  fieldId: int("fieldId").notNull(),
  date: timestamp("date").notNull(),
  fertilizerType: varchar("fertilizerType", { length: 100 }),
  amount: int("amount"), // in kg
  method: mysqlEnum("method", ["broadcast", "banding", "foliar", "fertigation"]),
  npkRatio: varchar("npkRatio", { length: 50 }), // e.g., "10-10-10"
  cost: int("cost"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Weather Data table - stores weather information
 */
export const weatherData = mysqlTable("weatherData", {
  id: int("id").autoincrement().primaryKey(),
  farmId: int("farmId").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  temperature: int("temperature"), // in celsius * 10 (e.g., 25.5°C = 255)
  humidity: int("humidity"), // percentage
  rainfall: int("rainfall"), // in mm * 10
  windSpeed: int("windSpeed"), // in km/h * 10
  windDirection: int("windDirection"), // in degrees
  pressure: int("pressure"), // in hPa
  uvIndex: int("uvIndex"),
  source: varchar("source", { length: 50 }), // API, sensor, etc.
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Alerts table - stores system alerts and notifications
 */
export const alerts = mysqlTable("alerts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  farmId: int("farmId"),
  fieldId: int("fieldId"),
  alertType: mysqlEnum("alertType", ["weather", "irrigation", "pest", "disease", "harvest", "maintenance", "system"]).notNull(),
  severity: mysqlEnum("severity", ["info", "warning", "critical"]).default("info"),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("isRead").default(false),
  actionRequired: boolean("actionRequired").default(false),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Recommendations table - AI-generated farming recommendations
 */
export const recommendations = mysqlTable("recommendations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  farmId: int("farmId"),
  fieldId: int("fieldId"),
  recommendationType: mysqlEnum("recommendationType", ["irrigation", "fertilization", "pest_control", "planting", "harvesting", "general"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium"),
  status: mysqlEnum("status", ["pending", "accepted", "rejected", "completed"]).default("pending"),
  confidence: int("confidence"), // AI confidence score (0-100)
  validUntil: timestamp("validUntil"),
  appliedAt: timestamp("appliedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Crops table - crop database
 */
export const crops = mysqlTable("crops", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  scientificName: varchar("scientificName", { length: 255 }),
  category: varchar("category", { length: 100 }),
  growingSeasonDays: int("growingSeasonDays"),
  waterRequirement: mysqlEnum("waterRequirement", ["low", "medium", "high"]),
  temperatureMin: int("temperatureMin"), // in celsius
  temperatureMax: int("temperatureMax"),
  soilTypePreferred: varchar("soilTypePreferred", { length: 100 }),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Harvest Records table
 */
export const harvestRecords = mysqlTable("harvestRecords", {
  id: int("id").autoincrement().primaryKey(),
  fieldId: int("fieldId").notNull(),
  cropType: varchar("cropType", { length: 100 }),
  harvestDate: timestamp("harvestDate").notNull(),
  quantity: int("quantity"), // in kg
  quality: mysqlEnum("quality", ["excellent", "good", "fair", "poor"]),
  marketPrice: int("marketPrice"), // price per kg in cents
  totalRevenue: int("totalRevenue"), // in cents
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Market Prices table - track crop market prices
 */
export const marketPrices = mysqlTable("marketPrices", {
  id: int("id").autoincrement().primaryKey(),
  cropType: varchar("cropType", { length: 100 }).notNull(),
  region: varchar("region", { length: 100 }),
  price: int("price").notNull(), // price per kg in cents
  currency: varchar("currency", { length: 10 }).default("USD"),
  source: varchar("source", { length: 100 }),
  date: timestamp("date").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Reports table - generated reports
 */
export const reports = mysqlTable("reports", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  farmId: int("farmId"),
  reportType: mysqlEnum("reportType", ["monthly", "seasonal", "annual", "custom", "government"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"), // JSON string with report data
  fileUrl: text("fileUrl"), // S3 URL for PDF report
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Farm = typeof farms.$inferSelect;
export type InsertFarm = typeof farms.$inferInsert;
export type Field = typeof fields.$inferSelect;
export type InsertField = typeof fields.$inferInsert;
export type IoTDevice = typeof iotDevices.$inferSelect;
export type InsertIoTDevice = typeof iotDevices.$inferInsert;
export type SensorReading = typeof sensorReadings.$inferSelect;
export type InsertSensorReading = typeof sensorReadings.$inferInsert;
export type IrrigationEvent = typeof irrigationEvents.$inferSelect;
export type InsertIrrigationEvent = typeof irrigationEvents.$inferInsert;
export type FertilizationEvent = typeof fertilizationEvents.$inferSelect;
export type InsertFertilizationEvent = typeof fertilizationEvents.$inferInsert;
export type WeatherData = typeof weatherData.$inferSelect;
export type InsertWeatherData = typeof weatherData.$inferInsert;
export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = typeof alerts.$inferInsert;
export type Recommendation = typeof recommendations.$inferSelect;
export type InsertRecommendation = typeof recommendations.$inferInsert;
export type Crop = typeof crops.$inferSelect;
export type InsertCrop = typeof crops.$inferInsert;
export type HarvestRecord = typeof harvestRecords.$inferSelect;
export type InsertHarvestRecord = typeof harvestRecords.$inferInsert;
export type MarketPrice = typeof marketPrices.$inferSelect;
export type InsertMarketPrice = typeof marketPrices.$inferInsert;
export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;
