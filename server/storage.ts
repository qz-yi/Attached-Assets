import { db } from "./db";
import { 
  users, 
  jobs, 
  rejections, 
  type User, 
  type InsertUser, 
  type Job, 
  type InsertJob, 
  type UpdateUserRequest, 
  type UpdateJobRequest 
} from "@shared/schema";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: UpdateUserRequest): Promise<User>;
  getUsers(): Promise<User[]>;

  getJobs(): Promise<Job[]>;
  getJob(id: number): Promise<Job | undefined>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: number, updates: UpdateJobRequest): Promise<Job>;
  getRejectedJobs(clientId: number): Promise<Job[]>;
  addRejection(jobId: number, clientId: number, employerId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {

  // دالة جلب مستخدم بواسطة المعرف (ID)
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  // الدالة التي كانت تسبب المشكلة (جلب مستخدم بالإيميل)
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  // إنشاء مستخدم جديد
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // تحديث بيانات المستخدم
  async updateUser(id: number, updates: UpdateUserRequest): Promise<User> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  // جلب قائمة بجميع المستخدمين
  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // جلب جميع الوظائف
  async getJobs(): Promise<Job[]> {
    return await db.select().from(jobs);
  }

  // جلب وظيفة محددة بالـ ID
  async getJob(id: number): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job;
  }

  // إنشاء وظيفة جديدة
  async createJob(insertJob: InsertJob): Promise<Job> {
    const [job] = await db.insert(jobs).values(insertJob).returning();
    return job;
  }

  // تحديث بيانات وظيفة
  async updateJob(id: number, updates: UpdateJobRequest): Promise<Job> {
    const [job] = await db.update(jobs).set(updates).where(eq(jobs.id, id)).returning();
    return job;
  }

  // جلب الوظائف المرفوضة لعميل محدد
  async getRejectedJobs(clientId: number): Promise<Job[]> {
    const rejectedRecords = await db.select().from(rejections).where(eq(rejections.clientId, clientId));
    if (rejectedRecords.length === 0) return [];

    const jobIds = rejectedRecords.map(r => r.jobId);
    return await db.select().from(jobs).where(sql`${jobs.id} IN (${sql.join(jobIds, sql`, `)})`);
  }

  // إضافة عملية رفض لوظيفة
  async addRejection(jobId: number, clientId: number, employerId: number): Promise<void> {
    await db.insert(rejections).values({ jobId, clientId, employerId });
  }
}

export const storage = new DatabaseStorage();