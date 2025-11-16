import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

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
    .query(async ({ input }) => {
      const field = await db.getFieldById(input.id);
      if (!field) throw new TRPCError({ code: "NOT_FOUND" });
      return field;
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
      const farm = await db.getFarmById(input.farmId);
      if (!farm) throw new TRPCError({ code: "NOT_FOUND" });
      if (farm.ownerId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
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
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await db.updateField(id, data);
    }),
  
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await db.deleteField(input.id);
    }),
});

// ============ IOT DEVICE ROUTER ============

const iotRouter = router({
  listByField: protectedProcedure
    .input(z.object({ fieldId: z.number() }))
    .query(async ({ input }) => {
      return await db.getDevicesByFieldId(input.fieldId);
    }),
  
  listByFarm: protectedProcedure
    .input(z.object({ farmId: z.number() }))
    .query(async ({ input }) => {
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
    .mutation(async ({ input }) => {
      return await db.createIoTDevice(input);
    }),
  
  updateStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["online", "offline", "maintenance", "error"]),
    }))
    .mutation(async ({ input }) => {
      return await db.updateDeviceStatus(input.id, input.status);
    }),
  
  getReadings: protectedProcedure
    .input(z.object({
      deviceId: z.number(),
      limit: z.number().optional(),
    }))
    .query(async ({ input }) => {
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
    .mutation(async ({ input }) => {
      return await db.createSensorReading(input);
    }),
});

// ============ IRRIGATION ROUTER ============

const irrigationRouter = router({
  listByField: protectedProcedure
    .input(z.object({ fieldId: z.number() }))
    .query(async ({ input }) => {
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
    .mutation(async ({ input }) => {
      return await db.createIrrigationEvent(input);
    }),
});

// ============ FERTILIZATION ROUTER ============

const fertilizationRouter = router({
  listByField: protectedProcedure
    .input(z.object({ fieldId: z.number() }))
    .query(async ({ input }) => {
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
    .mutation(async ({ input }) => {
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
    .query(async ({ input }) => {
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
    .mutation(async ({ input }) => {
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
    .mutation(async ({ input }) => {
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
    .mutation(async ({ input }) => {
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
    .query(async ({ input }) => {
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
    .mutation(async ({ input }) => {
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
});

export type AppRouter = typeof appRouter;
