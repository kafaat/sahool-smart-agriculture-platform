// tRPC routers for the ERP / CRM / Community / Support / Notifications /
// API Keys / Integrations / Admin modules. Every per-user resource enforces
// ownership; shared community resources allow read-all but restrict writes to
// the author (or an admin).

import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import type { User } from "../drizzle/schema";
import * as db from "./db";
import * as mdb from "./dbModules";

function isAdmin(user: User) {
  return user.role === "admin";
}

/** Throws unless the caller owns the resource (or is an admin). */
function assertOwner(ownerId: number | null | undefined, user: User) {
  if (ownerId == null || (ownerId !== user.id && !isAdmin(user))) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
}

function notFound(): never {
  throw new TRPCError({ code: "NOT_FOUND" });
}

// ============================================================================
// ERP
// ============================================================================

const erpRouter = router({
  // --- Inventory ---
  listInventory: protectedProcedure.query(({ ctx }) => mdb.listInventory(ctx.user.id)),
  createInventory: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      category: z.string().optional(),
      quantity: z.number().int().min(0).default(0),
      unit: z.string().optional(),
      minStock: z.number().int().min(0).default(0),
      price: z.number().int().min(0).default(0),
      location: z.string().optional(),
      status: z.enum(["in_stock", "low_stock", "critical"]).optional(),
    }))
    .mutation(({ input, ctx }) => mdb.createInventoryItem({ ...input, ownerId: ctx.user.id })),
  updateInventory: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      category: z.string().optional(),
      quantity: z.number().int().optional(),
      unit: z.string().optional(),
      minStock: z.number().int().optional(),
      price: z.number().int().optional(),
      location: z.string().optional(),
      status: z.enum(["in_stock", "low_stock", "critical"]).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const row = await mdb.getInventoryItemById(input.id);
      if (!row) notFound();
      assertOwner(row.ownerId, ctx.user);
      const { id, ...data } = input;
      return mdb.updateInventoryItem(id, data);
    }),
  deleteInventory: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const row = await mdb.getInventoryItemById(input.id);
      if (!row) notFound();
      assertOwner(row.ownerId, ctx.user);
      return mdb.deleteInventoryItem(input.id);
    }),

  // --- Purchase orders ---
  listPurchaseOrders: protectedProcedure.query(({ ctx }) => mdb.listPurchaseOrders(ctx.user.id)),
  createPurchaseOrder: protectedProcedure
    .input(z.object({
      code: z.string().min(1),
      supplier: z.string().optional(),
      items: z.string().optional(),
      totalAmount: z.number().int().min(0).default(0),
      status: z.enum(["pending", "approved", "delivered", "cancelled"]).optional(),
      orderDate: z.date().optional(),
      expectedDelivery: z.date().optional(),
    }))
    .mutation(({ input, ctx }) => mdb.createPurchaseOrder({ ...input, ownerId: ctx.user.id })),
  updatePurchaseOrder: protectedProcedure
    .input(z.object({
      id: z.number(),
      supplier: z.string().optional(),
      items: z.string().optional(),
      totalAmount: z.number().int().optional(),
      status: z.enum(["pending", "approved", "delivered", "cancelled"]).optional(),
      orderDate: z.date().optional(),
      expectedDelivery: z.date().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const row = await mdb.getPurchaseOrderById(input.id);
      if (!row) notFound();
      assertOwner(row.ownerId, ctx.user);
      const { id, ...data } = input;
      return mdb.updatePurchaseOrder(id, data);
    }),
  deletePurchaseOrder: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const row = await mdb.getPurchaseOrderById(input.id);
      if (!row) notFound();
      assertOwner(row.ownerId, ctx.user);
      return mdb.deletePurchaseOrder(input.id);
    }),

  // --- Work orders ---
  listWorkOrders: protectedProcedure.query(({ ctx }) => mdb.listWorkOrders(ctx.user.id)),
  createWorkOrder: protectedProcedure
    .input(z.object({
      code: z.string().min(1),
      field: z.string().optional(),
      task: z.string().optional(),
      assignedTo: z.string().optional(),
      status: z.enum(["scheduled", "in_progress", "completed", "cancelled"]).optional(),
      priority: z.enum(["low", "medium", "high"]).optional(),
      startDate: z.date().optional(),
      dueDate: z.date().optional(),
      progress: z.number().int().min(0).max(100).default(0),
    }))
    .mutation(({ input, ctx }) => mdb.createWorkOrder({ ...input, ownerId: ctx.user.id })),
  updateWorkOrder: protectedProcedure
    .input(z.object({
      id: z.number(),
      field: z.string().optional(),
      task: z.string().optional(),
      assignedTo: z.string().optional(),
      status: z.enum(["scheduled", "in_progress", "completed", "cancelled"]).optional(),
      priority: z.enum(["low", "medium", "high"]).optional(),
      startDate: z.date().optional(),
      dueDate: z.date().optional(),
      progress: z.number().int().min(0).max(100).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const row = await mdb.getWorkOrderById(input.id);
      if (!row) notFound();
      assertOwner(row.ownerId, ctx.user);
      const { id, ...data } = input;
      return mdb.updateWorkOrder(id, data);
    }),
  deleteWorkOrder: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const row = await mdb.getWorkOrderById(input.id);
      if (!row) notFound();
      assertOwner(row.ownerId, ctx.user);
      return mdb.deleteWorkOrder(input.id);
    }),
});

// ============================================================================
// CRM
// ============================================================================

const crmRouter = router({
  // --- Customers ---
  listCustomers: protectedProcedure.query(({ ctx }) => mdb.listCustomers(ctx.user.id)),
  createCustomer: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      email: z.string().email().optional().or(z.literal("")),
      phone: z.string().optional(),
      location: z.string().optional(),
      farmsCount: z.number().int().min(0).default(0),
      totalArea: z.number().int().min(0).default(0),
      status: z.enum(["active", "vip", "inactive"]).optional(),
      lifetimeValue: z.number().int().min(0).default(0),
    }))
    .mutation(({ input, ctx }) => mdb.createCustomer({ ...input, ownerId: ctx.user.id })),
  updateCustomer: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      location: z.string().optional(),
      farmsCount: z.number().int().optional(),
      totalArea: z.number().int().optional(),
      status: z.enum(["active", "vip", "inactive"]).optional(),
      lifetimeValue: z.number().int().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const row = await mdb.getCustomerById(input.id);
      if (!row) notFound();
      assertOwner(row.ownerId, ctx.user);
      const { id, ...data } = input;
      return mdb.updateCustomer(id, data);
    }),
  deleteCustomer: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const row = await mdb.getCustomerById(input.id);
      if (!row) notFound();
      assertOwner(row.ownerId, ctx.user);
      return mdb.deleteCustomer(input.id);
    }),

  // --- Activities ---
  listActivities: protectedProcedure.query(({ ctx }) => mdb.listActivities(ctx.user.id)),
  createActivity: protectedProcedure
    .input(z.object({
      customerId: z.number().optional(),
      customerName: z.string().optional(),
      type: z.enum(["call", "meeting", "email", "task"]),
      description: z.string().optional(),
      date: z.date().optional(),
      status: z.enum(["scheduled", "completed", "cancelled"]).optional(),
    }))
    .mutation(({ input, ctx }) => mdb.createActivity({ ...input, ownerId: ctx.user.id })),
  updateActivity: protectedProcedure
    .input(z.object({
      id: z.number(),
      description: z.string().optional(),
      date: z.date().optional(),
      status: z.enum(["scheduled", "completed", "cancelled"]).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const row = await mdb.getActivityById(input.id);
      if (!row) notFound();
      assertOwner(row.ownerId, ctx.user);
      const { id, ...data } = input;
      return mdb.updateActivity(id, data);
    }),
  deleteActivity: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const row = await mdb.getActivityById(input.id);
      if (!row) notFound();
      assertOwner(row.ownerId, ctx.user);
      return mdb.deleteActivity(input.id);
    }),

  // --- Pipeline deals ---
  listDeals: protectedProcedure.query(({ ctx }) => mdb.listDeals(ctx.user.id)),
  createDeal: protectedProcedure
    .input(z.object({
      customerId: z.number().optional(),
      customerName: z.string().optional(),
      title: z.string().min(1),
      value: z.number().int().min(0).default(0),
      stage: z.enum(["lead", "qualified", "proposal", "negotiation", "won", "lost"]).optional(),
      probability: z.number().int().min(0).max(100).default(0),
      expectedClose: z.date().optional(),
    }))
    .mutation(({ input, ctx }) => mdb.createDeal({ ...input, ownerId: ctx.user.id })),
  updateDeal: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      value: z.number().int().optional(),
      stage: z.enum(["lead", "qualified", "proposal", "negotiation", "won", "lost"]).optional(),
      probability: z.number().int().min(0).max(100).optional(),
      expectedClose: z.date().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const row = await mdb.getDealById(input.id);
      if (!row) notFound();
      assertOwner(row.ownerId, ctx.user);
      const { id, ...data } = input;
      return mdb.updateDeal(id, data);
    }),
  deleteDeal: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const row = await mdb.getDealById(input.id);
      if (!row) notFound();
      assertOwner(row.ownerId, ctx.user);
      return mdb.deleteDeal(input.id);
    }),
});

// ============================================================================
// COMMUNITY (shared read, author-scoped writes)
// ============================================================================

const communityRouter = router({
  listGroups: protectedProcedure.query(() => mdb.listGroups()),
  createGroup: protectedProcedure
    .input(z.object({ name: z.string().min(1), category: z.string().optional() }))
    .mutation(({ input, ctx }) => mdb.createGroup({ ...input, ownerId: ctx.user.id })),
  deleteGroup: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const row = await mdb.getGroupById(input.id);
      if (!row) notFound();
      assertOwner(row.ownerId, ctx.user);
      return mdb.deleteGroup(input.id);
    }),

  listPosts: protectedProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(({ input }) => mdb.listPosts(input?.limit)),
  createPost: protectedProcedure
    .input(z.object({ content: z.string().min(1), groupName: z.string().optional() }))
    .mutation(({ input, ctx }) => mdb.createPost({
      ...input,
      userId: ctx.user.id,
      authorName: ctx.user.name ?? "مستخدم",
    })),
  likePost: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const row = await mdb.getPostById(input.id);
      if (!row) notFound();
      return mdb.incrementPostLikes(input.id);
    }),
  deletePost: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const row = await mdb.getPostById(input.id);
      if (!row) notFound();
      assertOwner(row.userId, ctx.user);
      return mdb.deletePost(input.id);
    }),

  listArticles: protectedProcedure.query(() => mdb.listArticles()),
  createArticle: protectedProcedure
    .input(z.object({ title: z.string().min(1), category: z.string().optional(), content: z.string().optional() }))
    .mutation(({ input, ctx }) => mdb.createArticle({ ...input, userId: ctx.user.id })),
  deleteArticle: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const row = await mdb.getArticleById(input.id);
      if (!row) notFound();
      assertOwner(row.userId, ctx.user);
      return mdb.deleteArticle(input.id);
    }),

  listListings: protectedProcedure.query(() => mdb.listListings()),
  createListing: protectedProcedure
    .input(z.object({ title: z.string().min(1), price: z.number().int().min(0).default(0), location: z.string().optional() }))
    .mutation(({ input, ctx }) => mdb.createListing({
      ...input,
      userId: ctx.user.id,
      sellerName: ctx.user.name ?? "بائع",
    })),
  deleteListing: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const row = await mdb.getListingById(input.id);
      if (!row) notFound();
      assertOwner(row.userId, ctx.user);
      return mdb.deleteListing(input.id);
    }),
});

// ============================================================================
// SUPPORT
// ============================================================================

const supportRouter = router({
  listTickets: protectedProcedure.query(({ ctx }) => mdb.listTickets(ctx.user.id)),
  createTicket: protectedProcedure
    .input(z.object({
      subject: z.string().min(1),
      description: z.string().optional(),
      priority: z.enum(["low", "medium", "high"]).optional(),
    }))
    .mutation(({ input, ctx }) => mdb.createTicket({ ...input, userId: ctx.user.id })),
  updateTicketStatus: protectedProcedure
    .input(z.object({ id: z.number(), status: z.enum(["open", "in_progress", "resolved", "closed"]) }))
    .mutation(async ({ input, ctx }) => {
      const row = await mdb.getTicketById(input.id);
      if (!row) notFound();
      assertOwner(row.userId, ctx.user);
      return mdb.updateTicket(input.id, { status: input.status });
    }),
  listFaq: publicProcedure.query(() => mdb.listFaq()),
});

// ============================================================================
// NOTIFICATIONS
// ============================================================================

const notificationRouter = router({
  list: protectedProcedure
    .input(z.object({ unreadOnly: z.boolean().optional() }).optional())
    .query(({ input, ctx }) => mdb.listNotifications(ctx.user.id, input?.unreadOnly ?? false)),
  markAsRead: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const row = await mdb.getNotificationById(input.id);
      if (!row) notFound();
      assertOwner(row.userId, ctx.user);
      return mdb.markNotificationRead(input.id);
    }),
  markAllAsRead: protectedProcedure.mutation(({ ctx }) => mdb.markAllNotificationsRead(ctx.user.id)),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const row = await mdb.getNotificationById(input.id);
      if (!row) notFound();
      assertOwner(row.userId, ctx.user);
      return mdb.deleteNotification(input.id);
    }),
  clearAll: protectedProcedure.mutation(({ ctx }) => mdb.clearNotifications(ctx.user.id)),
  create: protectedProcedure
    .input(z.object({
      type: z.enum(["irrigation", "weather", "disease", "equipment", "report", "system"]),
      title: z.string().min(1),
      message: z.string().min(1),
      priority: z.enum(["low", "medium", "high"]).optional(),
    }))
    .mutation(({ input, ctx }) => mdb.createNotification({ ...input, userId: ctx.user.id })),
});

// ============================================================================
// API KEYS (secret shown once on creation; only a hash is persisted)
// ============================================================================

function generateApiKey() {
  const raw = `sahool_live_${randomBytes(24).toString("hex")}`;
  const hash = createHash("sha256").update(raw).digest("hex");
  const prefix = raw.slice(0, 16); // e.g. sahool_live_1a2b
  return { raw, hash, prefix };
}

function redactKey<T extends { keyHash?: unknown }>(row: T) {
  // Never leak the stored hash to clients.
  const { keyHash, ...rest } = row as any;
  return rest;
}

const apiKeyRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const rows = await mdb.listApiKeys(ctx.user.id);
    return rows.map(redactKey);
  }),
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      scope: z.enum(["full_access", "read_only", "limited"]).optional(),
      expiresInDays: z.number().int().min(1).max(3650).default(365),
    }))
    .mutation(async ({ input, ctx }) => {
      const { raw, hash, prefix } = generateApiKey();
      const expiresAt = new Date(Date.now() + input.expiresInDays * 24 * 60 * 60 * 1000);
      await mdb.createApiKey({
        userId: ctx.user.id,
        name: input.name,
        keyPrefix: prefix,
        keyHash: hash,
        scope: input.scope ?? "read_only",
        status: "active",
        expiresAt,
      });
      // Return the plaintext key exactly once.
      return { key: raw, prefix };
    }),
  revoke: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const row = await mdb.getApiKeyById(input.id);
      if (!row) notFound();
      assertOwner(row.userId, ctx.user);
      return mdb.updateApiKey(input.id, { status: "revoked" });
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const row = await mdb.getApiKeyById(input.id);
      if (!row) notFound();
      assertOwner(row.userId, ctx.user);
      return mdb.deleteApiKey(input.id);
    }),
});

// ============================================================================
// INTEGRATIONS
// ============================================================================

const integrationRouter = router({
  list: protectedProcedure.query(({ ctx }) => mdb.listIntegrations(ctx.user.id)),
  upsert: protectedProcedure
    .input(z.object({
      slug: z.string().min(1),
      name: z.string().min(1),
      description: z.string().optional(),
      category: z.enum(["gis", "weather", "communication", "data", "automation"]),
      apiKeyRequired: z.boolean().optional(),
      features: z.array(z.string()).optional(),
    }))
    .mutation(({ input, ctx }) => mdb.createIntegration({
      userId: ctx.user.id,
      slug: input.slug,
      name: input.name,
      description: input.description,
      category: input.category,
      apiKeyRequired: input.apiKeyRequired ?? false,
      features: input.features ? JSON.stringify(input.features) : null,
    })),
  toggle: protectedProcedure
    .input(z.object({ id: z.number(), enabled: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      const row = await mdb.getIntegrationById(input.id);
      if (!row) notFound();
      assertOwner(row.userId, ctx.user);
      return mdb.updateIntegration(input.id, {
        enabled: input.enabled,
        status: input.enabled ? "connected" : "disconnected",
      });
    }),
  configure: protectedProcedure
    .input(z.object({ id: z.number(), apiKey: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const row = await mdb.getIntegrationById(input.id);
      if (!row) notFound();
      assertOwner(row.userId, ctx.user);
      if (row.apiKeyRequired && !input.apiKey) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "API key is required" });
      }
      return mdb.updateIntegration(input.id, {
        hasApiKey: input.apiKey ? true : row.hasApiKey,
        enabled: true,
        status: "connected",
      });
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const row = await mdb.getIntegrationById(input.id);
      if (!row) notFound();
      assertOwner(row.userId, ctx.user);
      return mdb.deleteIntegration(input.id);
    }),
});

// ============================================================================
// ADMIN (uses adminProcedure — was previously defined but unused)
// ============================================================================

const adminRouter = router({
  listUsers: adminProcedure.query(() => db.listUsers()),
  updateUserRole: adminProcedure
    .input(z.object({
      id: z.number(),
      role: z.enum(["user", "admin", "farmer_small", "farmer_medium", "enterprise", "government"]),
    }))
    .mutation(({ input }) => db.updateUserRole(input.id, input.role)),
  updateUserStatus: adminProcedure
    .input(z.object({ id: z.number(), status: z.enum(["active", "suspended", "pending"]) }))
    .mutation(({ input }) => db.updateUserStatus(input.id, input.status)),
});

export {
  erpRouter,
  crmRouter,
  communityRouter,
  supportRouter,
  notificationRouter,
  apiKeyRouter,
  integrationRouter,
  adminRouter,
};
