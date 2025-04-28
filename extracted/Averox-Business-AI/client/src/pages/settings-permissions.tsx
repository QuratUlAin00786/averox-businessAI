import { useState, useEffect } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { PageHeader } from "@/components/page-header";
import { Shield, ShieldAlert, ShieldCheck, User, Users, FileText, Briefcase, Settings } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Layout } from "@/components/layout/layout";

interface Module {
  id: number;
  moduleName: string;
  displayName: string;
  description: string;
  icon: string;
  isActive: boolean;
  order: number;
}

interface Permission {
  id: number;
  moduleId: number;
  action: string;
  isAllowed: boolean;
}

interface RolePermission extends Permission {
  role: string;
}

interface UserPermission extends Permission {
  userId: number;
}

interface Team {
  id: number;
  name: string;
  description: string;
  leaderId: number;
  isActive: boolean;
}

interface TeamMember {
  id: number;
  teamId: number;
  userId: number;
  role: string;
}

interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

const PermissionsSettings = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeRole, setActiveRole] = useState("Admin");
  const [activeTab, setActiveTab] = useState("roles");
  const [activeUserId, setActiveUserId] = useState<number | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [isAddTeamDialogOpen, setIsAddTeamDialogOpen] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: "", description: "" });
  const [isAddTeamMemberDialogOpen, setIsAddTeamMemberDialogOpen] = useState(false);
  const [newTeamMember, setNewTeamMember] = useState({ userId: 0, role: "Member" });

  // Fetch modules
  const { data: modules = [] } = useQuery<Module[]>({
    queryKey: ["/api/settings/modules"],
    enabled: user?.role === "Admin",
  });

  // Fetch role permissions
  const { data: rolePermissions = [] } = useQuery<RolePermission[]>({
    queryKey: ["/api/settings/permissions/roles", activeRole],
    enabled: !!activeRole && user?.role === "Admin",
  });

  // Fetch user permissions
  const { data: userPermissions = [] } = useQuery<UserPermission[]>({
    queryKey: ["/api/settings/permissions/users", activeUserId],
    enabled: !!activeUserId && user?.role === "Admin",
  });

  // Fetch users
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: user?.role === "Admin",
  });

  // Fetch teams
  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ["/api/settings/teams"],
    enabled: user?.role === "Admin",
  });

  // Fetch team members for selected team
  const { data: teamMembers = [] } = useQuery<TeamMember[]>({
    queryKey: ["/api/settings/teams", selectedTeam, "members"],
    enabled: !!selectedTeam && user?.role === "Admin",
  });

  // Update role permission
  const updateRolePermissionMutation = useMutation({
    mutationFn: async ({ role, moduleId, action, isAllowed }: { role: string; moduleId: number; action: string; isAllowed: boolean }) => {
      const res = await apiRequest("PATCH", `/api/settings/permissions/roles/${role}`, {
        moduleId,
        action,
        isAllowed,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/permissions/roles", activeRole] });
      toast({
        title: "Permission updated",
        description: "Role permission has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating permission",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update user permission
  const updateUserPermissionMutation = useMutation({
    mutationFn: async ({ userId, moduleId, action, isAllowed }: { userId: number; moduleId: number; action: string; isAllowed: boolean }) => {
      const res = await apiRequest("PATCH", `/api/settings/permissions/users/${userId}`, {
        moduleId,
        action,
        isAllowed,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/permissions/users", activeUserId] });
      toast({
        title: "Permission updated",
        description: "User permission has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating permission",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create team
  const createTeamMutation = useMutation({
    mutationFn: async (team: { name: string; description: string }) => {
      const res = await apiRequest("POST", "/api/settings/teams", team);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/teams"] });
      setIsAddTeamDialogOpen(false);
      setNewTeam({ name: "", description: "" });
      toast({
        title: "Team created",
        description: "Team has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating team",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Add team member
  const addTeamMemberMutation = useMutation({
    mutationFn: async (data: { teamId: number; userId: number; role: string }) => {
      const res = await apiRequest("POST", `/api/settings/teams/${data.teamId}/members`, {
        userId: data.userId,
        role: data.role,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/teams", selectedTeam, "members"] });
      setIsAddTeamMemberDialogOpen(false);
      setNewTeamMember({ userId: 0, role: "Member" });
      toast({
        title: "Team member added",
        description: "Member has been added to the team successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error adding team member",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Remove team member
  const removeTeamMemberMutation = useMutation({
    mutationFn: async ({ teamId, memberId }: { teamId: number; memberId: number }) => {
      const res = await apiRequest("DELETE", `/api/settings/teams/${teamId}/members/${memberId}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/teams", selectedTeam, "members"] });
      toast({
        title: "Team member removed",
        description: "Member has been removed from the team successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error removing team member",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // If user is not admin, show access denied
  if (user?.role !== "Admin") {
    return (
      <Layout>
        <div className="container mx-auto py-10">
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <ShieldAlert className="h-20 w-20 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-gray-500 text-center max-w-md">
              You don't have permission to access the user visibility and permission settings.
              Please contact your administrator for assistance.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  const handleCreateTeam = () => {
    if (!newTeam.name) {
      toast({
        title: "Error",
        description: "Team name is required",
        variant: "destructive",
      });
      return;
    }
    createTeamMutation.mutate(newTeam);
  };

  const handleAddTeamMember = () => {
    if (!newTeamMember.userId || !selectedTeam) {
      toast({
        title: "Error",
        description: "Please select a user",
        variant: "destructive",
      });
      return;
    }
    addTeamMemberMutation.mutate({
      teamId: selectedTeam,
      userId: newTeamMember.userId,
      role: newTeamMember.role,
    });
  };

  const handleRemoveTeamMember = (memberId: number) => {
    if (confirm("Are you sure you want to remove this team member?") && selectedTeam) {
      removeTeamMemberMutation.mutate({
        teamId: selectedTeam,
        memberId,
      });
    }
  };

  const handleToggleRolePermission = (moduleId: number, action: string, currentValue: boolean) => {
    updateRolePermissionMutation.mutate({
      role: activeRole,
      moduleId,
      action,
      isAllowed: !currentValue,
    });
  };

  const handleToggleUserPermission = (moduleId: number, action: string, currentValue: boolean) => {
    if (activeUserId) {
      updateUserPermissionMutation.mutate({
        userId: activeUserId,
        moduleId,
        action,
        isAllowed: !currentValue,
      });
    }
  };

  const getModuleIcon = (iconName: string) => {
    switch (iconName) {
      case "users":
        return <Users className="h-4 w-4" />;
      case "user":
        return <User className="h-4 w-4" />;
      case "file-text":
        return <FileText className="h-4 w-4" />;
      case "briefcase":
        return <Briefcase className="h-4 w-4" />;
      case "settings":
        return <Settings className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Get permissions for a module
  const getPermissionsForModule = (moduleId: number, isUserPermissions: boolean) => {
    const permissionsList = isUserPermissions ? userPermissions : rolePermissions;
    return permissionsList.filter((p) => p.moduleId === moduleId);
  };

  // Format action name for display
  const formatActionName = (action: string) => {
    return action.charAt(0).toUpperCase() + action.slice(1);
  };

  // Get user by ID
  const getUserById = (userId: number) => {
    return users.find((u) => u.id === userId);
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <PageHeader
          title="User Visibility & Permissions"
          description="Manage user roles, permissions, and team assignments"
          icon={<Shield className="h-6 w-6 text-primary" />}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Role Permissions
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              User-Specific Permissions
            </TabsTrigger>
            <TabsTrigger value="teams" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Team Management
            </TabsTrigger>
          </TabsList>

          {/* Role Permissions Tab */}
          <TabsContent value="roles" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Role-Based Permissions</CardTitle>
                <CardDescription>
                  Set default permissions for each role. These apply to all users with the selected role.
                </CardDescription>
                <div className="flex justify-end mt-2">
                  <Select value={activeRole} onValueChange={setActiveRole}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="User">User</SelectItem>
                      <SelectItem value="ReadOnly">Read Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[250px]">Module</TableHead>
                        <TableHead>View</TableHead>
                        <TableHead>Create</TableHead>
                        <TableHead>Update</TableHead>
                        <TableHead>Delete</TableHead>
                        <TableHead>Export</TableHead>
                        <TableHead>Import</TableHead>
                        <TableHead>Assign</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {modules.map((module) => {
                        const permissions = getPermissionsForModule(module.id, false);
                        return (
                          <TableRow key={module.id}>
                            <TableCell className="font-medium flex items-center gap-2">
                              {getModuleIcon(module.icon)}
                              {module.displayName}
                            </TableCell>
                            {['view', 'create', 'update', 'delete', 'export', 'import', 'assign'].map((action) => {
                              const permission = permissions.find((p) => p.action === action);
                              const isAllowed = permission?.isAllowed ?? false;
                              return (
                                <TableCell key={action}>
                                  <Switch 
                                    checked={isAllowed}
                                    onCheckedChange={() => handleToggleRolePermission(module.id, action, isAllowed)}
                                    disabled={activeRole === "Admin" && action === "view"} // Admin must always have view access
                                  />
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User-Specific Permissions Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User-Specific Permissions</CardTitle>
                <CardDescription>
                  Override role-based permissions for specific users. These take precedence over the user's role permissions.
                </CardDescription>
                <div className="flex justify-end mt-2">
                  <Select 
                    value={activeUserId?.toString() || ""}
                    onValueChange={(val) => setActiveUserId(parseInt(val, 10))}
                  >
                    <SelectTrigger className="w-[240px]">
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.firstName} {user.lastName} ({user.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {activeUserId ? (
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[250px]">Module</TableHead>
                          <TableHead>View</TableHead>
                          <TableHead>Create</TableHead>
                          <TableHead>Update</TableHead>
                          <TableHead>Delete</TableHead>
                          <TableHead>Export</TableHead>
                          <TableHead>Import</TableHead>
                          <TableHead>Assign</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {modules.map((module) => {
                          const permissions = getPermissionsForModule(module.id, true);
                          return (
                            <TableRow key={module.id}>
                              <TableCell className="font-medium flex items-center gap-2">
                                {getModuleIcon(module.icon)}
                                {module.displayName}
                              </TableCell>
                              {['view', 'create', 'update', 'delete', 'export', 'import', 'assign'].map((action) => {
                                const permission = permissions.find((p) => p.action === action);
                                const isAllowed = permission?.isAllowed ?? false;
                                return (
                                  <TableCell key={action}>
                                    <Switch 
                                      checked={isAllowed}
                                      onCheckedChange={() => handleToggleUserPermission(module.id, action, isAllowed)}
                                    />
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    Please select a user to manage their specific permissions
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Teams Tab */}
          <TabsContent value="teams" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Teams List */}
              <Card className="md:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle>Teams</CardTitle>
                  <Dialog open={isAddTeamDialogOpen} onOpenChange={setIsAddTeamDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">Add Team</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Team</DialogTitle>
                        <DialogDescription>
                          Create a new team to group users and manage assignments.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Team Name</Label>
                          <Input
                            id="name"
                            placeholder="Sales Team"
                            value={newTeam.name}
                            onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Input
                            id="description"
                            placeholder="Team responsible for sales operations"
                            value={newTeam.description}
                            onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddTeamDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateTeam} disabled={createTeamMutation.isPending}>
                          {createTeamMutation.isPending ? "Creating..." : "Create Team"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {teams.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">
                        No teams created yet
                      </div>
                    ) : (
                      teams.map((team) => (
                        <div
                          key={team.id}
                          className={`p-3 border rounded-md cursor-pointer hover:bg-gray-50 ${
                            selectedTeam === team.id ? "border-primary bg-primary/5" : ""
                          }`}
                          onClick={() => setSelectedTeam(team.id)}
                        >
                          <div className="font-medium flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            {team.name}
                            {!team.isActive && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                Inactive
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {team.description}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Team Members */}
              <Card className="md:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>
                      {selectedTeam 
                        ? `Manage members for ${teams.find(t => t.id === selectedTeam)?.name}`
                        : "Select a team to manage its members"}
                    </CardDescription>
                  </div>
                  {selectedTeam && (
                    <Dialog open={isAddTeamMemberDialogOpen} onOpenChange={setIsAddTeamMemberDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" disabled={!selectedTeam}>Add Member</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Team Member</DialogTitle>
                          <DialogDescription>
                            Add a new member to the team {teams.find(t => t.id === selectedTeam)?.name}.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="user">User</Label>
                            <Select
                              value={newTeamMember.userId ? newTeamMember.userId.toString() : ""}
                              onValueChange={(val) => setNewTeamMember({ ...newTeamMember, userId: parseInt(val, 10) })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a user" />
                              </SelectTrigger>
                              <SelectContent>
                                {users
                                  .filter((user) => !teamMembers.some((m) => m.userId === user.id))
                                  .map((user) => (
                                    <SelectItem key={user.id} value={user.id.toString()}>
                                      {user.firstName} {user.lastName} ({user.role})
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="role">Role in Team</Label>
                            <Select
                              value={newTeamMember.role}
                              onValueChange={(val) => setNewTeamMember({ ...newTeamMember, role: val })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Leader">Team Leader</SelectItem>
                                <SelectItem value="Member">Team Member</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAddTeamMemberDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleAddTeamMember} disabled={addTeamMemberMutation.isPending}>
                            {addTeamMemberMutation.isPending ? "Adding..." : "Add Member"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardHeader>
                <CardContent>
                  {!selectedTeam ? (
                    <div className="text-center py-10 text-gray-500">
                      Select a team to view its members
                    </div>
                  ) : teamMembers.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                      No members in this team yet
                    </div>
                  ) : (
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role in Team</TableHead>
                            <TableHead>System Role</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {teamMembers.map((member) => {
                            const user = getUserById(member.userId);
                            return (
                              <TableRow key={member.id}>
                                <TableCell>
                                  {user ? `${user.firstName} ${user.lastName}` : `User #${member.userId}`}
                                </TableCell>
                                <TableCell>{user?.email}</TableCell>
                                <TableCell>
                                  <Badge variant={member.role === "Leader" ? "default" : "outline"}>
                                    {member.role}
                                  </Badge>
                                </TableCell>
                                <TableCell>{user?.role}</TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveTeamMember(member.id)}
                                  >
                                    Remove
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default PermissionsSettings;