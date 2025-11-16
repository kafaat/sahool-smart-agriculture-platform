import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, farms, fields, iotDevices, sensorReadings,
  irrigationEvents, fertilizationEvents, weatherData, alerts,
  recommendations, crops, harvestRecords, marketPrices, reports,
  InsertFarm, InsertField, InsertIoTDevice, InsertSensorReading,
  InsertIrrigationEvent, InsertFertilizationEvent, InsertWeatherData,
  InsertAlert, InsertRecommendation, InsertCrop, InsertHarvestRecord,
  InsertMarketPrice, InsertReport
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER OPERATIONS ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "phone", "country", "region", "language"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }
    if (user.subscriptionTier !== undefined) {
      values.subscriptionTier = user.subscriptionTier;
      updateSet.subscriptionTier = user.subscriptionTier;
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ FARM OPERATIONS ============

export async function createFarm(farm: InsertFarm) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(farms).values(farm);
  return result;
}

export async function getFarmsByOwnerId(ownerId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(farms).where(eq(farms.ownerId, ownerId));
}

export async function getFarmById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(farms).where(eq(farms.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateFarm(id: number, data: Partial<InsertFarm>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(farms).set(data).where(eq(farms.id, id));
}

export async function deleteFarm(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(farms).where(eq(farms.id, id));
}

// ============ FIELD OPERATIONS ============

export async function createField(field: InsertField) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(fields).values(field);
}

export async function getFieldsByFarmId(farmId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(fields).where(eq(fields.farmId, farmId));
}

export async function getFieldById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(fields).where(eq(fields.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateField(id: number, data: Partial<InsertField>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(fields).set(data).where(eq(fields.id, id));
}

export async function deleteField(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(fields).where(eq(fields.id, id));
}

// ============ IOT DEVICE OPERATIONS ============

export async function createIoTDevice(device: InsertIoTDevice) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(iotDevices).values(device);
}

export async function getDevicesByFieldId(fieldId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(iotDevices).where(eq(iotDevices.fieldId, fieldId));
}

export async function getDevicesByFarmId(farmId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(iotDevices).where(eq(iotDevices.farmId, farmId));
}

export async function updateDeviceStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(iotDevices).set({ status: status as any }).where(eq(iotDevices.id, id));
}

// ============ SENSOR READING OPERATIONS ============

export async function createSensorReading(reading: InsertSensorReading) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(sensorReadings).values(reading);
}

export async function getRecentReadingsByDevice(deviceId: number, limit: number = 100) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(sensorReadings)
    .where(eq(sensorReadings.deviceId, deviceId))
    .orderBy(desc(sensorReadings.timestamp))
    .limit(limit);
}

export async function getReadingsByFieldAndTimeRange(
  fieldId: number, 
  startTime: Date, 
  endTime: Date
) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(sensorReadings)
    .where(
      and(
        eq(sensorReadings.fieldId, fieldId),
        gte(sensorReadings.timestamp, startTime),
        lte(sensorReadings.timestamp, endTime)
      )
    )
    .orderBy(desc(sensorReadings.timestamp));
}

// ============ IRRIGATION OPERATIONS ============

export async function createIrrigationEvent(event: InsertIrrigationEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(irrigationEvents).values(event);
}

export async function getIrrigationEventsByField(fieldId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(irrigationEvents)
    .where(eq(irrigationEvents.fieldId, fieldId))
    .orderBy(desc(irrigationEvents.startTime));
}

// ============ FERTILIZATION OPERATIONS ============

export async function createFertilizationEvent(event: InsertFertilizationEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(fertilizationEvents).values(event);
}

export async function getFertilizationEventsByField(fieldId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(fertilizationEvents)
    .where(eq(fertilizationEvents.fieldId, fieldId))
    .orderBy(desc(fertilizationEvents.date));
}

// ============ WEATHER OPERATIONS ============

export async function createWeatherData(data: InsertWeatherData) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(weatherData).values(data);
}

export async function getRecentWeatherByFarm(farmId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(weatherData)
    .where(eq(weatherData.farmId, farmId))
    .orderBy(desc(weatherData.timestamp))
    .limit(limit);
}

// ============ ALERT OPERATIONS ============

export async function createAlert(alert: InsertAlert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(alerts).values(alert);
}

export async function getAlertsByUser(userId: number, unreadOnly: boolean = false) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = unreadOnly 
    ? and(eq(alerts.userId, userId), eq(alerts.isRead, false))
    : eq(alerts.userId, userId);
  
  return await db.select().from(alerts)
    .where(conditions)
    .orderBy(desc(alerts.createdAt));
}

export async function markAlertAsRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(alerts).set({ isRead: true }).where(eq(alerts.id, id));
}

// ============ RECOMMENDATION OPERATIONS ============

export async function createRecommendation(recommendation: InsertRecommendation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(recommendations).values(recommendation);
}

export async function getRecommendationsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(recommendations)
    .where(eq(recommendations.userId, userId))
    .orderBy(desc(recommendations.createdAt));
}

export async function updateRecommendationStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(recommendations).set({ status: status as any }).where(eq(recommendations.id, id));
}

// ============ CROP OPERATIONS ============

export async function getAllCrops() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(crops);
}

export async function getCropById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(crops).where(eq(crops.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ HARVEST OPERATIONS ============

export async function createHarvestRecord(record: InsertHarvestRecord) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(harvestRecords).values(record);
}

export async function getHarvestRecordsByField(fieldId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(harvestRecords)
    .where(eq(harvestRecords.fieldId, fieldId))
    .orderBy(desc(harvestRecords.harvestDate));
}

// ============ MARKET PRICE OPERATIONS ============

export async function getLatestMarketPrices() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(marketPrices)
    .orderBy(desc(marketPrices.date))
    .limit(100);
}

export async function getMarketPricesByCrop(cropType: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(marketPrices)
    .where(eq(marketPrices.cropType, cropType))
    .orderBy(desc(marketPrices.date));
}

// ============ REPORT OPERATIONS ============

export async function createReport(report: InsertReport) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(reports).values(report);
}

export async function getReportsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(reports)
    .where(eq(reports.userId, userId))
    .orderBy(desc(reports.createdAt));
}
