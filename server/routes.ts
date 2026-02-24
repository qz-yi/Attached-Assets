import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import MemoryStore from "memorystore";

const SessionStore = MemoryStore(session);

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.use(session({
    secret: process.env.SESSION_SECRET || 'job-bank-secret',
    resave: false,
    saveUninitialized: false,
    store: new SessionStore({ checkPeriod: 86400000 }),
    cookie: { secure: false } // Change to true in prod with https
  }));

  // Auth routes
  app.post(api.auth.login.path, async (req, res) => {
    try {
      const { email, password, role } = api.auth.login.input.parse(req.body);
      
      // Admin bypass
      if (email === '3lialmalke@gmail.com') {
        let admin = await storage.getUserByEmail(email);
        if (!admin) {
          admin = await storage.createUser({
            email,
            password: 'admin_bypassed_password',
            role: 'admin',
            name: 'Admin',
            gender: 'Male',
            age: 30,
            location: 'Iraq',
            phone: '0000000000'
          });
        }
        (req.session as any).userId = admin.id;
        return res.json(admin);
      }

      // Normal login
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "البريد الإلكتروني غير مسجل" });
      }
      
      if (user.password !== password) {
        return res.status(401).json({ message: "كلمة المرور غير صحيحة" });
      }
      
      if (!user.isActive) {
        return res.status(401).json({ message: "الحساب معطل. يرجى التواصل مع الإدارة." });
      }

      // Ensure the user logs in with the selected role (unless they are admin)
      if (role && user.role !== role && user.role !== 'admin') {
        return res.status(401).json({ message: "الدور المحدد غير صحيح لهذا الحساب" });
      }

      (req.session as any).userId = user.id;
      res.json(user);
    } catch (e) {
      console.error("Login error:", e);
      if (e instanceof z.ZodError) {
        return res.status(400).json({ message: e.errors[0].message });
      }
      res.status(400).json({ message: "طلب غير صالح" });
    }
  });

  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      
      const existing = await storage.getUserByEmail(input.email);
      if (existing) {
        return res.status(400).json({ message: "البريد الالكتروني مستخدم بالفعل" });
      }

      const user = await storage.createUser(input);
      (req.session as any).userId = user.id;
      res.status(201).json(user);
    } catch (e) {
      console.error("Register error:", e);
      if (e instanceof z.ZodError) {
        return res.status(400).json({ message: e.errors[0].message });
      }
      res.status(400).json({ message: "طلب غير صالح" });
    }
  });

  app.get(api.auth.me.path, async (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) return res.status(401).json({ message: "Not logged in" });
    const user = await storage.getUser(userId);
    if (!user) return res.status(401).json({ message: "User not found" });
    res.json(user);
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });

  // User Profile
  app.put(api.users.updateProfile.path, async (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) return res.status(401).json({ message: "Not logged in" });
    try {
      const input = api.users.updateProfile.input.parse(req.body);
      const user = await storage.updateUser(userId, input);
      res.json(user);
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.get(api.users.list.path, async (req, res) => {
    const users = await storage.getUsers();
    res.json(users);
  });

  app.patch(api.users.toggleStatus.path, async (req, res) => {
    try {
      const input = api.users.toggleStatus.input.parse(req.body);
      const user = await storage.updateUser(Number(req.params.id), { isActive: input.isActive });
      res.json(user);
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // Jobs
  app.get(api.jobs.list.path, async (req, res) => {
    const jobs = await storage.getJobs();
    res.json(jobs);
  });

  app.get(api.jobs.get.path, async (req, res) => {
    const job = await storage.getJob(Number(req.params.id));
    if (!job) return res.status(404).json({ message: "Not found" });
    res.json(job);
  });

  app.post(api.jobs.create.path, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      if (!userId) return res.status(401).json({ message: "Not logged in" });

      const inputSchema = api.jobs.create.input.extend({ employerId: z.coerce.number() });
      const data = { ...req.body, employerId: userId };
      const input = inputSchema.parse(data);

      const job = await storage.createJob(input);
      res.status(201).json(job);
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.patch(api.jobs.updateStatus.path, async (req, res) => {
    try {
      const input = api.jobs.updateStatus.input.parse(req.body);
      const job = await storage.updateJob(Number(req.params.id), { status: input.status });
      res.json(job);
    } catch(e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post(api.jobs.accept.path, async (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) return res.status(401).json({ message: "Not logged in" });

    const job = await storage.getJob(Number(req.params.id));
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.status !== 'published') {
      return res.status(400).json({ message: "عذراً، شخص آخر سبقك بقبول الوظيفة أو الوظيفة غير متاحة" });
    }

    const updated = await storage.updateJob(job.id, { 
      status: 'accepted', 
      acceptedByClientId: userId,
      acceptedAt: new Date()
    });
    res.json(updated);
  });

  app.post(api.jobs.reject.path, async (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) return res.status(401).json({ message: "Not logged in" });

    const job = await storage.getJob(Number(req.params.id));
    if (!job || job.employerId !== userId) return res.status(404).json({ message: "Job not found" });

    if (!job.acceptedByClientId) return res.status(400).json({ message: "No worker to reject" });

    // Track rejection for the worker
    await storage.addRejection(job.id, job.acceptedByClientId, userId);

    const newRejectionCount = (job.rejectionCount || 0) + 1;
    
    await storage.updateJob(job.id, {
      status: 'published',
      acceptedByClientId: undefined,
      acceptedAt: undefined,
      rejectionCount: newRejectionCount
    });

    res.json({ message: "Worker rejected and job republished" });
  });

  app.post(api.jobs.change.path, async (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) return res.status(401).json({ message: "Not logged in" });

    const job = await storage.getJob(Number(req.params.id));
    if (!job || job.acceptedByClientId !== userId) return res.status(404).json({ message: "Job not found" });

    // Check 24 hour limit
    if (job.acceptedAt) {
      const now = new Date();
      const acceptedAt = new Date(job.acceptedAt);
      const diffHours = (now.getTime() - acceptedAt.getTime()) / (1000 * 60 * 60);
      if (diffHours > 24) {
        return res.status(400).json({ message: "انتهت فترة تغيير الوظيفة المجانية (24 ساعة)" });
      }
    }

    const newChangeCount = (job.changeCount || 0) + 1;

    await storage.updateJob(job.id, {
      status: 'published',
      acceptedByClientId: undefined,
      acceptedAt: undefined,
      changeCount: newChangeCount
    });

    res.json({ message: "Job changed successfully" });
  });

  app.get(api.jobs.rejectedList.path, async (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) return res.status(401).json({ message: "Not logged in" });
    const rejectedJobs = await storage.getRejectedJobs(userId);
    res.json(rejectedJobs);
  });

  // Mock payment
  app.post(api.payments.mockPay.path, (req, res) => {
    res.json({ success: true });
  });

  return httpServer;
}
