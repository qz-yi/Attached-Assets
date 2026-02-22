import { db } from "./db";
import { users, jobs, rejections, type User, type InsertUser, type Job, type InsertJob, type UpdateUserRequest, type UpdateJobRequest } from "@shared/schema";
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
  // ... existing methods
  async updateJob(id: number, updates: UpdateJobRequest): Promise<Job> {
    const [job] = await db.update(jobs).set(updates).where(eq(jobs.id, id)).returning();
    return job;
  }

  async getRejectedJobs(clientId: number): Promise<Job[]> {
    const rejectedRecords = await db.select().from(rejections).where(eq(rejections.clientId, clientId));
    if (rejectedRecords.length === 0) return [];
    
    const jobIds = rejectedRecords.map(r => r.jobId);
    return await db.select().from(jobs).where(sql`${jobs.id} IN (${sql.join(jobIds, sql`, `)})`);
  }

  async addRejection(jobId: number, clientId: number, employerId: number): Promise<void> {
    await db.insert(rejections).values({ jobId, clientId, employerId });
  }
}

export const storage = new DatabaseStorage();
