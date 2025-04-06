import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, User, UserPlus, Trash2, UserCheck } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

type TeamType = {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
};

type UserType = {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  email: string;
  avatar?: string;
  role: string;
};

type AssignmentType = {
  id: number;
  entityType: string;
  entityId: number;
  assignedToType: string;
  assignedToId: number;
  assignedById: number;
  assignedAt: string;
  notes?: string;
};

interface AssignmentManagerProps {
  entityType: string;
  entityId: number;
  entityName: string;
  onAssignmentChange?: () => void;
}

export default function AssignmentManager({
  entityType,
  entityId,
  entityName,
  onAssignmentChange,
}: AssignmentManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [assigneeType, setAssigneeType] = useState<"user" | "team">("user");
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  
  // Fetch current assignments for this entity
  const { data: assignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ["/api/assignments", entityType, entityId],
    queryFn: () => {
      return apiRequest("GET", `/api/assignments/${entityType}/${entityId}`)
        .then(res => res.json());
    }
  });

  // Fetch all users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/users"],
    queryFn: () => {
      return apiRequest("GET", "/api/users")
        .then(res => res.json());
    }
  });

  // Fetch all teams
  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ["/api/settings/teams"],
    queryFn: () => {
      return apiRequest("GET", "/api/settings/teams")
        .then(res => res.json());
    }
  });

  // Create assignment mutation
  const createAssignment = useMutation({
    mutationFn: (data: {
      entityType: string;
      entityId: number;
      assignedToType: string;
      assignedToId: number;
      notes?: string;
    }) => {
      return apiRequest("POST", "/api/assignments", data)
        .then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assignments", entityType, entityId] });
      if (onAssignmentChange) {
        onAssignmentChange();
      }
      toast({
        title: "Assignment created",
        description: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} assigned successfully.`,
      });
      setIsDialogOpen(false);
      setNotes("");
      setSelectedAssigneeId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create assignment",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  });

  // Delete assignment mutation
  const deleteAssignment = useMutation({
    mutationFn: (assignmentId: number) => {
      return apiRequest("DELETE", `/api/assignments/${assignmentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assignments", entityType, entityId] });
      if (onAssignmentChange) {
        onAssignmentChange();
      }
      toast({
        title: "Assignment removed",
        description: `Assignment removed successfully.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to remove assignment",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  });

  const handleAssignSubmit = () => {
    if (!selectedAssigneeId) {
      toast({
        title: "Selection required",
        description: `Please select a ${assigneeType} to assign.`,
        variant: "destructive",
      });
      return;
    }

    createAssignment.mutate({
      entityType,
      entityId,
      assignedToType: assigneeType,
      assignedToId: selectedAssigneeId,
      notes,
    });
  };

  const handleDeleteAssignment = (assignmentId: number) => {
    if (confirm("Are you sure you want to remove this assignment?")) {
      deleteAssignment.mutate(assignmentId);
    }
  };

  // Helper function to get user name
  const getUserName = (userId: number) => {
    if (!users) return "Unknown";
    const user = users.find((u: UserType) => u.id === userId);
    if (!user) return "Unknown";
    return user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.username;
  };

  // Helper function to get team name
  const getTeamName = (teamId: number) => {
    if (!teams) return "Unknown";
    const team = teams.find((t: TeamType) => t.id === teamId);
    return team ? team.name : "Unknown";
  };

  return (
    <div className="mb-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">Assignments</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1">
                  <UserPlus className="w-4 h-4" />
                  <span>Assign</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign {entityType.charAt(0).toUpperCase() + entityType.slice(1)}</DialogTitle>
                  <DialogDescription>
                    Assign {entityName} to a user or team.
                  </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="user" className="w-full mt-4" onValueChange={(value) => setAssigneeType(value as "user" | "team")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="user">User</TabsTrigger>
                    <TabsTrigger value="team">Team</TabsTrigger>
                  </TabsList>
                  <TabsContent value="user" className="pt-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="user-select">Select User</Label>
                        <Select 
                          onValueChange={(value) => setSelectedAssigneeId(parseInt(value))}
                        >
                          <SelectTrigger id="user-select">
                            <SelectValue placeholder="Select a user" />
                          </SelectTrigger>
                          <SelectContent>
                            {usersLoading ? (
                              <SelectItem value="loading" disabled>
                                Loading users...
                              </SelectItem>
                            ) : (
                              users?.map((user: UserType) => (
                                <SelectItem key={user.id} value={user.id.toString()}>
                                  {user.firstName && user.lastName
                                    ? `${user.firstName} ${user.lastName}`
                                    : user.username}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="team" className="pt-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="team-select">Select Team</Label>
                        <Select
                          onValueChange={(value) => setSelectedAssigneeId(parseInt(value))}
                        >
                          <SelectTrigger id="team-select">
                            <SelectValue placeholder="Select a team" />
                          </SelectTrigger>
                          <SelectContent>
                            {teamsLoading ? (
                              <SelectItem value="loading" disabled>
                                Loading teams...
                              </SelectItem>
                            ) : (
                              teams?.map((team: TeamType) => (
                                <SelectItem key={team.id} value={team.id.toString()}>
                                  {team.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                <div className="space-y-2 mt-4">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add notes about this assignment"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
                <DialogFooter className="mt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAssignSubmit}
                    disabled={!selectedAssigneeId || createAssignment.isPending}
                  >
                    {createAssignment.isPending ? "Assigning..." : "Assign"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <CardDescription>
            Manage who is responsible for this {entityType}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {assignmentsLoading ? (
            <div className="text-center py-4">Loading assignments...</div>
          ) : assignments?.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No assignments yet. Click "Assign" to assign this {entityType} to a user or team.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Assigned By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments?.map((assignment: AssignmentType) => (
                  <TableRow key={assignment.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {assignment.assignedToType === "user" ? (
                          <>
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={users?.find((u: UserType) => u.id === assignment.assignedToId)?.avatar} />
                              <AvatarFallback>
                                {getUserName(assignment.assignedToId).charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{getUserName(assignment.assignedToId)}</span>
                          </>
                        ) : (
                          <>
                            <Users className="h-5 w-5 text-primary" />
                            <span>{getTeamName(assignment.assignedToId)}</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {assignment.assignedToType === "user" ? "User" : "Team"}
                      </Badge>
                    </TableCell>
                    <TableCell>{getUserName(assignment.assignedById)}</TableCell>
                    <TableCell>
                      {new Date(assignment.assignedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteAssignment(assignment.id)}
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
  );
}