// Database helpers for the ERP / CRM / Community / Support / Notifications /
// API Keys / Integrations modules. Kept separate from db.ts to keep each file
// focused. All "get*ById" helpers return the raw row (including the owner
// column) so routers can enforce ownership before mutating.

import { eq, desc, and } from "drizzle-orm";
import {
  inventoryItems, purchaseOrders, workOrders,
  customers, crmActivities, pipelineDeals,
  communityGroups, communityPosts, knowledgeArticles, marketplaceListings,
  supportTickets, faqItems, notifications, apiKeys, integrations,
  InsertInventoryItem, InsertPurchaseOrder, InsertWorkOrder,
  InsertCustomer, InsertCrmActivity, InsertPipelineDeal,
  InsertCommunityGroup, InsertCommunityPost, InsertKnowledgeArticle, InsertMarketplaceListing,
  InsertSupportTicket, InsertFaqItem, InsertNotification, InsertApiKey, InsertIntegration,
} from "../drizzle/schema";
import { getDb } from "./db";

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db;
}

function firstOrUndefined<T>(rows: T[]): T | undefined {
  return rows.length > 0 ? rows[0] : undefined;
}

// ============ ERP: INVENTORY ============

export async function listInventory(ownerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(inventoryItems).where(eq(inventoryItems.ownerId, ownerId)).orderBy(desc(inventoryItems.createdAt));
}
export async function getInventoryItemById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  return firstOrUndefined(await db.select().from(inventoryItems).where(eq(inventoryItems.id, id)).limit(1));
}
export async function createInventoryItem(data: InsertInventoryItem) {
  return (await requireDb()).insert(inventoryItems).values(data);
}
export async function updateInventoryItem(id: number, data: Partial<InsertInventoryItem>) {
  return (await requireDb()).update(inventoryItems).set(data).where(eq(inventoryItems.id, id));
}
export async function deleteInventoryItem(id: number) {
  return (await requireDb()).delete(inventoryItems).where(eq(inventoryItems.id, id));
}

// ============ ERP: PURCHASE ORDERS ============

export async function listPurchaseOrders(ownerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(purchaseOrders).where(eq(purchaseOrders.ownerId, ownerId)).orderBy(desc(purchaseOrders.createdAt));
}
export async function getPurchaseOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  return firstOrUndefined(await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, id)).limit(1));
}
export async function createPurchaseOrder(data: InsertPurchaseOrder) {
  return (await requireDb()).insert(purchaseOrders).values(data);
}
export async function updatePurchaseOrder(id: number, data: Partial<InsertPurchaseOrder>) {
  return (await requireDb()).update(purchaseOrders).set(data).where(eq(purchaseOrders.id, id));
}
export async function deletePurchaseOrder(id: number) {
  return (await requireDb()).delete(purchaseOrders).where(eq(purchaseOrders.id, id));
}

// ============ ERP: WORK ORDERS ============

export async function listWorkOrders(ownerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(workOrders).where(eq(workOrders.ownerId, ownerId)).orderBy(desc(workOrders.createdAt));
}
export async function getWorkOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  return firstOrUndefined(await db.select().from(workOrders).where(eq(workOrders.id, id)).limit(1));
}
export async function createWorkOrder(data: InsertWorkOrder) {
  return (await requireDb()).insert(workOrders).values(data);
}
export async function updateWorkOrder(id: number, data: Partial<InsertWorkOrder>) {
  return (await requireDb()).update(workOrders).set(data).where(eq(workOrders.id, id));
}
export async function deleteWorkOrder(id: number) {
  return (await requireDb()).delete(workOrders).where(eq(workOrders.id, id));
}

// ============ CRM: CUSTOMERS ============

export async function listCustomers(ownerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(customers).where(eq(customers.ownerId, ownerId)).orderBy(desc(customers.createdAt));
}
export async function getCustomerById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  return firstOrUndefined(await db.select().from(customers).where(eq(customers.id, id)).limit(1));
}
export async function createCustomer(data: InsertCustomer) {
  return (await requireDb()).insert(customers).values(data);
}
export async function updateCustomer(id: number, data: Partial<InsertCustomer>) {
  return (await requireDb()).update(customers).set(data).where(eq(customers.id, id));
}
export async function deleteCustomer(id: number) {
  return (await requireDb()).delete(customers).where(eq(customers.id, id));
}

// ============ CRM: ACTIVITIES ============

export async function listActivities(ownerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(crmActivities).where(eq(crmActivities.ownerId, ownerId)).orderBy(desc(crmActivities.date));
}
export async function getActivityById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  return firstOrUndefined(await db.select().from(crmActivities).where(eq(crmActivities.id, id)).limit(1));
}
export async function createActivity(data: InsertCrmActivity) {
  return (await requireDb()).insert(crmActivities).values(data);
}
export async function updateActivity(id: number, data: Partial<InsertCrmActivity>) {
  return (await requireDb()).update(crmActivities).set(data).where(eq(crmActivities.id, id));
}
export async function deleteActivity(id: number) {
  return (await requireDb()).delete(crmActivities).where(eq(crmActivities.id, id));
}

// ============ CRM: PIPELINE DEALS ============

export async function listDeals(ownerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pipelineDeals).where(eq(pipelineDeals.ownerId, ownerId)).orderBy(desc(pipelineDeals.createdAt));
}
export async function getDealById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  return firstOrUndefined(await db.select().from(pipelineDeals).where(eq(pipelineDeals.id, id)).limit(1));
}
export async function createDeal(data: InsertPipelineDeal) {
  return (await requireDb()).insert(pipelineDeals).values(data);
}
export async function updateDeal(id: number, data: Partial<InsertPipelineDeal>) {
  return (await requireDb()).update(pipelineDeals).set(data).where(eq(pipelineDeals.id, id));
}
export async function deleteDeal(id: number) {
  return (await requireDb()).delete(pipelineDeals).where(eq(pipelineDeals.id, id));
}

// ============ COMMUNITY: GROUPS (shared read) ============

export async function listGroups() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(communityGroups).orderBy(desc(communityGroups.members));
}
export async function getGroupById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  return firstOrUndefined(await db.select().from(communityGroups).where(eq(communityGroups.id, id)).limit(1));
}
export async function createGroup(data: InsertCommunityGroup) {
  return (await requireDb()).insert(communityGroups).values(data);
}
export async function deleteGroup(id: number) {
  return (await requireDb()).delete(communityGroups).where(eq(communityGroups.id, id));
}

// ============ COMMUNITY: POSTS (shared read) ============

export async function listPosts(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(communityPosts).orderBy(desc(communityPosts.createdAt)).limit(limit);
}
export async function getPostById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  return firstOrUndefined(await db.select().from(communityPosts).where(eq(communityPosts.id, id)).limit(1));
}
export async function createPost(data: InsertCommunityPost) {
  return (await requireDb()).insert(communityPosts).values(data);
}
export async function deletePost(id: number) {
  return (await requireDb()).delete(communityPosts).where(eq(communityPosts.id, id));
}
export async function incrementPostLikes(id: number) {
  const db = await requireDb();
  const row = await getPostById(id);
  const likes = (row?.likes ?? 0) + 1;
  return db.update(communityPosts).set({ likes }).where(eq(communityPosts.id, id));
}

// ============ COMMUNITY: KNOWLEDGE (shared read) ============

export async function listArticles() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(knowledgeArticles).orderBy(desc(knowledgeArticles.views));
}
export async function getArticleById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  return firstOrUndefined(await db.select().from(knowledgeArticles).where(eq(knowledgeArticles.id, id)).limit(1));
}
export async function createArticle(data: InsertKnowledgeArticle) {
  return (await requireDb()).insert(knowledgeArticles).values(data);
}
export async function deleteArticle(id: number) {
  return (await requireDb()).delete(knowledgeArticles).where(eq(knowledgeArticles.id, id));
}

// ============ COMMUNITY: MARKETPLACE (shared read) ============

export async function listListings() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(marketplaceListings).orderBy(desc(marketplaceListings.createdAt));
}
export async function getListingById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  return firstOrUndefined(await db.select().from(marketplaceListings).where(eq(marketplaceListings.id, id)).limit(1));
}
export async function createListing(data: InsertMarketplaceListing) {
  return (await requireDb()).insert(marketplaceListings).values(data);
}
export async function deleteListing(id: number) {
  return (await requireDb()).delete(marketplaceListings).where(eq(marketplaceListings.id, id));
}

// ============ SUPPORT: TICKETS ============

export async function listTickets(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(supportTickets).where(eq(supportTickets.userId, userId)).orderBy(desc(supportTickets.createdAt));
}
export async function getTicketById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  return firstOrUndefined(await db.select().from(supportTickets).where(eq(supportTickets.id, id)).limit(1));
}
export async function createTicket(data: InsertSupportTicket) {
  return (await requireDb()).insert(supportTickets).values(data);
}
export async function updateTicket(id: number, data: Partial<InsertSupportTicket>) {
  return (await requireDb()).update(supportTickets).set(data).where(eq(supportTickets.id, id));
}

// ============ SUPPORT: FAQ (global read) ============

export async function listFaq() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(faqItems).orderBy(faqItems.sortOrder);
}
export async function createFaq(data: InsertFaqItem) {
  return (await requireDb()).insert(faqItems).values(data);
}
export async function deleteFaq(id: number) {
  return (await requireDb()).delete(faqItems).where(eq(faqItems.id, id));
}

// ============ NOTIFICATIONS ============

export async function listNotifications(userId: number, unreadOnly = false) {
  const db = await getDb();
  if (!db) return [];
  const where = unreadOnly
    ? and(eq(notifications.userId, userId), eq(notifications.isRead, false))
    : eq(notifications.userId, userId);
  return db.select().from(notifications).where(where).orderBy(desc(notifications.createdAt));
}
export async function getNotificationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  return firstOrUndefined(await db.select().from(notifications).where(eq(notifications.id, id)).limit(1));
}
export async function createNotification(data: InsertNotification) {
  return (await requireDb()).insert(notifications).values(data);
}
export async function markNotificationRead(id: number) {
  return (await requireDb()).update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
}
export async function markAllNotificationsRead(userId: number) {
  return (await requireDb()).update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));
}
export async function deleteNotification(id: number) {
  return (await requireDb()).delete(notifications).where(eq(notifications.id, id));
}
export async function clearNotifications(userId: number) {
  return (await requireDb()).delete(notifications).where(eq(notifications.userId, userId));
}

// ============ API KEYS ============

export async function listApiKeys(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(apiKeys).where(eq(apiKeys.userId, userId)).orderBy(desc(apiKeys.createdAt));
}
export async function getApiKeyById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  return firstOrUndefined(await db.select().from(apiKeys).where(eq(apiKeys.id, id)).limit(1));
}
export async function createApiKey(data: InsertApiKey) {
  return (await requireDb()).insert(apiKeys).values(data);
}
export async function updateApiKey(id: number, data: Partial<InsertApiKey>) {
  return (await requireDb()).update(apiKeys).set(data).where(eq(apiKeys.id, id));
}
export async function deleteApiKey(id: number) {
  return (await requireDb()).delete(apiKeys).where(eq(apiKeys.id, id));
}

// ============ INTEGRATIONS ============

export async function listIntegrations(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(integrations).where(eq(integrations.userId, userId)).orderBy(integrations.name);
}
export async function getIntegrationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  return firstOrUndefined(await db.select().from(integrations).where(eq(integrations.id, id)).limit(1));
}
export async function createIntegration(data: InsertIntegration) {
  return (await requireDb()).insert(integrations).values(data);
}
export async function updateIntegration(id: number, data: Partial<InsertIntegration>) {
  return (await requireDb()).update(integrations).set(data).where(eq(integrations.id, id));
}
export async function deleteIntegration(id: number) {
  return (await requireDb()).delete(integrations).where(eq(integrations.id, id));
}
