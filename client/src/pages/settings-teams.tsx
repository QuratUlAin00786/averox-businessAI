import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Plus, Search, Trash2, User, Users, X, UserPlus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Define types
type Team = {
  id: number;
  name: string;
  description?: string;
  leaderId?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
};

type TeamMember = {
  id: number;
  teamId: number;
  userId: number;
  role: string;
  createdAt: string;
  updatedAt?: string;
  user?: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
    email: string;
    avatar?: string;
  };
};

type User = {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  email: string;
  avatar?: string;
  role: string;
};

// Form validation schemas
const createTeamSchema = z.object({
  name: z.string().min(1, "Team name is required"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

const updateTeamSchema = createTeamSchema.extend({
  id: z.number(),
});

const addMemberSchema = z.object({
  userId: z.string().min(1, "User is required"),
  role: z.string().default("Member"),
});

export default function TeamsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [teamMemberSearch, setTeamMemberSearch] = useState("");

  // Fetch teams
  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ["/api/settings/teams"],
    queryFn: () => apiRequest("GET", "/api/settings/teams").then((res) => res.json()),
  });

  // Fetch team members for selected team
  const {
    data: teamMembers,
    isLoading: teamMembersLoading,
    refetch: refetchTeamMembers,
  } = useQuery({
    queryKey: ["/api/settings/teams/members", selectedTeam?.id],
    queryFn: () => {
      if (!selectedTeam) return [];
      return apiRequest("GET", `/api/settings/teams/${selectedTeam.id}/members`).then(
        (res) => res.json()
      );
    },
    enabled: !!selectedTeam,
  });

  // Fetch all users for member selection
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/users"],
    queryFn: () => apiRequest("GET", "/api/users").then((res) => res.json()),
  });

  // Setup form for creating a team
  const createForm = useForm<z.infer<typeof createTeamSchema>>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: "",
      description: "",
      isActive: true,
    },
  });

  // Setup form for editing a team
  const editForm = useForm<z.infer<typeof updateTeamSchema>>({
    resolver: zodResolver(updateTeamSchema),
    defaultValues: {
      id: 0,
      name: "",
      description: "",
      isActive: true,
    },
  });

  // Setup form for adding a member
  const addMemberForm = useForm<z.infer<typeof addMemberSchema>>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      userId: "",
      role: "Member",
    },
  });

  // Mutations
  const createTeam = useMutation({
    mutationFn: (data: z.infer<typeof createTeamSchema>) => {
      return apiRequest("POST", "/api/settings/teams", data).then((res) => {
        if (!res.ok) throw new Error("Failed to create team");
        return res.json();
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/teams"] });
      toast({
        title: "Team created",
        description: "Team has been created successfully.",
      });
      setIsCreateDialogOpen(false);
      createForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create team",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateTeam = useMutation({
    mutationFn: (data: z.infer<typeof updateTeamSchema>) => {
      return apiRequest("PATCH", `/api/settings/teams/${data.id}`, {
        name: data.name,
        description: data.description,
        isActive: data.isActive,
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to update team");
        return res.json();
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/teams"] });
      toast({
        title: "Team updated",
        description: "Team has been updated successfully.",
      });
      setIsEditDialogOpen(false);
      setSelectedTeam(data);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update team",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteTeam = useMutation({
    mutationFn: (teamId: number) => {
      return apiRequest("DELETE", `/api/settings/teams/${teamId}`).then((res) => {
        if (!res.ok) throw new Error("Failed to delete team");
        return res;
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/teams"] });
      toast({
        title: "Team deleted",
        description: "Team has been deleted successfully.",
      });
      setSelectedTeam(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete team",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addTeamMember = useMutation({
    mutationFn: (data: { teamId: number; userId: number; role: string }) => {
      return apiRequest("POST", `/api/settings/teams/${data.teamId}/members`, {
        userId: data.userId,
        role: data.role,
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to add team member");
        return res.json();
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/settings/teams/members", selectedTeam?.id],
      });
      toast({
        title: "Member added",
        description: "Team member has been added successfully.",
      });
      setIsAddMemberDialogOpen(false);
      addMemberForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add member",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeTeamMember = useMutation({
    mutationFn: (data: { teamId: number; memberId: number }) => {
      return apiRequest(
        "DELETE",
        `/api/settings/teams/${data.teamId}/members/${data.memberId}`
      ).then((res) => {
        if (!res.ok) throw new Error("Failed to remove team member");
        return res;
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/settings/teams/members", selectedTeam?.id],
      });
      toast({
        title: "Member removed",
        description: "Team member has been removed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to remove member",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form submission handlers
  const onCreateTeamSubmit = (data: z.infer<typeof createTeamSchema>) => {
    createTeam.mutate(data);
  };

  const onEditTeamSubmit = (data: z.infer<typeof updateTeamSchema>) => {
    updateTeam.mutate(data);
  };

  const onAddMemberSubmit = (data: z.infer<typeof addMemberSchema>) => {
    if (!selectedTeam) return;
    addTeamMember.mutate({
      teamId: selectedTeam.id,
      userId: parseInt(data.userId, 10),
      role: data.role,
    });
  };

  const handleDeleteTeam = (team: Team) => {
    if (confirm(`Are you sure you want to delete the team "${team.name}"?`)) {
      deleteTeam.mutate(team.id);
    }
  };

  const handleRemoveMember = (memberId: number) => {
    if (!selectedTeam) return;
    if (confirm("Are you sure you want to remove this member from the team?")) {
      removeTeamMember.mutate({
        teamId: selectedTeam.id,
        memberId,
      });
    }
  };

  const handleSelectTeam = (team: Team) => {
    setSelectedTeam(team);
    refetchTeamMembers();
  };

  const handleEditTeam = (team: Team) => {
    editForm.reset({
      id: team.id,
      name: team.name,
      description: team.description || "",
      isActive: team.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const filteredTeamMembers = teamMembers
    ? teamMembers.filter((member: TeamMember) => {
        if (!teamMemberSearch) return true;
        const search = teamMemberSearch.toLowerCase();
        const firstName = member.user?.firstName?.toLowerCase() || "";
        const lastName = member.user?.lastName?.toLowerCase() || "";
        const fullName = `${firstName} ${lastName}`.trim();
        const username = member.user?.username.toLowerCase() || "";
        const email = member.user?.email.toLowerCase() || "";
        
        return (
          fullName.includes(search) ||
          username.includes(search) ||
          email.includes(search)
        );
      })
    : [];

  // Helper function to get user's full name
  const getUserName = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Team Management</h2>
          <p className="text-muted-foreground mt-2">
            Create and manage teams for better collaboration and resource allocation.
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1">
              <Plus className="h-4 w-4" />
              <span>New Team</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
              <DialogDescription>
                Create a new team to organize users and improve collaboration.
              </DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onCreateTeamSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={createForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Sales Team" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Team responsible for sales activities" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Active</FormLabel>
                        <FormDescription>
                          Inactive teams can't be assigned to entities
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <DialogFooter className="pt-4">
                  <Button type="submit" disabled={createTeam.isPending}>
                    {createTeam.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Team"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Teams List */}
        <div className="md:col-span-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Teams</CardTitle>
              <CardDescription>Select a team to manage its members</CardDescription>
            </CardHeader>
            <CardContent>
              {teamsLoading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : !teams || teams.length === 0 ? (
                <div className="text-center p-4 text-muted-foreground">
                  No teams found. Create your first team to get started.
                </div>
              ) : (
                <div className="space-y-2">
                  {teams.map((team: Team) => (
                    <div
                      key={team.id}
                      className={`p-3 rounded-md cursor-pointer flex justify-between items-center border ${
                        selectedTeam?.id === team.id ? "bg-muted" : ""
                      }`}
                      onClick={() => handleSelectTeam(team)}
                    >
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{team.name}</p>
                          {team.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {team.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center">
                        {!team.isActive && (
                          <Badge variant="outline" className="mr-2">
                            Inactive
                          </Badge>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <circle cx="12" cy="12" r="1" />
                                <circle cx="12" cy="5" r="1" />
                                <circle cx="12" cy="19" r="1" />
                              </svg>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEditTeam(team)}>
                              Edit Team
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTeam(team);
                              }}
                            >
                              Delete Team
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Team Members */}
        <div className="md:col-span-8">
          <Card className="h-full">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>
                    {selectedTeam ? `${selectedTeam.name} Members` : "Team Members"}
                  </CardTitle>
                  <CardDescription>
                    {selectedTeam
                      ? `Manage members in ${selectedTeam.name}`
                      : "Select a team to view its members"}
                  </CardDescription>
                </div>
                {selectedTeam && (
                  <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-1">
                        <UserPlus className="h-4 w-4" />
                        <span>Add Member</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Team Member</DialogTitle>
                        <DialogDescription>
                          Add a new member to {selectedTeam.name}
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...addMemberForm}>
                        <form
                          onSubmit={addMemberForm.handleSubmit(onAddMemberSubmit)}
                          className="space-y-4 pt-4"
                        >
                          <FormField
                            control={addMemberForm.control}
                            name="userId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>User</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a user" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {usersLoading ? (
                                      <SelectItem value="loading" disabled>
                                        Loading users...
                                      </SelectItem>
                                    ) : (
                                      users?.map((user: User) => (
                                        <SelectItem
                                          key={user.id}
                                          value={user.id.toString()}
                                        >
                                          {user.firstName && user.lastName
                                            ? `${user.firstName} ${user.lastName}`
                                            : user.username}{" "}
                                          ({user.email})
                                        </SelectItem>
                                      ))
                                    )}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={addMemberForm.control}
                            name="role"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Role</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Leader">Team Leader</SelectItem>
                                    <SelectItem value="Member">Team Member</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <DialogFooter className="pt-4">
                            <Button
                              type="submit"
                              disabled={addTeamMember.isPending}
                            >
                              {addTeamMember.isPending ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Adding...
                                </>
                              ) : (
                                "Add Member"
                              )}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              {selectedTeam && (
                <div className="relative mt-2">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search members..."
                    className="pl-8"
                    value={teamMemberSearch}
                    onChange={(e) => setTeamMemberSearch(e.target.value)}
                  />
                  {teamMemberSearch && (
                    <button
                      className="absolute right-2 top-2.5"
                      onClick={() => setTeamMemberSearch("")}
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent>
              {!selectedTeam ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No team selected</h3>
                  <p className="text-muted-foreground mt-1">
                    Select a team from the list to manage its members
                  </p>
                </div>
              ) : teamMembersLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : filteredTeamMembers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <User className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No team members found</h3>
                  <p className="text-muted-foreground mt-1">
                    {teamMemberSearch
                      ? "No members match your search criteria"
                      : "This team doesn't have any members yet"}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTeamMembers.map((member: TeamMember) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={member.user?.avatar} />
                              <AvatarFallback>
                                {member.user?.firstName?.[0] || member.user?.username?.[0] || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {member.user?.firstName && member.user?.lastName
                                  ? `${member.user.firstName} ${member.user.lastName}`
                                  : member.user?.username}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {member.user?.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={member.role === "Leader" ? "default" : "outline"}>
                            {member.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(member.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveMember(member.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Team Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
            <DialogDescription>Update team information</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditTeamSubmit)} className="space-y-4 pt-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Sales Team" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Team responsible for sales activities"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Active</FormLabel>
                      <FormDescription>
                        Inactive teams can't be assigned to entities
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4">
                <Button type="submit" disabled={updateTeam.isPending}>
                  {updateTeam.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Team"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}