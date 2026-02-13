import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import {
  users, requests,
  type User, type InsertUser,
  type Request, type InsertRequest,
  type UpdateRequestStatusInput,
  REQUEST_STATUS
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  
  // Requests
  getRequests(filters?: { role?: string, userId?: number }): Promise<Request[]>;
  getRequest(id: number): Promise<Request | undefined>;
  createRequest(request: InsertRequest): Promise<Request>;
  updateRequest(id: number, updates: Partial<InsertRequest>): Promise<Request>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getRequests(filters?: { role?: string, userId?: number }): Promise<Request[]> {
    let query = db.select().from(requests).orderBy(desc(requests.createdAt));
    
    // Simple filtering logic if needed, but for MVP we might just fetch all and filter in UI or here
    // For Driver, show only assigned or completed by them
    if (filters?.role === 'driver' && filters.userId) {
       return await db.select().from(requests)
         .where(eq(requests.driverId, filters.userId))
         .orderBy(desc(requests.deliveryDate));
    }

    return await query;
  }

  async getRequest(id: number): Promise<Request | undefined> {
    const [req] = await db.select().from(requests).where(eq(requests.id, id));
    return req;
  }

  async createRequest(request: InsertRequest): Promise<Request> {
    const [req] = await db.insert(requests).values(request).returning();
    return req;
  }

  async updateRequest(id: number, updates: Partial<InsertRequest>): Promise<Request> {
    const [req] = await db.update(requests)
      .set(updates)
      .where(eq(requests.id, id))
      .returning();
    return req;
  }
}

export const storage = new DatabaseStorage();
