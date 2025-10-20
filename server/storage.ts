import { type User, type InsertUser, type TestSession, type InsertTestSession, type TestAnswer, type InsertTestAnswer, type Payment, type InsertPayment, type UserSession, type InsertUserSession, type TempRegistration, type InsertTempRegistration, users, testSessions, testAnswers, payments, userSessions, tempRegistrations } from "@shared/schema";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/neon-serverless";
import { neon } from "@neondatabase/serverless";
import { eq, and, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Test Sessions
  getTestSession(id: string): Promise<TestSession | undefined>;
  getTestSessionsByUser(userId: string): Promise<TestSession[]>;
  createTestSession(session: InsertTestSession): Promise<TestSession>;
  updateTestSession(id: string, updates: Partial<TestSession>): Promise<TestSession | undefined>;

  // Test Answers
  getTestAnswers(sessionId: string): Promise<TestAnswer[]>;
  createTestAnswer(answer: InsertTestAnswer): Promise<TestAnswer>;
  updateTestAnswer(id: string, updates: Partial<TestAnswer>): Promise<TestAnswer | undefined>;
  upsertTestAnswer(answer: InsertTestAnswer): Promise<TestAnswer>;

  // Payments
  getPayment(id: string): Promise<Payment | undefined>;
  getPaymentByReference(reference: string): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: string, updates: Partial<Payment>): Promise<Payment | undefined>;

  // User Sessions
  getUserSession(token: string): Promise<UserSession | undefined>;
  createUserSession(session: InsertUserSession): Promise<UserSession>;
  deleteUserSession(token: string): Promise<void>;
  deleteExpiredSessions(): Promise<void>;

  // Temporary Registrations
  getTempRegistration(token: string): Promise<TempRegistration | undefined>;
  createTempRegistration(tempReg: FullTempRegistration): Promise<TempRegistration>;
  deleteTempRegistration(token: string): Promise<void>;
  deleteExpiredTempRegistrations(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;

  constructor() {
    if (!process.env.DATABASE_URL) {
      console.error("DATABASE_URL environment variable is required");
      throw new Error("DATABASE_URL environment variable is required");
    }
    
    try {
      // Correct Neon serverless setup for Drizzle  
      const sql = neon(process.env.DATABASE_URL);
      this.db = drizzle(sql, { 
        schema: { users, testSessions, testAnswers, payments, userSessions, tempRegistrations }
      });
    } catch (error) {
      console.error("Database connection failed:", error);
      throw error;
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getTestSession(id: string): Promise<TestSession | undefined> {
    const result = await this.db.select().from(testSessions).where(eq(testSessions.id, id)).limit(1);
    return result[0];
  }

  async getTestSessionsByUser(userId: string): Promise<TestSession[]> {
    return await this.db.select().from(testSessions).where(eq(testSessions.userId, userId));
  }

  async createTestSession(insertSession: InsertTestSession): Promise<TestSession> {
    const result = await this.db.insert(testSessions).values(insertSession).returning();
    return result[0];
  }

  async updateTestSession(id: string, updates: Partial<TestSession>): Promise<TestSession | undefined> {
    const result = await this.db.update(testSessions)
      .set(updates)
      .where(eq(testSessions.id, id))
      .returning();
    return result[0];
  }

  async getTestAnswers(sessionId: string): Promise<TestAnswer[]> {
    return await this.db.select().from(testAnswers).where(eq(testAnswers.sessionId, sessionId));
  }

  async createTestAnswer(answer: InsertTestAnswer): Promise<TestAnswer> {
    const result = await this.db.insert(testAnswers).values(answer).returning();
    return result[0];
  }

  async updateTestAnswer(id: string, updates: Partial<TestAnswer>): Promise<TestAnswer | undefined> {
    const result = await this.db.update(testAnswers)
      .set(updates)
      .where(eq(testAnswers.id, id))
      .returning();
    return result[0];
  }

  async upsertTestAnswer(answer: InsertTestAnswer): Promise<TestAnswer> {
    // First try to find existing answer for this session and question
    const existing = await this.db.select().from(testAnswers)
      .where(and(
        eq(testAnswers.sessionId, answer.sessionId),
        eq(testAnswers.questionId, answer.questionId)
      )).limit(1);

    if (existing.length > 0) {
      // Update existing answer
      const result = await this.db.update(testAnswers)
        .set(answer)
        .where(eq(testAnswers.id, existing[0].id))
        .returning();
      return result[0];
    } else {
      // Create new answer
      const result = await this.db.insert(testAnswers).values(answer).returning();
      return result[0];
    }
  }

  async getPayment(id: string): Promise<Payment | undefined> {
    const result = await this.db.select().from(payments).where(eq(payments.id, id)).limit(1);
    return result[0];
  }

  async getPaymentByReference(reference: string): Promise<Payment | undefined> {
    const result = await this.db.select().from(payments).where(eq(payments.paystackReference, reference)).limit(1);
    return result[0];
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const result = await this.db.insert(payments).values(payment).returning();
    return result[0];
  }

  async updatePayment(id: string, updates: Partial<Payment>): Promise<Payment | undefined> {
    const result = await this.db.update(payments)
      .set(updates)
      .where(eq(payments.id, id))
      .returning();
    return result[0];
  }

  async getUserSession(token: string): Promise<UserSession | undefined> {
    const result = await this.db.select().from(userSessions).where(eq(userSessions.token, token)).limit(1);
    return result[0];
  }

  async createUserSession(session: InsertUserSession): Promise<UserSession> {
    const result = await this.db.insert(userSessions).values(session).returning();
    return result[0];
  }

  async deleteUserSession(token: string): Promise<void> {
    await this.db.delete(userSessions).where(eq(userSessions.token, token));
  }

  async deleteExpiredSessions(): Promise<void> {
    const now = new Date();
    await this.db.delete(userSessions).where(sql`expires_at < ${now}`);
  }

  async getTempRegistration(token: string): Promise<TempRegistration | undefined> {
    const result = await this.db.select().from(tempRegistrations).where(eq(tempRegistrations.token, token)).limit(1);
    return result[0];
  }

  async createTempRegistration(tempReg: InsertTempRegistration): Promise<TempRegistration> {
    const result = await this.db.insert(tempRegistrations).values(tempReg).returning();
    return result[0];
  }

  async deleteTempRegistration(token: string): Promise<void> {
    await this.db.delete(tempRegistrations).where(eq(tempRegistrations.token, token));
  }

  async deleteExpiredTempRegistrations(): Promise<void> {
    await this.db.delete(tempRegistrations).where(sql`expires_at < NOW()`);
  }
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private testSessions: Map<string, TestSession>;
  private testAnswers: Map<string, TestAnswer>;
  private payments: Map<string, Payment>;
  private tempRegistrations: Map<string, TempRegistration>;

  constructor() {
    this.users = new Map();
    this.testSessions = new Map();
    this.testAnswers = new Map();
    this.payments = new Map();
    this.tempRegistrations = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async getTestSession(id: string): Promise<TestSession | undefined> {
    return this.testSessions.get(id);
  }

  async getTestSessionsByUser(userId: string): Promise<TestSession[]> {
    return Array.from(this.testSessions.values()).filter(session => session.userId === userId);
  }

  async createTestSession(insertSession: InsertTestSession): Promise<TestSession> {
    const id = randomUUID();
    const session: TestSession = { 
      ...insertSession, 
      id,
      status: insertSession.status || "pending",
      paymentStatus: insertSession.paymentStatus || "pending",
      startedAt: insertSession.startedAt || null,
      completedAt: insertSession.completedAt || null,
      totalScore: insertSession.totalScore || null,
      readingScore: insertSession.readingScore || null,
      listeningScore: insertSession.listeningScore || null,
      writingScore: insertSession.writingScore || null,
      speakingScore: insertSession.speakingScore || null,
      certificateId: insertSession.certificateId || null,
      paymentId: insertSession.paymentId || null,
      createdAt: new Date()
    };
    this.testSessions.set(id, session);
    return session;
  }

  async updateTestSession(id: string, updates: Partial<TestSession>): Promise<TestSession | undefined> {
    const session = this.testSessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...updates };
    this.testSessions.set(id, updatedSession);
    return updatedSession;
  }

  async getTestAnswers(sessionId: string): Promise<TestAnswer[]> {
    return Array.from(this.testAnswers.values()).filter(answer => answer.sessionId === sessionId);
  }

  async createTestAnswer(insertAnswer: InsertTestAnswer): Promise<TestAnswer> {
    const id = randomUUID();
    const answer: TestAnswer = { 
      ...insertAnswer, 
      id,
      answer: insertAnswer.answer || null,
      isCorrect: insertAnswer.isCorrect || null,
      score: insertAnswer.score || null,
      createdAt: new Date()
    };
    this.testAnswers.set(id, answer);
    return answer;
  }

  async updateTestAnswer(id: string, updates: Partial<TestAnswer>): Promise<TestAnswer | undefined> {
    const answer = this.testAnswers.get(id);
    if (!answer) return undefined;
    
    const updatedAnswer = { ...answer, ...updates };
    this.testAnswers.set(id, updatedAnswer);
    return updatedAnswer;
  }

  async upsertTestAnswer(insertAnswer: InsertTestAnswer): Promise<TestAnswer> {
    // Find existing answer for this session + question combination
    const existingAnswer = Array.from(this.testAnswers.values()).find(
      answer => 
        answer.sessionId === insertAnswer.sessionId && 
        answer.section === insertAnswer.section && 
        answer.questionId === insertAnswer.questionId
    );

    if (existingAnswer) {
      // Update existing answer
      const updatedAnswer = {
        ...existingAnswer,
        answer: insertAnswer.answer || existingAnswer.answer,
        isCorrect: insertAnswer.isCorrect ?? existingAnswer.isCorrect,
        score: insertAnswer.score ?? existingAnswer.score
      };
      this.testAnswers.set(existingAnswer.id, updatedAnswer);
      return updatedAnswer;
    } else {
      // Create new answer
      return this.createTestAnswer(insertAnswer);
    }
  }

  async getPayment(id: string): Promise<Payment | undefined> {
    return this.payments.get(id);
  }

  async getPaymentByReference(reference: string): Promise<Payment | undefined> {
    return Array.from(this.payments.values()).find(payment => payment.paystackReference === reference);
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = randomUUID();
    const payment: Payment = { 
      ...insertPayment, 
      id,
      status: insertPayment.status || "pending",
      createdAt: new Date()
    };
    this.payments.set(id, payment);
    return payment;
  }

  async updatePayment(id: string, updates: Partial<Payment>): Promise<Payment | undefined> {
    const payment = this.payments.get(id);
    if (!payment) return undefined;
    
    const updatedPayment = { ...payment, ...updates };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }

  // User Sessions - Memory storage implementation  
  private userSessions: Map<string, UserSession> = new Map();
  
  async getUserSession(token: string): Promise<UserSession | undefined> {
    return this.userSessions.get(token);
  }

  async createUserSession(session: InsertUserSession): Promise<UserSession> {
    const id = randomUUID();
    const userSession: UserSession = { 
      ...session, 
      id,
      createdAt: new Date()
    };
    this.userSessions.set(session.token, userSession);
    return userSession;
  }

  async deleteUserSession(token: string): Promise<void> {
    this.userSessions.delete(token);
  }

  async deleteExpiredSessions(): Promise<void> {
    const now = new Date();
    const tokensToDelete: string[] = [];
    
    this.userSessions.forEach((session, token) => {
      if (session.expiresAt < now) {
        tokensToDelete.push(token);
      }
    });
    
    tokensToDelete.forEach(token => {
      this.userSessions.delete(token);
    });
  }

  // Temporary Registrations - Memory storage implementation
  async getTempRegistration(token: string): Promise<TempRegistration | undefined> {
    return this.tempRegistrations.get(token);
  }

  async createTempRegistration(tempReg: FullTempRegistration): Promise<TempRegistration> {
    const id = randomUUID();
    const tempRegistration: TempRegistration = { 
      ...tempReg, 
      id,
      createdAt: new Date()
    };
    this.tempRegistrations.set(tempReg.token, tempRegistration);
    return tempRegistration;
  }

  async deleteTempRegistration(token: string): Promise<void> {
    this.tempRegistrations.delete(token);
  }

  async deleteExpiredTempRegistrations(): Promise<void> {
    const now = new Date();
    const tokensToDelete: string[] = [];
    
    this.tempRegistrations.forEach((tempReg, token) => {
      if (tempReg.expiresAt < now) {
        tokensToDelete.push(token);
      }
    });
    
    tokensToDelete.forEach(token => {
      this.tempRegistrations.delete(token);
    });
  }
}

// Use MemStorage for now until database connection is fixed
export const storage = new MemStorage();
