import { Express, Request, Response } from "express";
import { storage } from "./storage";
import { setupPermissionMiddleware, requirePermission } from "./permissions-manager";
import { and, eq } from "drizzle-orm";
import { db } from "./db";
import { modulePermissions, rolePermissions, userPermissions, teams, teamMembers, assignments, users } from "@shared/schema";

export function registerPermissionRoutes(app: Express) {
  // Setup permission middleware for all routes
  app.use(setupPermissionMiddleware);

  // Get all modules
  app.get("/api/settings/modules", requirePermission("settings", "view"), async (req: Request, res: Response) => {
    try {
      const modules = await db.select().from(modulePermissions).orderBy(modulePermissions.order);
      res.json(modules);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get role permissions
  app.get("/api/settings/permissions/roles/:role", requirePermission("settings", "view"), async (req: Request, res: Response) => {
    try {
      const { role } = req.params;
      const permissions = await db.select()
        .from(rolePermissions)
        .where(eq(rolePermissions.role, role));
      
      res.json(permissions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update role permission
  app.patch("/api/settings/permissions/roles/:role", requirePermission("settings", "update"), async (req: Request, res: Response) => {
    try {
      const { role } = req.params;
      const { moduleId, action, isAllowed } = req.body;

      // Don't allow removing view permission from Admin role
      if (role === "Admin" && action === "view" && !isAllowed) {
        return res.status(400).json({
          error: "Cannot remove view permission from Admin role"
        });
      }

      // Check if permission exists
      const [existingPermission] = await db.select()
        .from(rolePermissions)
        .where(
          and(
            eq(rolePermissions.role, role),
            eq(rolePermissions.moduleId, moduleId),
            eq(rolePermissions.action, action)
          )
        );

      if (existingPermission) {
        // Update existing permission
        const [updatedPermission] = await db.update(rolePermissions)
          .set({ 
            isAllowed,
            updatedAt: new Date()
          })
          .where(
            and(
              eq(rolePermissions.role, role),
              eq(rolePermissions.moduleId, moduleId),
              eq(rolePermissions.action, action)
            )
          )
          .returning();
        
        res.json(updatedPermission);
      } else {
        // Create new permission
        const [newPermission] = await db.insert(rolePermissions)
          .values({
            role,
            moduleId,
            action,
            isAllowed
          })
          .returning();
        
        res.json(newPermission);
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get user permissions
  app.get("/api/settings/permissions/users/:userId", requirePermission("settings", "view"), async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      const permissions = await db.select()
        .from(userPermissions)
        .where(eq(userPermissions.userId, userId));
      
      res.json(permissions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update user permission
  app.patch("/api/settings/permissions/users/:userId", requirePermission("settings", "update"), async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      const { moduleId, action, isAllowed } = req.body;

      // Check if permission exists
      const [existingPermission] = await db.select()
        .from(userPermissions)
        .where(
          and(
            eq(userPermissions.userId, userId),
            eq(userPermissions.moduleId, moduleId),
            eq(userPermissions.action, action)
          )
        );

      if (existingPermission) {
        // Update existing permission
        const [updatedPermission] = await db.update(userPermissions)
          .set({ 
            isAllowed,
            updatedAt: new Date()
          })
          .where(
            and(
              eq(userPermissions.userId, userId),
              eq(userPermissions.moduleId, moduleId),
              eq(userPermissions.action, action)
            )
          )
          .returning();
        
        res.json(updatedPermission);
      } else {
        // Create new permission
        const [newPermission] = await db.insert(userPermissions)
          .values({
            userId,
            moduleId,
            action,
            isAllowed
          })
          .returning();
        
        res.json(newPermission);
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Teams API
  // Get all teams
  app.get("/api/settings/teams", requirePermission("settings", "view"), async (req: Request, res: Response) => {
    try {
      const allTeams = await db.select().from(teams).orderBy(teams.name);
      res.json(allTeams);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create a team
  app.post("/api/settings/teams", requirePermission("settings", "create"), async (req: Request, res: Response) => {
    try {
      const { name, description } = req.body;
      
      // Check if team with same name exists
      const [existingTeam] = await db.select()
        .from(teams)
        .where(eq(teams.name, name));
      
      if (existingTeam) {
        return res.status(400).json({ error: "A team with this name already exists" });
      }

      const [newTeam] = await db.insert(teams)
        .values({
          name,
          description,
          leaderId: req.user?.id,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      // Add creator as team leader
      await db.insert(teamMembers)
        .values({
          teamId: newTeam.id,
          userId: req.user?.id,
          role: "Leader",
          createdAt: new Date(),
          updatedAt: new Date()
        });
      
      res.status(201).json(newTeam);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update a team
  app.patch("/api/settings/teams/:id", requirePermission("settings", "update"), async (req: Request, res: Response) => {
    try {
      const teamId = parseInt(req.params.id, 10);
      const { name, description, isActive, leaderId } = req.body;
      
      // Check if team exists
      const [existingTeam] = await db.select()
        .from(teams)
        .where(eq(teams.id, teamId));
      
      if (!existingTeam) {
        return res.status(404).json({ error: "Team not found" });
      }

      // Check if new name conflicts with another team
      if (name && name !== existingTeam.name) {
        const [nameConflict] = await db.select()
          .from(teams)
          .where(and(
            eq(teams.name, name),
            eq(teams.id, teamId, true) // not equal to the current team id
          ));
        
        if (nameConflict) {
          return res.status(400).json({ error: "A team with this name already exists" });
        }
      }

      const [updatedTeam] = await db.update(teams)
        .set({
          name: name || existingTeam.name,
          description: description !== undefined ? description : existingTeam.description,
          isActive: isActive !== undefined ? isActive : existingTeam.isActive,
          leaderId: leaderId || existingTeam.leaderId,
          updatedAt: new Date()
        })
        .where(eq(teams.id, teamId))
        .returning();
      
      res.json(updatedTeam);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete a team
  app.delete("/api/settings/teams/:id", requirePermission("settings", "delete"), async (req: Request, res: Response) => {
    try {
      const teamId = parseInt(req.params.id, 10);
      
      // Delete team members first (foreign key constraint)
      await db.delete(teamMembers).where(eq(teamMembers.teamId, teamId));
      
      // Delete team
      await db.delete(teams).where(eq(teams.id, teamId));
      
      res.status(204).end();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get team members
  app.get("/api/settings/teams/:id/members", requirePermission("settings", "view"), async (req: Request, res: Response) => {
    try {
      const teamId = parseInt(req.params.id, 10);
      const members = await db.select()
        .from(teamMembers)
        .where(eq(teamMembers.teamId, teamId));
      
      res.json(members);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Add team member
  app.post("/api/settings/teams/:id/members", requirePermission("settings", "update"), async (req: Request, res: Response) => {
    try {
      const teamId = parseInt(req.params.id, 10);
      const { userId, role } = req.body;

      // Check if team exists
      const [existingTeam] = await db.select()
        .from(teams)
        .where(eq(teams.id, teamId));
      
      if (!existingTeam) {
        return res.status(404).json({ error: "Team not found" });
      }

      // Check if user exists
      const [existingUser] = await db.select()
        .from(users)
        .where(eq(users.id, userId));
      
      if (!existingUser) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if user is already a member
      const [existingMember] = await db.select()
        .from(teamMembers)
        .where(
          and(
            eq(teamMembers.teamId, teamId),
            eq(teamMembers.userId, userId)
          )
        );
      
      if (existingMember) {
        return res.status(400).json({ error: "User is already a member of this team" });
      }

      // Add user to team
      const [newMember] = await db.insert(teamMembers)
        .values({
          teamId,
          userId,
          role: role || "Member",
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      res.status(201).json(newMember);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update team member
  app.patch("/api/settings/teams/:teamId/members/:memberId", requirePermission("settings", "update"), async (req: Request, res: Response) => {
    try {
      const memberId = parseInt(req.params.memberId, 10);
      const { role } = req.body;

      // Update member
      const [updatedMember] = await db.update(teamMembers)
        .set({
          role,
          updatedAt: new Date()
        })
        .where(eq(teamMembers.id, memberId))
        .returning();
      
      if (!updatedMember) {
        return res.status(404).json({ error: "Team member not found" });
      }
      
      res.json(updatedMember);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Remove team member
  app.delete("/api/settings/teams/:teamId/members/:memberId", requirePermission("settings", "update"), async (req: Request, res: Response) => {
    try {
      const memberId = parseInt(req.params.memberId, 10);

      // Delete team member
      await db.delete(teamMembers).where(eq(teamMembers.id, memberId));
      
      res.status(204).end();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Assignment API
  // Assign entity to user or team
  app.post("/api/assignments", requirePermission("settings", "assign"), async (req: Request, res: Response) => {
    try {
      const { entityType, entityId, assignedToType, assignedToId, notes } = req.body;

      // Validate entity type
      if (!["lead", "contact", "account", "opportunity"].includes(entityType)) {
        return res.status(400).json({ error: "Invalid entity type" });
      }

      // Validate assignment target type
      if (!["user", "team"].includes(assignedToType)) {
        return res.status(400).json({ error: "Invalid assignment target type" });
      }

      // Check if entity exists
      const entity = await storage.getEntityById(entityType, entityId);
      if (!entity) {
        return res.status(404).json({ error: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} not found` });
      }

      // Check if assignment target exists
      if (assignedToType === "user") {
        const [existingUser] = await db.select().from(users).where(eq(users.id, assignedToId));
        if (!existingUser) {
          return res.status(404).json({ error: "User not found" });
        }
      } else {
        const [existingTeam] = await db.select().from(teams).where(eq(teams.id, assignedToId));
        if (!existingTeam) {
          return res.status(404).json({ error: "Team not found" });
        }
      }

      // Create assignment
      const [newAssignment] = await db.insert(assignments)
        .values({
          entityType,
          entityId,
          assignedToType,
          assignedToId,
          assignedById: req.user?.id,
          notes
        })
        .returning();
      
      // For entities with ownerId field, update it if the assignment is to a user
      if (assignedToType === "user") {
        try {
          switch (entityType) {
            case "lead":
              await db.update(db.table("leads"))
                .set({ ownerId: assignedToId })
                .where(eq(db.table("leads").id, entityId));
              break;
            case "contact":
              await db.update(db.table("contacts"))
                .set({ ownerId: assignedToId })
                .where(eq(db.table("contacts").id, entityId));
              break;
            case "account":
              await db.update(db.table("accounts"))
                .set({ ownerId: assignedToId })
                .where(eq(db.table("accounts").id, entityId));
              break;
            case "opportunity":
              await db.update(db.table("opportunities"))
                .set({ ownerId: assignedToId })
                .where(eq(db.table("opportunities").id, entityId));
              break;
          }
        } catch (error) {
          console.error(`Failed to update owner ID for ${entityType} ${entityId}:`, error);
        }
      }
      
      res.status(201).json(newAssignment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get assignments for entity
  app.get("/api/assignments/:entityType/:entityId", requirePermission("settings", "view"), async (req: Request, res: Response) => {
    try {
      const { entityType, entityId } = req.params;
      
      const entityAssignments = await db.select()
        .from(assignments)
        .where(
          and(
            eq(assignments.entityType, entityType),
            eq(assignments.entityId, parseInt(entityId, 10))
          )
        );
      
      res.json(entityAssignments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete assignment
  app.delete("/api/assignments/:id", requirePermission("settings", "assign"), async (req: Request, res: Response) => {
    try {
      const assignmentId = parseInt(req.params.id, 10);
      
      // Delete assignment
      await db.delete(assignments).where(eq(assignments.id, assignmentId));
      
      res.status(204).end();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}