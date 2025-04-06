import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Save, Upload, User, Check } from "lucide-react";
import { Link } from "wouter";
import { 
  Dialog,
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";

// Predefined avatars for users to select from
const predefinedAvatars = [
  // Male avatars
  { 
    id: 'male1', 
    url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48ZyBmaWxsPSIjMkE0MTYyIj48Y2lyY2xlIGN4PSIyNTYiIGN5PSIxMTIiIHI9IjExMiIvPjxwYXRoIGQ9Ik0zODQgMzEyYzAtMzUuMzQ3LTI4LjY1My02NC02NC02NGgtOTZoLTk2Yy0zNS4zNDcgMC02NCAyOC42NTMtNjQgNjR2NDhoMzIwdi00OHoiLz48cGF0aCBkPSJNMzg0IDM2MEwxMjggMzYwIDEyOCA1MTIgMzg0IDUxMnoiLz48L2c+PC9zdmc+',
    gender: 'male'
  },
  { 
    id: 'male2', 
    url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48Y2lyY2xlIGZpbGw9IiMzNDk4REIiIGN4PSIyNTYiIGN5PSIxMTIiIHI9IjExMiIvPjxwYXRoIGZpbGw9IiMyNDgwQjkiIGQ9Ik0zODQgMzEyYzAtMzUuMzQ3LTI4LjY1My02NC02NC02NGgtOTZoLTk2Yy0zNS4zNDcgMC02NCAyOC42NTMtNjQgNjR2NDhoMzIwdi00OHoiLz48cGF0aCBmaWxsPSIjMzQ5OERCIiBkPSJNMzg0IDM2MEwxMjggMzYwIDEyOCA1MTIgMzg0IDUxMnoiLz48L3N2Zz4=',
    gender: 'male'
  },
  { 
    id: 'male3', 
    url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48Y2lyY2xlIGZpbGw9IiNFNkU3RTgiIGN4PSIyNTYiIGN5PSIxMTIiIHI9IjExMiIvPjxwYXRoIGZpbGw9IiM1NUJGQ0IiIGQ9Ik0zODQgMzEyYzAtMzUuMzQ3LTI4LjY1My02NC02NC02NGgtOTZoLTk2Yy0zNS4zNDcgMC02NCAyOC42NTMtNjQgNjR2NDhoMzIwdi00OHoiLz48cGF0aCBmaWxsPSIjNDU5N0I1IiBkPSJNMzg0IDM2MEwxMjggMzYwIDEyOCA1MTIgMzg0IDUxMnoiLz48L3N2Zz4=',
    gender: 'male'
  },
  { 
    id: 'male4', 
    url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48Y2lyY2xlIGZpbGw9IiNGRkREQTkiIGN4PSIyNTYiIGN5PSIxMTIiIHI9IjExMiIvPjxwYXRoIGZpbGw9IiM1MkM0MUEiIGQ9Ik0zODQgMzEyYzAtMzUuMzQ3LTI4LjY1My02NC02NC02NGgtOTZoLTk2Yy0zNS4zNDcgMC02NCAyOC42NTMtNjQgNjR2NDhoMzIwdi00OHoiLz48cGF0aCBmaWxsPSIjNDJBMzA2IiBkPSJNMzg0IDM2MEwxMjggMzYwIDEyOCA1MTIgMzg0IDUxMnoiLz48L3N2Zz4=',
    gender: 'male'
  },
  
  // Female avatars
  { 
    id: 'female1', 
    url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48Y2lyY2xlIGZpbGw9IiNGRkREQTkiIGN4PSIyNTYiIGN5PSIxMTIiIHI9IjExMiIvPjxwYXRoIGZpbGw9IiNGRjc5QzYiIGQ9Ik0xNzYgNDIzYy0xNS40NjQgMC0zMi000LjA1NS00OC0xMmwzMi02MGMxNi0yMCAxNi0yMCAzMi0yMHMxNiAwIDMyIDIwbDMyIDYwYy0xNiA3Ljk0NS0zMi41MzYgMTItNDggMTJoLTMyeiIvPjxwYXRoIGZpbGw9IiNGODU2OEEiIGQ9Ik0zNjggMzQwYzAtNjEuODU2LTUwLjE0NC0xMTItMTEyLTExMlMxNDQgMjc4LjE0NCAxNDQgMzQwdjMyaDE1LjU4bDQ4LTMySDMwNGw0OCAzMkgzNjh2LTMyeiIvPjxwYXRoIGZpbGw9IiNGRjc5QzYiIGQ9Ik0zMDQgMzQwdjE3MmgtOTZ2LTE3MnoiLz48L3N2Zz4=',
    gender: 'female'
  },
  { 
    id: 'female2', 
    url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48Y2lyY2xlIGZpbGw9IiNGRkREQTkiIGN4PSIyNTYiIGN5PSIxMTIiIHI9IjExMiIvPjxwYXRoIGZpbGw9IiM3RjRBODgiIGQ9Ik0zNjggMzQwYzAtNjEuODU2LTUwLjE0NC0xMTItMTEyLTExMlMxNDQgMjc4LjE0NCAxNDQgMzQwdjMyaDE1LjU4bDQ4LTMySDMwNGw0OCAzMkgzNjh2LTMyeiIvPjxwYXRoIGZpbGw9IiM5RjU4QTkiIGQ9Ik0zMDQgMzQwdjE3MmgtOTZ2LTE3MnoiLz48cGF0aCBmaWxsPSIjN0Y0QTg4IiBkPSJNMTc2IDQyM2MtMTUuNDY0IDAtMzItNC4wNTUtNDgtMTJsMzItNjBjMTYtMjAgMTYtMjAgMzItMjBzMTYgMCAzMiAyMGwzMiA2MGMtMTYgNy45NDUtMzIuNTM2IDEyLTQ4IDEyaC0zMnoiLz48L3N2Zz4=',
    gender: 'female'
  },
  { 
    id: 'female3', 
    url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48Y2lyY2xlIGZpbGw9IiNGRkREQTkiIGN4PSIyNTYiIGN5PSIxMTIiIHI9IjExMiIvPjxwYXRoIGZpbGw9IiMzNEE4QzIiIGQ9Ik0zNjggMzQwYzAtNjEuODU2LTUwLjE0NC0xMTItMTEyLTExMlMxNDQgMjc4LjE0NCAxNDQgMzQwdjMyaDE1LjU4bDQ4LTMySDMwNGw0OCAzMkgzNjh2LTMyeiIvPjxwYXRoIGZpbGw9IiMzMEQ0RkIiIGQ9Ik0zMDQgMzQwdjE3MmgtOTZ2LTE3MnoiLz48cGF0aCBmaWxsPSIjMzRBOEMyIiBkPSJNMTc2IDQyM2MtMTUuNDY0IDAtMzItNC4wNTUtNDgtMTJsMzItNjBjMTYtMjAgMTYtMjAgMzItMjBzMTYgMCAzMiAyMGwzMiA2MGMtMTYgNy45NDUtMzIuNTM2IDEyLTQ4IDEyaC0zMnoiLz48L3N2Zz4=',
    gender: 'female'
  },
  { 
    id: 'female4', 
    url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48Y2lyY2xlIGZpbGw9IiNGRkREQTkiIGN4PSIyNTYiIGN5PSIxMTIiIHI9IjExMiIvPjxwYXRoIGZpbGw9IiNGNTM5MkYiIGQ9Ik0zNjggMzQwYzAtNjEuODU2LTUwLjE0NC0xMTItMTEyLTExMlMxNDQgMjc4LjE0NCAxNDQgMzQwdjMyaDE1LjU4bDQ4LTMySDMwNGw0OCAzMkgzNjh2LTMyeiIvPjxwYXRoIGZpbGw9IiNGRjUwNUQiIGQ9Ik0zMDQgMzQwdjE3MmgtOTZ2LTE3MnoiLz48cGF0aCBmaWxsPSIjRjUzOTJGIiBkPSJNMTc2IDQyM2MtMTUuNDY0IDAtMzItNC4wNTUtNDgtMTJsMzItNjBjMTYtMjAgMTYtMjAgMzItMjBzMTYgMCAzMiAyMGwzMiA2MGMtMTYgNy45NDUtMzIuNTM2IDEyLTQ4IDEyaC0zMnoiLz48L3N2Zz4=',
    gender: 'female'
  }
];

export default function SettingsProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    avatar: "",
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  // State for avatar selection dialog
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        company: user.company || "",
        avatar: user.avatar || "",
      });
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      console.log('Submitting profile data:', data);
      // Use the special profile endpoint that can handle large base64 images
      const response = await apiRequest("POST", `/api/profile`, data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      console.error('Profile update error:', error);
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: { newPassword: string }) => {
      const response = await apiRequest("PATCH", `/api/users/${user?.id}/password`, data);
      return response.json();
    },
    onSuccess: () => {
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Password Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation do not match.",
        variant: "destructive",
      });
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }
    
    updatePasswordMutation.mutate({ newPassword: passwordData.newPassword });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  // Get initials for avatar fallback
  const getInitials = () => {
    const first = formData.firstName.charAt(0);
    const last = formData.lastName.charAt(0);
    return first + last;
  };

  return (
    <div className="py-6">
      <div className="px-4 mx-auto max-w-4xl sm:px-6 md:px-8">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-2">
              <Link href="/settings">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h2 className="text-2xl font-bold leading-7 text-neutral-600 sm:text-3xl sm:truncate">
                Profile Settings
              </h2>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-32 w-32 border-4 border-primary">
                    {formData.avatar ? (
                      // Any avatar (from predefined set or uploaded)
                      <AvatarImage src={formData.avatar} alt={user?.username} className="object-cover" />
                    ) : (
                      // Default avatar if none is selected
                      <AvatarFallback className="text-2xl bg-primary/10 text-primary font-semibold">
                        {getInitials() || <User className="h-16 w-16" />}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex flex-col space-y-2 w-full">
                    <div className="w-full">
                      <Button 
                        variant="outline" 
                        className="w-full cursor-pointer" 
                        type="button"
                        onClick={() => {
                          // Create a temporary file input and click it
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          
                          input.onchange = (e) => {
                            try {
                              const files = (e.target as HTMLInputElement).files;
                              if (files && files.length > 0) {
                                const file = files[0];
                                
                                // Check file size (limit to 5MB)
                                if (file.size > 5 * 1024 * 1024) {
                                  toast({
                                    title: "File too large",
                                    description: "Please select an image under 5MB",
                                    variant: "destructive"
                                  });
                                  return;
                                }
                                
                                // Show loading toast
                                toast({
                                  title: "Processing image",
                                  description: "Please wait while we process your image...",
                                });
                                
                                // Convert to base64 for storage
                                const reader = new FileReader();
                                
                                reader.onload = () => {
                                  try {
                                    const base64String = reader.result as string;
                                    
                                    // Ensure we got a valid result
                                    if (!base64String || typeof base64String !== 'string') {
                                      throw new Error('Invalid image data received');
                                    }
                                    
                                    setFormData(prev => ({ ...prev, avatar: base64String }));
                                    
                                    toast({
                                      title: "Image uploaded",
                                      description: "Don't forget to click 'Save Changes' to apply!",
                                    });
                                  } catch (error) {
                                    console.error("Error setting image:", error);
                                    toast({
                                      title: "Upload failed",
                                      description: "There was a problem processing your image.",
                                      variant: "destructive"
                                    });
                                  }
                                };
                                
                                reader.onerror = () => {
                                  toast({
                                    title: "Upload failed",
                                    description: "There was a problem reading your image.",
                                    variant: "destructive"
                                  });
                                };
                                
                                // Start reading the file
                                reader.readAsDataURL(file);
                              }
                            } catch (error) {
                              console.error("File upload error:", error);
                              toast({
                                title: "Upload failed",
                                description: "There was a problem with the file upload.",
                                variant: "destructive"
                              });
                            }
                          };
                          
                          // Trigger the file selection dialog
                          input.click();
                        }}
                      >
                        <Upload className="mr-2 h-4 w-4" /> Upload Photo
                      </Button>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setIsAvatarDialogOpen(true)}
                    >
                      <User className="mr-2 h-4 w-4" /> Select Avatar
                    </Button>
                  </div>
                  
                  {/* Avatar Selection Dialog */}
                  <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle>Choose an Avatar</DialogTitle>
                        <DialogDescription>
                          Select one of the pre-defined avatars for your profile
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
                        {predefinedAvatars.map((avatar) => (
                          <div 
                            key={avatar.id} 
                            className={`relative cursor-pointer rounded-md border-2 p-3 transition-all hover:shadow-md ${
                              formData.avatar === avatar.url 
                                ? 'border-primary bg-primary/10 shadow-md' 
                                : 'border-neutral-200 hover:border-primary/50'
                            }`}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, avatar: avatar.url }));
                            }}
                          >
                            <Avatar className="h-24 w-24 mx-auto border-2 border-transparent">
                              <AvatarImage src={avatar.url} alt={`${avatar.gender} avatar`} className="object-cover" />
                            </Avatar>
                            
                            {formData.avatar === avatar.url && (
                              <div className="absolute -top-2 -right-2 bg-primary text-white rounded-full p-1 shadow-md ring-2 ring-white">
                                <Check className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex justify-between">
                        <Button 
                          variant="outline" 
                          onClick={() => setIsAvatarDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={() => {
                            setIsAvatarDialogOpen(false);
                            toast({
                              title: "Avatar Selected",
                              description: "Don't forget to save your changes!",
                            });
                          }}
                        >
                          Use Selected Avatar
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="flex-1">
                  <Tabs defaultValue="info">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="info">Personal Info</TabsTrigger>
                      <TabsTrigger value="password">Password</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="info" className="mt-4">
                      <form onSubmit={handleProfileSubmit}>
                        <div className="grid gap-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="firstName">First name</Label>
                              <Input
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                placeholder="Your first name"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="lastName">Last name</Label>
                              <Input
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                placeholder="Your last name"
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="email">Email address</Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              placeholder="Your email address"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="company">Company</Label>
                            <Input
                              id="company"
                              name="company"
                              value={formData.company || ""}
                              onChange={handleInputChange}
                              placeholder="Your company name"
                            />
                          </div>
                          
                          <Separator />
                          
                          <Button 
                            type="submit" 
                            disabled={updateProfileMutation.isPending}
                          >
                            <Save className="mr-2 h-4 w-4" />
                            {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                          </Button>
                        </div>
                      </form>
                    </TabsContent>
                    
                    <TabsContent value="password" className="mt-4">
                      <form onSubmit={handlePasswordSubmit}>
                        <div className="grid gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="currentPassword">Current password</Label>
                            <Input
                              id="currentPassword"
                              name="currentPassword"
                              type="password"
                              value={passwordData.currentPassword}
                              onChange={handlePasswordChange}
                              placeholder="Enter your current password"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="newPassword">New password</Label>
                            <Input
                              id="newPassword"
                              name="newPassword"
                              type="password"
                              value={passwordData.newPassword}
                              onChange={handlePasswordChange}
                              placeholder="Enter new password"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm password</Label>
                            <Input
                              id="confirmPassword"
                              name="confirmPassword"
                              type="password"
                              value={passwordData.confirmPassword}
                              onChange={handlePasswordChange}
                              placeholder="Confirm new password"
                            />
                          </div>
                          
                          <Separator />
                          
                          <Button 
                            type="submit" 
                            disabled={updatePasswordMutation.isPending}
                          >
                            <Save className="mr-2 h-4 w-4" />
                            {updatePasswordMutation.isPending ? "Updating..." : "Update Password"}
                          </Button>
                        </div>
                      </form>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}