import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(), // 'admin', 'employer', 'client'
  name: text("name"),
  gender: text("gender"),
  age: integer("age"),
  location: text("location"),
  phone: text("phone"),
  balance: integer("balance").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  employerId: integer("employer_id").notNull(),
  workType: text("work_type").notNull(),
  requiredAge: text("required_age").notNull(),
  requiredGender: text("required_gender").notNull(),
  description: text("description").notNull(),
  salary: text("salary").notNull(),
  workHours: text("work_hours").notNull(),
  shopName: text("shop_name").notNull(),
  shopLocation: text("shop_location").notNull(),
  phone: text("phone").notNull(),
  status: text("status").notNull().default("published"), // 'published', 'accepted', 'reserved_by_admin', 'cancelled'
  acceptedByClientId: integer("accepted_by_client_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, balance: true, isActive: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const insertJobSchema = createInsertSchema(jobs).omit({ id: true, createdAt: true, status: true, acceptedByClientId: true });
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobs.$inferSelect;

export type UpdateUserRequest = Partial<InsertUser> & { isActive?: boolean, balance?: number };
export type UpdateJobRequest = Partial<InsertJob> & { status?: string, acceptedByClientId?: number };