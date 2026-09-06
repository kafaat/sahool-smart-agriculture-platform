import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import type { User } from "../drizzle/schema";
import {
  erpRouter, crmRouter, communityRouter, supportRouter,
  notificationRouter, apiKeyRouter, integrationRouter, adminRouter,
} from "./moduleRouters";

// ============ AUTHORIZATION HELPERS ============
// Every resource is scoped to a farm owner. These helpers resolve the owning
// farm for a resource and enforce that the caller owns it (admins bypass).

function isAdmin(user: User) {
  return user.role === "admin";
}

async function assertFarmAccess(farmId: number, user: User) {
  const farm = await db.getFarmById(farmId);
  if (!farm) throw new TRPCError({ code: "NOT_FOUND", message: "Farm not found" });
  if (farm.ownerId !== user.id && !isAdmin(user)) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return farm;
}

async function assertFieldAccess(fieldId: number, user: User) {
  const field = await db.getFieldById(fieldId);
  if (!field) throw new TRPCError({ code: "NOT_FOUND", message: "Field not found" });
  await assertFarmAccess(field.farmId, user);
  return field;
}

async function assertDeviceAccess(deviceId: number, user: User) {
  const device = await db.getDeviceById(deviceId);
  if (!device) throw new TRPCError({ code: "NOT_FOUND", message: "Device not found" });
  if (device.farmId != null) {
    await assertFarmAccess(device.farmId, user);
  } else if (device.fieldId != null) {
    await assertFieldAccess(device.fieldId, user);
  } else {
    // Orphan device with no farm/field association — deny by default.
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return device;
}

// ============ FARM ROUTER ============

const farmRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await db.getFarmsByOwnerId(ctx.user.id);
  }),
  
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const farm = await db.getFarmById(input.id);
      if (!farm) throw new TRPCError({ code: "NOT_FOUND" });
      if (farm.ownerId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return farm;
    }),
  
  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      totalArea: z.number(),
      location: z.string().optional(),
      address: z.string().optional(),
      country: z.string().optional(),
      region: z.string().optional(),
      farmType: z.enum(["crop", "livestock", "mixed", "greenhouse", "organic"]).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return await db.createFarm({
        ...input,
        ownerId: ctx.user.id,
      });
    }),
  
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      totalArea: z.number().optional(),
      location: z.string().optional(),
      address: z.string().optional(),
      farmType: z.enum(["crop", "livestock", "mixed", "greenhouse", "organic"]).optional(),
      status: z.enum(["active", "inactive", "maintenance"]).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const farm = await db.getFarmById(id);
      if (!farm) throw new TRPCError({ code: "NOT_FOUND" });
      if (farm.ownerId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return await db.updateFarm(id, data);
    }),
  
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const farm = await db.getFarmById(input.id);
      if (!farm) throw new TRPCError({ code: "NOT_FOUND" });
      if (farm.ownerId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return await db.deleteFarm(input.id);
    }),
});

// ============ FIELD ROUTER ============

const fieldRouter = router({
  listByFarm: protectedProcedure
    .input(z.object({ farmId: z.number() }))
    .query(async ({ input, ctx }) => {
      const farm = await db.getFarmById(input.farmId);
      if (!farm) throw new TRPCError({ code: "NOT_FOUND" });
      if (farm.ownerId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return await db.getFieldsByFarmId(input.farmId);
    }),
  
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      return await assertFieldAccess(input.id, ctx.user);
    }),

  create: protectedProcedure
    .input(z.object({
      farmId: z.number(),
      name: z.string(),
      area: z.number(),
      boundaries: z.string().optional(),
      soilType: z.string().optional(),
      cropType: z.string().optional(),
      plantingDate: z.date().optional(),
      expectedHarvestDate: z.date().optional(),
      irrigationType: z.enum(["drip", "sprinkler", "flood", "pivot", "manual"]).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      await assertFarmAccess(input.farmId, ctx.user);
      return await db.createField(input);
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      area: z.number().optional(),
      boundaries: z.string().optional(),
      soilType: z.string().optional(),
      cropType: z.string().optional(),
      plantingDate: z.date().optional(),
      expectedHarvestDate: z.date().optional(),
      irrigationType: z.enum(["drip", "sprinkler", "flood", "pivot", "manual"]).optional(),
      status: z.enum(["active", "fallow", "preparing", "harvesting"]).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      await assertFieldAccess(id, ctx.user);
      return await db.updateField(id, data);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await assertFieldAccess(input.id, ctx.user);
      return await db.deleteField(input.id);
    }),
});

// ============ IOT DEVICE ROUTER ============

const iotRouter = router({
  listByField: protectedProcedure
    .input(z.object({ fieldId: z.number() }))
    .query(async ({ input, ctx }) => {
      await assertFieldAccess(input.fieldId, ctx.user);
      return await db.getDevicesByFieldId(input.fieldId);
    }),

  listByFarm: protectedProcedure
    .input(z.object({ farmId: z.number() }))
    .query(async ({ input, ctx }) => {
      await assertFarmAccess(input.farmId, ctx.user);
      return await db.getDevicesByFarmId(input.farmId);
    }),

  create: protectedProcedure
    .input(z.object({
      fieldId: z.number().optional(),
      farmId: z.number().optional(),
      deviceId: z.string(),
      deviceType: z.enum(["soil_moisture", "temperature", "humidity", "ph", "weather_station", "camera", "valve", "pump"]),
      manufacturer: z.string().optional(),
      model: z.string().optional(),
      protocol: z.string().optional(),
      location: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // A device must be tied to a farm or field the caller owns.
      if (input.farmId != null) {
        await assertFarmAccess(input.farmId, ctx.user);
      } else if (input.fieldId != null) {
        await assertFieldAccess(input.fieldId, ctx.user);
      } else {
        throw new TRPCError({ code: "BAD_REQUEST", message: "farmId or fieldId is required" });
      }
      return await db.createIoTDevice(input);
    }),

  updateStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["online", "offline", "maintenance", "error"]),
    }))
    .mutation(async ({ input, ctx }) => {
      await assertDeviceAccess(input.id, ctx.user);
      return await db.updateDeviceStatus(input.id, input.status);
    }),

  getReadings: protectedProcedure
    .input(z.object({
      deviceId: z.number(),
      limit: z.number().optional(),
    }))
    .query(async ({ input, ctx }) => {
      await assertDeviceAccess(input.deviceId, ctx.user);
      return await db.getRecentReadingsByDevice(input.deviceId, input.limit);
    }),

  addReading: protectedProcedure
    .input(z.object({
      deviceId: z.number(),
      fieldId: z.number().optional(),
      readingType: z.string(),
      value: z.string(),
      unit: z.string().optional(),
      timestamp: z.date(),
    }))
    .mutation(async ({ input, ctx }) => {
      await assertDeviceAccess(input.deviceId, ctx.user);
      return await db.createSensorReading(input);
    }),
});

// ============ IRRIGATION ROUTER ============

const irrigationRouter = router({
  listByField: protectedProcedure
    .input(z.object({ fieldId: z.number() }))
    .query(async ({ input, ctx }) => {
      await assertFieldAccess(input.fieldId, ctx.user);
      return await db.getIrrigationEventsByField(input.fieldId);
    }),

  create: protectedProcedure
    .input(z.object({
      fieldId: z.number(),
      startTime: z.date(),
      endTime: z.date().optional(),
      waterAmount: z.number().optional(),
      method: z.enum(["drip", "sprinkler", "flood", "pivot", "manual"]).optional(),
      automated: z.boolean().optional(),
      deviceId: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      await assertFieldAccess(input.fieldId, ctx.user);
      return await db.createIrrigationEvent(input);
    }),
});

// ============ FERTILIZATION ROUTER ============

const fertilizationRouter = router({
  listByField: protectedProcedure
    .input(z.object({ fieldId: z.number() }))
    .query(async ({ input, ctx }) => {
      await assertFieldAccess(input.fieldId, ctx.user);
      return await db.getFertilizationEventsByField(input.fieldId);
    }),

  create: protectedProcedure
    .input(z.object({
      fieldId: z.number(),
      date: z.date(),
      fertilizerType: z.string().optional(),
      amount: z.number().optional(),
      method: z.enum(["broadcast", "banding", "foliar", "fertigation"]).optional(),
      npkRatio: z.string().optional(),
      cost: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      await assertFieldAccess(input.fieldId, ctx.user);
      return await db.createFertilizationEvent(input);
    }),
});

// ============ WEATHER ROUTER ============

const weatherRouter = router({
  getByFarm: protectedProcedure
    .input(z.object({
      farmId: z.number(),
      limit: z.number().optional(),
    }))
    .query(async ({ input, ctx }) => {
      await assertFarmAccess(input.farmId, ctx.user);
      return await db.getRecentWeatherByFarm(input.farmId, input.limit);
    }),

  add: protectedProcedure
    .input(z.object({
      farmId: z.number(),
      timestamp: z.date(),
      temperature: z.number().optional(),
      humidity: z.number().optional(),
      rainfall: z.number().optional(),
      windSpeed: z.number().optional(),
      windDirection: z.number().optional(),
      pressure: z.number().optional(),
      uvIndex: z.number().optional(),
      source: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      await assertFarmAccess(input.farmId, ctx.user);
      return await db.createWeatherData(input);
    }),
});

// ============ ALERT ROUTER ============

const alertRouter = router({
  list: protectedProcedure
    .input(z.object({ unreadOnly: z.boolean().optional() }))
    .query(async ({ input, ctx }) => {
      return await db.getAlertsByUser(ctx.user.id, input.unreadOnly);
    }),
  
  markAsRead: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const alert = await db.getAlertById(input.id);
      if (!alert) throw new TRPCError({ code: "NOT_FOUND" });
      if (alert.userId !== ctx.user.id && !isAdmin(ctx.user)) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return await db.markAlertAsRead(input.id);
    }),
  
  create: protectedProcedure
    .input(z.object({
      farmId: z.number().optional(),
      fieldId: z.number().optional(),
      alertType: z.enum(["weather", "irrigation", "pest", "disease", "harvest", "maintenance", "system"]),
      severity: z.enum(["info", "warning", "critical"]).optional(),
      title: z.string(),
      message: z.string(),
      actionRequired: z.boolean().optional(),
      expiresAt: z.date().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return await db.createAlert({
        ...input,
        userId: ctx.user.id,
      });
    }),
});

// ============ RECOMMENDATION ROUTER ============

const recommendationRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await db.getRecommendationsByUser(ctx.user.id);
  }),
  
  updateStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["pending", "accepted", "rejected", "completed"]),
    }))
    .mutation(async ({ input, ctx }) => {
      const rec = await db.getRecommendationById(input.id);
      if (!rec) throw new TRPCError({ code: "NOT_FOUND" });
      if (rec.userId !== ctx.user.id && !isAdmin(ctx.user)) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return await db.updateRecommendationStatus(input.id, input.status);
    }),
  
  create: protectedProcedure
    .input(z.object({
      farmId: z.number().optional(),
      fieldId: z.number().optional(),
      recommendationType: z.enum(["irrigation", "fertilization", "pest_control", "planting", "harvesting", "general"]),
      title: z.string(),
      description: z.string(),
      priority: z.enum(["low", "medium", "high"]).optional(),
      confidence: z.number().optional(),
      validUntil: z.date().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return await db.createRecommendation({
        ...input,
        userId: ctx.user.id,
      });
    }),
});

// ============ CROP ROUTER ============

const cropRouter = router({
  list: publicProcedure.query(async () => {
    return await db.getAllCrops();
  }),
  
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getCropById(input.id);
    }),
});

// ============ HARVEST ROUTER ============

const harvestRouter = router({
  listByField: protectedProcedure
    .input(z.object({ fieldId: z.number() }))
    .query(async ({ input, ctx }) => {
      await assertFieldAccess(input.fieldId, ctx.user);
      return await db.getHarvestRecordsByField(input.fieldId);
    }),

  create: protectedProcedure
    .input(z.object({
      fieldId: z.number(),
      cropType: z.string().optional(),
      harvestDate: z.date(),
      quantity: z.number().optional(),
      quality: z.enum(["excellent", "good", "fair", "poor"]).optional(),
      marketPrice: z.number().optional(),
      totalRevenue: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      await assertFieldAccess(input.fieldId, ctx.user);
      return await db.createHarvestRecord(input);
    }),
});

// ============ MARKET ROUTER ============

const marketRouter = router({
  latestPrices: publicProcedure.query(async () => {
    return await db.getLatestMarketPrices();
  }),
  
  pricesByCrop: publicProcedure
    .input(z.object({ cropType: z.string() }))
    .query(async ({ input }) => {
      return await db.getMarketPricesByCrop(input.cropType);
    }),
});

// ============ REPORT ROUTER ============

const reportRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await db.getReportsByUser(ctx.user.id);
  }),
  
  create: protectedProcedure
    .input(z.object({
      farmId: z.number().optional(),
      reportType: z.enum(["monthly", "seasonal", "annual", "custom", "government"]),
      title: z.string(),
      content: z.string().optional(),
      fileUrl: z.string().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return await db.createReport({
        ...input,
        userId: ctx.user.id,
      });
    }),
});

// ============ DASHBOARD ROUTER ============

const dashboardRouter = router({
  overview: protectedProcedure.query(async ({ ctx }) => {
    const farms = await db.getFarmsByOwnerId(ctx.user.id);
    const alerts = await db.getAlertsByUser(ctx.user.id, true);
    const recommendations = await db.getRecommendationsByUser(ctx.user.id);
    
    return {
      totalFarms: farms.length,
      totalArea: farms.reduce((sum, farm) => sum + farm.totalArea, 0),
      unreadAlerts: alerts.length,
      pendingRecommendations: recommendations.filter(r => r.status === "pending").length,
      farms: farms.slice(0, 5), // Latest 5 farms
    };
  }),
});

// ============ MAIN APP ROUTER ============

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  
  // Feature routers
  farm: farmRouter,
  field: fieldRouter,
  iot: iotRouter,
  irrigation: irrigationRouter,
  fertilization: fertilizationRouter,
  weather: weatherRouter,
  alert: alertRouter,
  recommendation: recommendationRouter,
  crop: cropRouter,
  harvest: harvestRouter,
  market: marketRouter,
  report: reportRouter,
  dashboard: dashboardRouter,

  // Business modules
  erp: erpRouter,
  crm: crmRouter,
  community: communityRouter,
  support: supportRouter,
  notification: notificationRouter,
  apiKey: apiKeyRouter,
  integration: integrationRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
