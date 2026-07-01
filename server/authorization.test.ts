import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the data layer so the tests exercise ONLY the authorization logic in the
// routers, not a real database.
vi.mock("./db", () => ({
  getFarmById: vi.fn(),
  getFieldById: vi.fn(),
  getDeviceById: vi.fn(),
  getAlertById: vi.fn(),
  getRecommendationById: vi.fn(),
  updateField: vi.fn(async () => ({ affectedRows: 1 })),
  deleteField: vi.fn(async () => ({ affectedRows: 1 })),
  updateDeviceStatus: vi.fn(async () => ({ affectedRows: 1 })),
  getFieldsByFarmId: vi.fn(async () => []),
  getDevicesByFarmId: vi.fn(async () => []),
  markAlertAsRead: vi.fn(async () => ({ affectedRows: 1 })),
  updateRecommendationStatus: vi.fn(async () => ({ affectedRows: 1 })),
  listUsers: vi.fn(async () => [{ id: 1 }]),
  updateUserRole: vi.fn(async () => ({ affectedRows: 1 })),
}));

import { appRouter } from "./routers";
import * as db from "./db";
import type { User } from "../drizzle/schema";

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 10,
    openId: "open-10",
    name: "Owner",
    email: "owner@example.com",
    loginMethod: null,
    role: "user",
    status: "active",
    phone: null,
    country: null,
    region: null,
    language: "ar",
    subscriptionTier: "free",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  } as User;
}

function callerFor(user: User | null) {
  return appRouter.createCaller({ user, req: {} as any, res: {} as any });
}

async function expectCode(promise: Promise<unknown>, code: string) {
  await expect(promise).rejects.toMatchObject({ code });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("field router ownership (IDOR)", () => {
  it("denies reading a field whose farm belongs to another user", async () => {
    (db.getFieldById as any).mockResolvedValue({ id: 1, farmId: 5 });
    (db.getFarmById as any).mockResolvedValue({ id: 5, ownerId: 999 }); // not our user
    const caller = callerFor(makeUser({ id: 10 }));
    await expectCode(caller.field.getById({ id: 1 }), "FORBIDDEN");
  });

  it("allows the owner to read their own field", async () => {
    (db.getFieldById as any).mockResolvedValue({ id: 1, farmId: 5 });
    (db.getFarmById as any).mockResolvedValue({ id: 5, ownerId: 10 });
    const caller = callerFor(makeUser({ id: 10 }));
    await expect(caller.field.getById({ id: 1 })).resolves.toMatchObject({ id: 1 });
  });

  it("does NOT delete a field owned by another user", async () => {
    (db.getFieldById as any).mockResolvedValue({ id: 1, farmId: 5 });
    (db.getFarmById as any).mockResolvedValue({ id: 5, ownerId: 999 });
    const caller = callerFor(makeUser({ id: 10 }));
    await expectCode(caller.field.delete({ id: 1 }), "FORBIDDEN");
    expect(db.deleteField).not.toHaveBeenCalled();
  });

  it("lets an admin access any field", async () => {
    (db.getFieldById as any).mockResolvedValue({ id: 1, farmId: 5 });
    (db.getFarmById as any).mockResolvedValue({ id: 5, ownerId: 999 });
    const caller = callerFor(makeUser({ id: 10, role: "admin" }));
    await expect(caller.field.getById({ id: 1 })).resolves.toMatchObject({ id: 1 });
  });
});

describe("iot router ownership (IDOR) — device control", () => {
  it("denies controlling a device on another user's farm", async () => {
    (db.getDeviceById as any).mockResolvedValue({ id: 3, farmId: 7, fieldId: null });
    (db.getFarmById as any).mockResolvedValue({ id: 7, ownerId: 999 });
    const caller = callerFor(makeUser({ id: 10 }));
    await expectCode(
      caller.iot.updateStatus({ id: 3, status: "online" }),
      "FORBIDDEN"
    );
    expect(db.updateDeviceStatus).not.toHaveBeenCalled();
  });

  it("allows the owner to control their device", async () => {
    (db.getDeviceById as any).mockResolvedValue({ id: 3, farmId: 7, fieldId: null });
    (db.getFarmById as any).mockResolvedValue({ id: 7, ownerId: 10 });
    const caller = callerFor(makeUser({ id: 10 }));
    await expect(
      caller.iot.updateStatus({ id: 3, status: "online" })
    ).resolves.toBeDefined();
    expect(db.updateDeviceStatus).toHaveBeenCalledWith(3, "online");
  });
});

describe("alert & recommendation ownership (IDOR)", () => {
  it("denies marking another user's alert as read", async () => {
    (db.getAlertById as any).mockResolvedValue({ id: 2, userId: 999 });
    const caller = callerFor(makeUser({ id: 10 }));
    await expectCode(caller.alert.markAsRead({ id: 2 }), "FORBIDDEN");
    expect(db.markAlertAsRead).not.toHaveBeenCalled();
  });

  it("denies updating another user's recommendation", async () => {
    (db.getRecommendationById as any).mockResolvedValue({ id: 4, userId: 999 });
    const caller = callerFor(makeUser({ id: 10 }));
    await expectCode(
      caller.recommendation.updateStatus({ id: 4, status: "accepted" }),
      "FORBIDDEN"
    );
    expect(db.updateRecommendationStatus).not.toHaveBeenCalled();
  });
});

describe("auth gating", () => {
  it("rejects unauthenticated access to protected procedures", async () => {
    const caller = callerFor(null);
    await expectCode(caller.field.getById({ id: 1 }), "UNAUTHORIZED");
  });

  it("rejects non-admin from admin procedures", async () => {
    const caller = callerFor(makeUser({ id: 10, role: "user" }));
    await expectCode(caller.admin.listUsers(), "FORBIDDEN");
    expect(db.listUsers).not.toHaveBeenCalled();
  });

  it("allows admin to list users", async () => {
    const caller = callerFor(makeUser({ id: 10, role: "admin" }));
    await expect(caller.admin.listUsers()).resolves.toEqual([{ id: 1 }]);
  });
});
