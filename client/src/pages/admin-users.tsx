import { useState } from "react";
import { useEnhancedToast } from "@/hooks/use-enhanced-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Pencil, Trash2, Ban, Check } from "lucide-react";
import { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from 'date-fns';

// User form type
type UserFormData = {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  avatar?: string;
}

export default function AdminUsersPage() {
  const { success, error } = useEnhancedToast();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentUser2Edit, setCurrentUser2Edit] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    password: '',
    email: '',
    firstName: '',
    lastName: '',
    role: 'User',
    isActive: true,
    avatar: ''
  });
  
  // Load users
  const { data: users, isLoading } = useQuery({
    queryKey: ['/api/users'],
  });
  
  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      const response = await apiRequest('POST', '/api/users', data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setIsDialogOpen(false);
      success({
        title: "User Created",
        description: "The user was created successfully",
        hasCloseButton: true,
      });
    },
    onError: (error: any) => {
      error({
        title: "Error Creating User",
        description: error.message || "Something went wrong during user creation",
        hasCloseButton: true,
        hasCopyButton: true,
      });
    }
  });
  
  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: UserFormData & { id: number }) => {
      const payload = { ...data };
      
      // Only send password if it's not empty (for updates)
      if (currentUser2Edit && !payload.password) {
        delete payload.password;
      }
      
      const response = await apiRequest('PATCH', `/api/users/${data.id}`, payload);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setIsDialogOpen(false);
      success({
        title: "User Updated",
        description: "The user was updated successfully",
        hasCloseButton: true,
      });
    },
    onError: (error: any) => {
      error({
        title: "Error Updating User",
        description: error.message || "Something went wrong during user update",
        hasCloseButton: true,
        hasCopyButton: true,
      });
    }
  });
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/users/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setIsDeleteDialogOpen(false);
      success({
        title: "User Deleted",
        description: "The user was deleted successfully",
        hasCloseButton: true,
      });
    },
    onError: (error: any) => {
      error({
        title: "Error Deleting User",
        description: error.message || "Something went wrong during user deletion",
        hasCloseButton: true,
        hasCopyButton: true,
      });
    }
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isActive: checked }));
  };
  
  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ ...prev, role: value }));
  };
  
  const handleSubmit = () => {
    if (currentUser2Edit?.id) {
      updateMutation.mutate({ ...formData, id: currentUser2Edit.id });
    } else {
      createMutation.mutate(formData);
    }
  };
  
  const openEditDialog = (user: User) => {
    setCurrentUser2Edit(user);
    
    setFormData({
      username: user.username,
      password: '', // Don't populate password for security
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: user.role || 'User',
      isActive: user.isActive === true,
      avatar: user.avatar || ''
    });
    
    setIsDialogOpen(true);
  };
  
  const openCreateDialog = () => {
    setCurrentUser2Edit(null);
    setFormData({
      username: '',
      password: '',
      email: '',
      firstName: '',
      lastName: '',
      role: 'User',
      isActive: true,
      avatar: ''
    });
    setIsDialogOpen(true);
  };
  
  const confirmDelete = (user: User) => {
    setCurrentUser2Edit(user);
    setIsDeleteDialogOpen(true);
  };
  
  const getInitials = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    }
    return user.username[0].toUpperCase();
  };
  
  // Format date as a string or return empty string if null
  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return format(new Date(date), 'MMM d, yyyy');
  };
  
  // Check if user is admin
  if (currentUser?.role !== 'Admin') {
    return (
      <div className="container max-w-6xl py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Admin Access Required</h1>
        <p className="text-muted-foreground">
          You need administrator privileges to access this page.
        </p>
      </div>
    );
  }
  
  return (
    <div className="container max-w-6xl py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center my-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user: User) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar || ""} alt={user.username} />
                          <AvatarFallback>{getInitials(user)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.firstName && user.lastName 
                            ? `${user.firstName} ${user.lastName}`
                            : user.username
                          }</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{user.role || 'User'}</div>
                    </TableCell>
                    <TableCell>
                      {user.isActive === true ? (
                        <div className="flex items-center">
                          <Check className="mr-1 h-4 w-4 text-green-500" />
                          <span>Active</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Ban className="mr-1 h-4 w-4 text-red-500" />
                          <span>Inactive</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => openEditDialog(user)}
                          className="h-8 px-2"
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="ml-2">Edit</span>
                        </Button>
                        {currentUser.id !== user.id && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => confirmDelete(user)}
                            className="h-8 px-2 text-destructive border-destructive hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="ml-2">Delete</span>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{currentUser2Edit ? 'Edit User' : 'Create New User'}</DialogTitle>
            <DialogDescription>
              {currentUser2Edit 
                ? 'Update the user details below' 
                : 'Fill in the details for the new user'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                name="username" 
                value={formData.username} 
                onChange={handleInputChange} 
                placeholder="username"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email"
                value={formData.email} 
                onChange={handleInputChange} 
                placeholder="email@example.com"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName" 
                  name="firstName" 
                  value={formData.firstName} 
                  onChange={handleInputChange} 
                  placeholder="First name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  name="lastName" 
                  value={formData.lastName} 
                  onChange={handleInputChange} 
                  placeholder="Last name"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">
                {currentUser2Edit ? 'New Password (leave blank to keep current)' : 'Password'}
              </Label>
              <Input 
                id="password" 
                name="password" 
                type="password"
                value={formData.password} 
                onChange={handleInputChange} 
                placeholder={currentUser2Edit ? "••••••••" : "Password"}
                required={!currentUser2Edit}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="avatar">Avatar URL (optional)</Label>
              <Input 
                id="avatar" 
                name="avatar" 
                value={formData.avatar} 
                onChange={handleInputChange} 
                placeholder="https://example.com/avatar.png"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={handleRoleChange}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="User">User</SelectItem>
                  <SelectItem value="Admin">Administrator</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="isActive" 
                checked={formData.isActive}
                onCheckedChange={handleSwitchChange}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {currentUser2Edit ? 'Update User' : 'Create User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete user "{currentUser2Edit?.username}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={() => currentUser2Edit?.id && deleteMutation.mutate(currentUser2Edit.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}