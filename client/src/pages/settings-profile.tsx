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
  { id: 'male1', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4&accessories=Kurt,Prescription02,Prescription01,Round&accessoriesProbability=80&clothesColor=a7d&eyes=Default,Side,Cry,Happy,Wink,Hearts,Dizzy&eyebrows=DefaultNatural,SadConcerned,RaisedExcited&facialHair=MoustacheFancy,BeardMedium&facialHairProbability=80&mouth=Smile,Default,Twinkle,Concerned&skinColor=f2d3b1,ecad80,d08b5b,ffcd94,eac086,bf9169' },
  { id: 'male2', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John&backgroundColor=ffdfbf&accessories=Prescription01&accessoriesProbability=80&clothesColor=545454&eyes=Happy,Default&eyebrows=Default,DefaultNatural&facialHair=BeardLight,BeardMagestic&facialHairProbability=90&mouth=Smile,Twinkle&skinColor=f8d25c,ffcd94,eac086,bf9169' },
  { id: 'male3', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Thomas&backgroundColor=d1d4f9&accessories=Blank&accessoriesProbability=0&clothesColor=3c4f5c&eyes=Default,Side&eyebrows=Default,DefaultNatural,RaisedExcited&facialHair=Blank&facialHairProbability=0&mouth=Smile&skinColor=f2d3b1,ecad80,d08b5b' },
  { id: 'female1', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie&backgroundColor=ffd5dc&accessories=Blank&accessoriesProbability=0&clothesColor=ff9000&clothes=ShirtScoopNeck,ShirtCrewNeck&eyes=Default,Happy,Hearts&eyebrows=Default,DefaultNatural,RaisedExcited&facialHair=Blank&facialHairProbability=0&hairColor=a55728,2c1b18,4a312c&mouth=Smile,Default&skinColor=f2d3b1,ecad80,d08b5b,ffcd94,eac086' },
  { id: 'female2', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma&backgroundColor=f0ffb8&accessories=Kurt,Prescription02,Round&accessoriesProbability=30&clothesColor=6bd9e9&clothes=ShirtScoopNeck,ShirtVNeck&eyes=Default,Side,Happy,Wink&eyebrows=DefaultNatural,SadConcerned&facialHair=Blank&facialHairProbability=0&hairColor=a55728,2c1b18,4a312c,6a4f42&mouth=Smile,Default,Twinkle&skinColor=f2d3b1,ecad80,d08b5b' },
  { id: 'female3', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia&backgroundColor=d1f4d2&accessories=Prescription01,Prescription02,Round&accessoriesProbability=40&clothesColor=e0ddff&clothes=ShirtCrewNeck,ShirtScoopNeck,ShirtVNeck&eyes=Default,Happy,Hearts&eyebrows=DefaultNatural,RaisedExcited&facialHair=Blank&facialHairProbability=0&hairColor=2c1b18,4a312c,6a4f42,f59797&mouth=Smile,Default&skinColor=f2d3b1,ecad80,d08b5b,ffcd94' },
  { id: 'professional1', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=b6e3f4&accessories=Kurt,Prescription02,Prescription01,Round&accessoriesProbability=90&clothesColor=3c4f5c&clothes=BlazerShirt,BlazerSweater&eyes=Default,Side&eyebrows=DefaultNatural,SadConcerned,RaisedExcited&facialHair=Blank&facialHairProbability=40&mouth=Smile,Default&skinColor=f2d3b1,ecad80,d08b5b,ffcd94,eac086,bf9169' },
  { id: 'professional2', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Taylor&backgroundColor=d1d4f9&accessories=Prescription01,Prescription02&accessoriesProbability=70&clothesColor=545454&clothes=BlazerShirt,BlazerSweater&eyes=Default,Side,Happy&eyebrows=DefaultNatural&facialHair=Blank&facialHairProbability=10&mouth=Smile,Default&skinColor=f2d3b1,ecad80,d08b5b,ffcd94,eac086' }
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
      const response = await apiRequest("PATCH", `/api/users/${user?.id}`, data);
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
                      <AvatarImage src={formData.avatar} alt={user?.username} className="object-cover" />
                    ) : (
                      <AvatarFallback className="text-2xl bg-primary/10 text-primary font-semibold">
                        {getInitials() || <User className="h-16 w-16" />}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex flex-col space-y-2 w-full">
                    <label htmlFor="avatar-upload" className="w-full">
                      <Button variant="outline" className="w-full cursor-pointer" type="button">
                        <Upload className="mr-2 h-4 w-4" /> Upload Photo
                      </Button>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // Convert to base64 for storage
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              const base64String = reader.result as string;
                              setFormData(prev => ({ ...prev, avatar: base64String }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    
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
                              <AvatarImage src={avatar.url} alt={avatar.id} className="object-cover" />
                              <AvatarFallback>Loading...</AvatarFallback>
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