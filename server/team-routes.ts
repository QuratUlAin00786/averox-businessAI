import { Request, Response } from "express";
import { storage } from "./storage";
import { Express } from "express";
import { z } from "zod";
import { insertTeamSchema, insertTeamMemberSchema } from "@shared/schema";

export function registerTeamRoutes(app: Express) {
  // Get all teams
  app.get("/api/settings/teams", async (req: Request, res: Response) => {
    try {
      const teams = await storage.listTeams();
      res.json(teams);
    } catch (error: any) {
      console.error("Error fetching teams:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create a new team
  app.post("/api/settings/teams", async (req: Request, res: Response) => {
    try {
      const validation = insertTeamSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }

      const newTeam = await storage.createTeam({
        ...validation.data
      });
      res.status(201).json(newTeam);
    } catch (error: any) {
      console.error("Error creating team:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get a specific team by ID
  app.get("/api/settings/teams/:id", async (req: Request, res: Response) => {
    try {
      const teamId = parseInt(req.params.id);
      if (isNaN(teamId)) {
        return res.status(400).json({ error: "Invalid team ID" });
      }

      const team = await storage.getTeam(teamId);
      if (!team) {
        return res.status(404).json({ error: "Team not found" });
      }

      res.json(team);
    } catch (error: any) {
      console.error("Error fetching team:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Update a team
  app.patch("/api/settings/teams/:id", async (req: Request, res: Response) => {
    try {
      const teamId = parseInt(req.params.id);
      if (isNaN(teamId)) {
        return res.status(400).json({ error: "Invalid team ID" });
      }

      const team = await storage.getTeam(teamId);
      if (!team) {
        return res.status(404).json({ error: "Team not found" });
      }

      const updateSchema = z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        createdBy: z.number().optional(),
        parentTeamId: z.number().optional(),
        isActive: z.boolean().optional(),
      });

      const validation = updateSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }

      const updatedTeam = await storage.updateTeam(teamId, validation.data);

      res.json(updatedTeam);
    } catch (error: any) {
      console.error("Error updating team:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Delete a team
  app.delete("/api/settings/teams/:id", async (req: Request, res: Response) => {
    try {
      const teamId = parseInt(req.params.id);
      if (isNaN(teamId)) {
        return res.status(400).json({ error: "Invalid team ID" });
      }

      const team = await storage.getTeam(teamId);
      if (!team) {
        return res.status(404).json({ error: "Team not found" });
      }

      await storage.deleteTeam(teamId);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting team:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get all team members for a team
  app.get("/api/settings/teams/:id/members", async (req: Request, res: Response) => {
    try {
      const teamId = parseInt(req.params.id);
      if (isNaN(teamId)) {
        return res.status(400).json({ error: "Invalid team ID" });
      }

      const team = await storage.getTeam(teamId);
      if (!team) {
        return res.status(404).json({ error: "Team not found" });
      }

      const members = await storage.listTeamMembers(teamId);
      res.json(members);
    } catch (error: any) {
      console.error("Error fetching team members:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Add a member to a team
  app.post("/api/settings/teams/:id/members", async (req: Request, res: Response) => {
    try {
      const teamId = parseInt(req.params.id);
      if (isNaN(teamId)) {
        return res.status(400).json({ error: "Invalid team ID" });
      }

      const team = await storage.getTeam(teamId);
      if (!team) {
        return res.status(404).json({ error: "Team not found" });
      }

      const validation = insertTeamMemberSchema.safeParse({
        ...req.body,
        teamId,
      });

      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }

      const newMember = await storage.createTeamMember(validation.data);

      res.status(201).json(newMember);
    } catch (error: any) {
      console.error("Error adding team member:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Update a team member
  app.patch("/api/settings/teams/:teamId/members/:memberId", async (req: Request, res: Response) => {
    try {
      const teamId = parseInt(req.params.teamId);
      const memberId = parseInt(req.params.memberId);
      
      if (isNaN(teamId) || isNaN(memberId)) {
        return res.status(400).json({ error: "Invalid team ID or member ID" });
      }

      const updateSchema = z.object({
        role: z.string().optional(),
      });

      const validation = updateSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }

      const updatedMember = await storage.updateTeamMember(memberId, {
        ...validation.data
      });

      res.json(updatedMember);
    } catch (error: any) {
      console.error("Error updating team member:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Remove a member from a team
  app.delete("/api/settings/teams/:teamId/members/:memberId", async (req: Request, res: Response) => {
    try {
      const teamId = parseInt(req.params.teamId);
      const memberId = parseInt(req.params.memberId);
      
      if (isNaN(teamId) || isNaN(memberId)) {
        return res.status(400).json({ error: "Invalid team ID or member ID" });
      }

      await storage.deleteTeamMember(memberId);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error removing team member:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create assignment
  app.post("/api/assignments", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const assignmentSchema = z.object({
        entityType: z.string(),
        entityId: z.number(),
        assignedToType: z.string(), // 'user' or 'team'
        assignedToId: z.number(),
        notes: z.string().optional(),
      });

      const validation = assignmentSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }

      // Add the current user as the assigner
      const newAssignment = await storage.createAssignment({
        ...validation.data,
        assignedById: req.user.id
      });

      res.status(201).json(newAssignment);
    } catch (error: any) {
      console.error("Error creating assignment:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get assignments for an entity
  app.get("/api/assignments/:entityType/:entityId", async (req: Request, res: Response) => {
    try {
      const entityType = req.params.entityType;
      const entityId = parseInt(req.params.entityId);
      
      if (isNaN(entityId)) {
        return res.status(400).json({ error: "Invalid entity ID" });
      }

      const assignments = await storage.listAssignments(entityType, entityId);
      res.json(assignments);
    } catch (error: any) {
      console.error("Error fetching assignments:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Delete assignment
  app.delete("/api/assignments/:id", async (req: Request, res: Response) => {
    try {
      const assignmentId = parseInt(req.params.id);
      
      if (isNaN(assignmentId)) {
        return res.status(400).json({ error: "Invalid assignment ID" });
      }

      await storage.deleteAssignment(assignmentId);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting assignment:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get all users (for team assignment)
  app.get("/api/users", async (req: Request, res: Response) => {
    try {
      const users = await storage.listUsers();
      
      // Filter out sensitive information
      const filteredUsers = users.map(user => ({
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      }));
      
      res.json(filteredUsers);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: error.message });
    }
  });
}