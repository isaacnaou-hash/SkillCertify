import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const testSessions = pgTable("test_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  status: text("status").notNull().default("pending"), // pending, in_progress, completed, submitted
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  totalScore: integer("total_score"),
  readingScore: integer("reading_score"),
  listeningScore: integer("listening_score"),
  writingScore: integer("writing_score"),
  speakingScore: integer("speaking_score"),
  certificateId: text("certificate_id"),
  paymentId: text("payment_id"),
  paymentStatus: text("payment_status").notNull().default("pending"), // pending, completed, failed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const testAnswers = pgTable("test_answers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => testSessions.id).notNull(),
  section: text("section").notNull(), // reading, listening, writing, speaking
  questionId: text("question_id").notNull(),
  answer: jsonb("answer"),
  isCorrect: boolean("is_correct"),
  score: integer("score"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => testSessions.id).notNull(),
  paystackReference: text("paystack_reference").notNull(),
  amount: integer("amount").notNull(), // amount in cents
  status: text("status").notNull().default("pending"), // pending, success, failed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userSessions = pgTable("user_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  token: text("token").notNull().unique(),
  type: text("type").notNull(), // auth, session
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tempRegistrations = pgTable("temp_registrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  token: text("token").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  password: text("password").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
}).extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Login schema for user authentication
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const insertTestSessionSchema = createInsertSchema(testSessions).omit({
  id: true,
  createdAt: true,
});

export const insertTestAnswerSchema = createInsertSchema(testAnswers).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

export const insertUserSessionSchema = createInsertSchema(userSessions).omit({
  id: true,
  createdAt: true,
});

// Client-side validation schema (excludes server-generated fields)
export const insertTempRegistrationSchema = createInsertSchema(tempRegistrations).omit({
  id: true,
  createdAt: true,
  token: true, // Server-generated
  expiresAt: true, // Server-generated
}).extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Full temp registration schema for server-side creation (includes all fields)
export const fullTempRegistrationSchema = createInsertSchema(tempRegistrations).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginSchema>;
export type TestSession = typeof testSessions.$inferSelect;
export type InsertTestSession = z.infer<typeof insertTestSessionSchema>;
export type TestAnswer = typeof testAnswers.$inferSelect;
export type InsertTestAnswer = z.infer<typeof insertTestAnswerSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type TempRegistration = typeof tempRegistrations.$inferSelect;
export type InsertTempRegistration = z.infer<typeof insertTempRegistrationSchema>;
export type FullTempRegistration = z.infer<typeof fullTempRegistrationSchema>;
