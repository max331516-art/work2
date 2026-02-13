import { pgTable, text, serial, integer, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const USER_ROLES = {
  FOREMAN: "foreman",
  SUPPLIER: "supplier",
  DRIVER: "driver",
} as const;

export const REQUEST_STATUS = {
  NEW: "new",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  ARCHIVED: "archived",
} as const;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(), // Internal or Telegram username
  name: text("name").notNull(),
  role: text("role").notNull().$type<typeof USER_ROLES[keyof typeof USER_ROLES]>(),
  telegramId: text("telegram_id"),
});

export const requests = pgTable("requests", {
  id: serial("id").primaryKey(),
  location: text("location").notNull(), // "Object"
  material: text("material").notNull(),
  quantity: integer("quantity").notNull(),
  unit: text("unit").notNull(), // m3, tons, pcs
  deliveryDate: date("delivery_date").notNull(), // YYYY-MM-DD
  status: text("status").notNull().default(REQUEST_STATUS.NEW).$type<typeof REQUEST_STATUS[keyof typeof REQUEST_STATUS]>(),
  comment: text("comment"),
  
  // Relations
  createdById: integer("created_by_id").notNull(), // Foreman
  driverId: integer("driver_id"), // Assigned driver
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertRequestSchema = createInsertSchema(requests).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Request = typeof requests.$inferSelect;
export type InsertRequest = z.infer<typeof insertRequestSchema>;

// API Types
export type CreateRequestInput = InsertRequest;
export type UpdateRequestStatusInput = {
  status: typeof REQUEST_STATUS[keyof typeof REQUEST_STATUS];
  driverId?: number;
};
