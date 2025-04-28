import { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { MemStorage, DatabaseStorage } from "./storage";
import { eq, and } from "drizzle-orm";
import { userPermissions, modulePermissions, rolePermissions, teamMembers, assignments } from "@shared/schema";
import { db } from "./db";

// Enhanced request interface with permission checker
export interface PermissionRequest extends Request {
  hasPermission(module: string, action: string): Promise<boolean>;
  hasEntityAccess(entityType: string, entityId: number): Promise<boolean>;
}

/**
 * Middleware to check permissions for a specific module and action
 * @param module The module name to check permissions for
 * @param action The action to check permissions for (view, create, update, delete, export, import, assign)
 */
export function requirePermission(module: string, action: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const permReq = req as PermissionRequest;
    const hasPermission = await permReq.hasPermission(module, action);

    if (!hasPermission) {
      return res.status(403).json({ 
        error: "Permission denied", 
        message: `You don't have permission to ${action} in the ${module} module` 
      });
    }

    next();
  };
}

/**
 * Middleware to check access to a specific entity
 * @param entityTypeParam Request parameter containing the entity type
 * @param entityIdParam Request parameter containing the entity ID
 */
export function requireEntityAccess(entityTypeParam: string, entityIdParam: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const permReq = req as PermissionRequest;
    const entityType = req.params[entityTypeParam];
    const entityId = parseInt(req.params[entityIdParam], 10);

    if (isNaN(entityId)) {
      return res.status(400).json({ error: "Invalid entity ID" });
    }

    const hasAccess = await permReq.hasEntityAccess(entityType, entityId);

    if (!hasAccess) {
      return res.status(403).json({ 
        error: "Access denied", 
        message: `You don't have access to this ${entityType}` 
      });
    }

    next();
  };
}

/**
 * Middleware to setup permission checking methods on the request object
 */
export function setupPermissionMiddleware(req: Request, _res: Response, next: NextFunction) {
  const permReq = req as PermissionRequest;

  // Add permission checking method to request
  permReq.hasPermission = async (module: string, action: string): Promise<boolean> => {
    if (!req.isAuthenticated() || !req.user) {
      return false;
    }

    // Admin users have all permissions
    if (req.user.role === "Admin") {
      return true;
    }

    try {
      // First check user-specific permissions (overrides role permissions)
      const moduleEntity = await storage.getModuleByName(module);
      if (!moduleEntity) {
        return false;
      }

      // Check user-specific permissions
      const userPermission = await storage.getUserPermission(req.user.id, moduleEntity.id, action);
      if (userPermission) {
        return userPermission.isAllowed;
      }

      // Check role-based permissions
      const rolePermission = await storage.getRolePermission(req.user.role, moduleEntity.id, action);
      if (rolePermission) {
        return rolePermission.isAllowed;
      }

      return false;
    } catch (error) {
      console.error("Error checking permissions:", error);
      return false;
    }
  };

  // Add entity access checking method to request
  permReq.hasEntityAccess = async (entityType: string, entityId: number): Promise<boolean> => {
    if (!req.isAuthenticated() || !req.user) {
      return false;
    }

    // Admin users have access to all entities
    if (req.user.role === "Admin") {
      return true;
    }

    try {
      // Check if user is assigned to the entity directly
      const directAccess = await storage.checkUserEntityAccess(req.user.id, entityType, entityId);
      if (directAccess) {
        return true;
      }

      // Check if the user has access through a team assignment
      const teamAccess = await storage.checkTeamEntityAccess(req.user.id, entityType, entityId);
      if (teamAccess) {
        return true;
      }

      // Manager can access entities assigned to their reports
      if (req.user.role === "Manager") {
        // TODO: Implement logic to check if entity is assigned to a user that reports to this manager
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error checking entity access:", error);
      return false;
    }
  };

  next();
}

/**
 * Add permission methods to MemStorage
 */
export function addPermissionsToMemStorage(storage: MemStorage): void {
  const modulePermissionsList: any[] = [];
  const rolePermissionsList: any[] = [];
  const userPermissionsList: any[] = [];
  const teamsList: any[] = [];
  const teamMembersList: any[] = [];
  const assignmentsList: any[] = [];

  // Get module by name
  storage.getModuleByName = async function(moduleName: string) {
    return modulePermissionsList.find(m => m.moduleName === moduleName);
  };

  // Get user permission
  storage.getUserPermission = async function(userId: number, moduleId: number, action: string) {
    return userPermissionsList.find(p => 
      p.userId === userId && 
      p.moduleId === moduleId && 
      p.action === action
    );
  };

  // Get role permission
  storage.getRolePermission = async function(role: string, moduleId: number, action: string) {
    return rolePermissionsList.find(p => 
      p.role === role && 
      p.moduleId === moduleId && 
      p.action === action
    );
  };

  // Check user's direct access to an entity
  storage.checkUserEntityAccess = async function(userId: number, entityType: string, entityId: number) {
    // Check if user is the entity owner
    const entity = await storage.getEntityById(entityType, entityId);
    if (entity && entity.ownerId === userId) {
      return true;
    }

    // Check if user is assigned to the entity
    return assignmentsList.some(a => 
      a.entityType === entityType && 
      a.entityId === entityId && 
      a.assignedToType === 'user' && 
      a.assignedToId === userId
    );
  };

  // Check team-based access to an entity
  storage.checkTeamEntityAccess = async function(userId: number, entityType: string, entityId: number) {
    // Get teams the user belongs to
    const userTeams = teamMembersList
      .filter(tm => tm.userId === userId)
      .map(tm => tm.teamId);

    // Check if any team is assigned to the entity
    return userTeams.length > 0 && assignmentsList.some(a => 
      a.entityType === entityType && 
      a.entityId === entityId && 
      a.assignedToType === 'team' && 
      userTeams.includes(a.assignedToId)
    );
  };

  // Get entity by ID and type
  storage.getEntityById = async function(entityType: string, entityId: number) {
    switch (entityType) {
      case 'lead':
        return storage.getLead(entityId);
      case 'contact':
        return storage.getContact(entityId);
      case 'account':
        return storage.getAccount(entityId);
      case 'opportunity':
        return storage.getOpportunity(entityId);
      default:
        return null;
    }
  };

  // Create initial module permissions
  storage.initializePermissions = async function() {
    const modules = [
      { id: 1, moduleName: 'contacts', displayName: 'Contacts', description: 'Manage contacts', isActive: true, order: 1, icon: 'users' },
      { id: 2, moduleName: 'accounts', displayName: 'Accounts', description: 'Manage accounts/companies', isActive: true, order: 2, icon: 'building' },
      { id: 3, moduleName: 'leads', displayName: 'Leads', description: 'Manage leads', isActive: true, order: 3, icon: 'user-plus' },
      { id: 4, moduleName: 'opportunities', displayName: 'Opportunities', description: 'Manage sales opportunities', isActive: true, order: 4, icon: 'trending-up' },
      { id: 5, moduleName: 'tasks', displayName: 'Tasks', description: 'Manage tasks', isActive: true, order: 5, icon: 'check-square' },
      { id: 6, moduleName: 'events', displayName: 'Events', description: 'Manage calendar events', isActive: true, order: 6, icon: 'calendar' },
      { id: 7, moduleName: 'communications', displayName: 'Communications', description: 'Manage customer communications', isActive: true, order: 7, icon: 'message-square' },
      { id: 8, moduleName: 'products', displayName: 'Products', description: 'Manage products', isActive: true, order: 8, icon: 'package' },
      { id: 9, moduleName: 'inventory', displayName: 'Inventory', description: 'Manage inventory', isActive: true, order: 9, icon: 'box' },
      { id: 10, moduleName: 'invoices', displayName: 'Invoices', description: 'Manage invoices', isActive: true, order: 10, icon: 'file-text' },
      { id: 11, moduleName: 'purchase-orders', displayName: 'Purchase Orders', description: 'Manage purchase orders', isActive: true, order: 11, icon: 'shopping-cart' },
      { id: 12, moduleName: 'reports', displayName: 'Reports', description: 'View and export reports', isActive: true, order: 12, icon: 'bar-chart-2' },
      { id: 13, moduleName: 'workflows', displayName: 'Workflows', description: 'Manage automation workflows', isActive: true, order: 13, icon: 'git-branch' },
      { id: 14, moduleName: 'settings', displayName: 'Settings', description: 'System settings and configuration', isActive: true, order: 14, icon: 'settings' },
      { id: 15, moduleName: 'users', displayName: 'Users', description: 'Manage system users', isActive: true, order: 15, icon: 'users' },
      { id: 16, moduleName: 'api-keys', displayName: 'API Keys', description: 'Manage API integrations', isActive: true, order: 16, icon: 'key' },
      { id: 17, moduleName: 'subscriptions', displayName: 'Subscriptions', description: 'Manage subscription packages', isActive: true, order: 17, icon: 'credit-card' },
      { id: 18, moduleName: 'proposals', displayName: 'Proposals', description: 'Create and manage proposals/contracts', isActive: true, order: 18, icon: 'file' },
    ];

    modulePermissionsList.push(...modules);

    // Define default role permissions
    const actions = ['view', 'create', 'update', 'delete', 'export', 'import', 'assign'];
    const roles = ['Admin', 'Manager', 'User', 'ReadOnly'];

    // Create default role permissions
    let permId = 1;
    roles.forEach(role => {
      modules.forEach(module => {
        actions.forEach(action => {
          let isAllowed = false;
          
          // Admin has all permissions
          if (role === 'Admin') {
            isAllowed = true;
          }
          // Manager has most permissions
          else if (role === 'Manager') {
            isAllowed = action !== 'delete' || (
              module.moduleName !== 'users' && 
              module.moduleName !== 'settings' && 
              module.moduleName !== 'subscriptions'
            );
          }
          // Regular user has limited permissions
          else if (role === 'User') {
            isAllowed = (
              // Can view most things
              (action === 'view') ||
              // Can create and update basic entities
              ((action === 'create' || action === 'update') && 
               ['contacts', 'leads', 'opportunities', 'tasks', 'events', 'communications'].includes(module.moduleName))
            );
          }
          // ReadOnly user can only view
          else if (role === 'ReadOnly') {
            isAllowed = action === 'view' && module.moduleName !== 'settings' && module.moduleName !== 'users';
          }

          rolePermissionsList.push({
            id: permId++,
            role,
            moduleId: module.id,
            action,
            isAllowed,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        });
      });
    });
  };
}

/**
 * Add permission methods to DatabaseStorage
 */
export function addPermissionsToDatabaseStorage(storage: DatabaseStorage): void {
  // Get module by name
  storage.getModuleByName = async function(moduleName: string) {
    const [module] = await db.select().from(modulePermissions).where(eq(modulePermissions.moduleName, moduleName));
    return module;
  };

  // Get user permission
  storage.getUserPermission = async function(userId: number, moduleId: number, action: string) {
    const [userPermission] = await db.select()
      .from(userPermissions)
      .where(
        and(
          eq(userPermissions.userId, userId),
          eq(userPermissions.moduleId, moduleId),
          eq(userPermissions.action, action)
        )
      );
    return userPermission;
  };

  // Get role permission
  storage.getRolePermission = async function(role: string, moduleId: number, action: string) {
    const [rolePermission] = await db.select()
      .from(rolePermissions)
      .where(
        and(
          eq(rolePermissions.role, role),
          eq(rolePermissions.moduleId, moduleId),
          eq(rolePermissions.action, action)
        )
      );
    return rolePermission;
  };

  // Check user's direct access to an entity
  storage.checkUserEntityAccess = async function(userId: number, entityType: string, entityId: number) {
    // Check if user is the entity owner
    const entity = await storage.getEntityById(entityType, entityId);
    
    if (entity && entity.ownerId === userId) {
      return true;
    }

    // Check if user is directly assigned to the entity
    const [assignment] = await db.select()
      .from(assignments)
      .where(
        and(
          eq(assignments.entityType, entityType),
          eq(assignments.entityId, entityId),
          eq(assignments.assignedToType, 'user'),
          eq(assignments.assignedToId, userId)
        )
      );
    
    return !!assignment;
  };

  // Check team-based access to an entity
  storage.checkTeamEntityAccess = async function(userId: number, entityType: string, entityId: number) {
    // Get teams the user belongs to
    const userTeamMembers = await db.select()
      .from(teamMembers)
      .where(eq(teamMembers.userId, userId));
    
    if (userTeamMembers.length === 0) {
      return false;
    }

    const userTeamIds = userTeamMembers.map(tm => tm.teamId);
    
    // Check if any of user's teams are assigned to the entity
    const [teamAssignment] = await db.select()
      .from(assignments)
      .where(
        and(
          eq(assignments.entityType, entityType),
          eq(assignments.entityId, entityId),
          eq(assignments.assignedToType, 'team'),
          // TODO: Fix this. Need to check if assignedToId is in userTeamIds array
          // This is a simplification and might not work with actual Drizzle syntax
          eq(assignments.assignedToId, userTeamIds[0])
        )
      );
    
    return !!teamAssignment;
  };

  // Get entity by ID and type
  storage.getEntityById = async function(entityType: string, entityId: number) {
    switch (entityType) {
      case 'lead':
        return storage.getLead(entityId);
      case 'contact':
        return storage.getContact(entityId);
      case 'account':
        return storage.getAccount(entityId);
      case 'opportunity':
        return storage.getOpportunity(entityId);
      default:
        return null;
    }
  };

  // Initialize default permissions in the database
  storage.initializePermissions = async function() {
    // Check if permissions already exist
    const [existingModule] = await db.select().from(modulePermissions).limit(1);
    if (existingModule) {
      console.log("Permissions already initialized, skipping...");
      return;
    }

    // Create modules
    const modules = [
      { moduleName: 'contacts', displayName: 'Contacts', description: 'Manage contacts', isActive: true, order: 1, icon: 'users' },
      { moduleName: 'accounts', displayName: 'Accounts', description: 'Manage accounts/companies', isActive: true, order: 2, icon: 'building' },
      { moduleName: 'leads', displayName: 'Leads', description: 'Manage leads', isActive: true, order: 3, icon: 'user-plus' },
      { moduleName: 'opportunities', displayName: 'Opportunities', description: 'Manage sales opportunities', isActive: true, order: 4, icon: 'trending-up' },
      { moduleName: 'tasks', displayName: 'Tasks', description: 'Manage tasks', isActive: true, order: 5, icon: 'check-square' },
      { moduleName: 'events', displayName: 'Events', description: 'Manage calendar events', isActive: true, order: 6, icon: 'calendar' },
      { moduleName: 'communications', displayName: 'Communications', description: 'Manage customer communications', isActive: true, order: 7, icon: 'message-square' },
      { moduleName: 'products', displayName: 'Products', description: 'Manage products', isActive: true, order: 8, icon: 'package' },
      { moduleName: 'inventory', displayName: 'Inventory', description: 'Manage inventory', isActive: true, order: 9, icon: 'box' },
      { moduleName: 'invoices', displayName: 'Invoices', description: 'Manage invoices', isActive: true, order: 10, icon: 'file-text' },
      { moduleName: 'purchase-orders', displayName: 'Purchase Orders', description: 'Manage purchase orders', isActive: true, order: 11, icon: 'shopping-cart' },
      { moduleName: 'reports', displayName: 'Reports', description: 'View and export reports', isActive: true, order: 12, icon: 'bar-chart-2' },
      { moduleName: 'workflows', displayName: 'Workflows', description: 'Manage automation workflows', isActive: true, order: 13, icon: 'git-branch' },
      { moduleName: 'settings', displayName: 'Settings', description: 'System settings and configuration', isActive: true, order: 14, icon: 'settings' },
      { moduleName: 'users', displayName: 'Users', description: 'Manage system users', isActive: true, order: 15, icon: 'users' },
      { moduleName: 'api-keys', displayName: 'API Keys', description: 'Manage API integrations', isActive: true, order: 16, icon: 'key' },
      { moduleName: 'subscriptions', displayName: 'Subscriptions', description: 'Manage subscription packages', isActive: true, order: 17, icon: 'credit-card' },
      { moduleName: 'proposals', displayName: 'Proposals', description: 'Create and manage proposals/contracts', isActive: true, order: 18, icon: 'file' },
    ];

    console.log("Initializing module permissions...");
    
    // Insert modules and maintain their IDs 
    const moduleIds = {};
    
    for (const module of modules) {
      const [insertedModule] = await db.insert(modulePermissions).values(module).returning();
      moduleIds[module.moduleName] = insertedModule.id;
    }

    console.log("Initializing role permissions...");

    // Define actions and roles
    const actions = ['view', 'create', 'update', 'delete', 'export', 'import', 'assign'];
    const roles = ['Admin', 'Manager', 'User', 'ReadOnly'];

    // Insert role permissions
    for (const role of roles) {
      for (const [moduleName, moduleId] of Object.entries(moduleIds)) {
        for (const action of actions) {
          let isAllowed = false;
          
          // Admin has all permissions
          if (role === 'Admin') {
            isAllowed = true;
          }
          // Manager has most permissions
          else if (role === 'Manager') {
            isAllowed = action !== 'delete' || (
              moduleName !== 'users' && 
              moduleName !== 'settings' && 
              moduleName !== 'subscriptions'
            );
          }
          // Regular user has limited permissions
          else if (role === 'User') {
            isAllowed = (
              // Can view most things
              (action === 'view') ||
              // Can create and update basic entities
              ((action === 'create' || action === 'update') && 
              ['contacts', 'leads', 'opportunities', 'tasks', 'events', 'communications'].includes(moduleName))
            );
          }
          // ReadOnly user can only view
          else if (role === 'ReadOnly') {
            isAllowed = action === 'view' && moduleName !== 'settings' && moduleName !== 'users';
          }

          await db.insert(rolePermissions).values({
            role,
            moduleId: moduleId as number,
            action,
            isAllowed
          });
        }
      }
    }

    console.log("Permission initialization complete.");
  };
}