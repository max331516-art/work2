import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { USER_ROLES, REQUEST_STATUS } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Users
  app.get(api.users.list.path, async (req, res) => {
    const users = await storage.getUsers();
    res.json(users);
  });

  app.get(api.users.get.path, async (req, res) => {
    const user = await storage.getUser(Number(req.params.id));
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  });

  // Requests
  app.get(api.requests.list.path, async (req, res) => {
    const role = req.query.role as string;
    const userId = req.query.userId ? Number(req.query.userId) : undefined;
    const requests = await storage.getRequests({ role, userId });
    res.json(requests);
  });

  app.post(api.requests.create.path, async (req, res) => {
    try {
      const input = api.requests.create.input.parse(req.body);
      const request = await storage.createRequest(input);
      res.status(201).json(request);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.patch(api.requests.update.path, async (req, res) => {
    try {
      const input = api.requests.update.input.parse(req.body);
      const request = await storage.updateRequest(Number(req.params.id), input);
      if (!request) return res.status(404).json({ message: "Request not found" });
      res.json(request);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const users = await storage.getUsers();
  if (users.length === 0) {
    console.log("Seeding database...");
    
    // Create Users
    const foreman = await storage.createUser({
      username: "foreman_ivan",
      name: "Ivan Ivanovich (Foreman)",
      role: USER_ROLES.FOREMAN,
      telegramId: "12345",
    });
    
    const supplier = await storage.createUser({
      username: "supplier_petr",
      name: "Petr Petrovich (Supplier)",
      role: USER_ROLES.SUPPLIER,
      telegramId: "67890",
    });
    
    const driver1 = await storage.createUser({
      username: "driver_sanya",
      name: "Sanyok (Driver)",
      role: USER_ROLES.DRIVER,
      telegramId: "11111",
    });

    const driver2 = await storage.createUser({
      username: "driver_micha",
      name: "Michalych (Driver)",
      role: USER_ROLES.DRIVER,
      telegramId: "22222",
    });

    // Create Initial Requests
    await storage.createRequest({
      location: "Site A (City Center)",
      material: "Concrete M300",
      quantity: 5,
      unit: "m3",
      deliveryDate: new Date().toISOString(),
      createdById: foreman.id,
      status: REQUEST_STATUS.NEW,
    });

    await storage.createRequest({
      location: "Site B (Industrial Zone)",
      material: "Bricks Red",
      quantity: 2000,
      unit: "pcs",
      deliveryDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      createdById: foreman.id,
      status: REQUEST_STATUS.IN_PROGRESS,
      driverId: driver1.id,
    });
    
    console.log("Seeding complete!");
  }
}
