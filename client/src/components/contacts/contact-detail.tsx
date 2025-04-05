import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Contact } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ContactNotes } from "./contact-notes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Mail, MapPin, Phone, Tag, UserRound, X, Building, ArrowLeft } from "lucide-react";
import { CommunicationPanel } from "@/components/communications/communication-panel";

interface ContactDetailProps {
  contactId: number;
  onBack: () => void;
}

export function ContactDetail({ contactId, onBack }: ContactDetailProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [contact, setContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch contact details when the component mounts
  useEffect(() => {
    const fetchContactDetails = () => {
      setIsLoading(true);
      setError(null);
      
      fetch(`/api/contacts/${contactId}`)
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch contact details");
          return res.json();
        })
        .then(data => {
          setContact(data);
          setIsLoading(false);
        })
        .catch(err => {
          setError(err as Error);
          setIsLoading(false);
          console.error("Error fetching contact details:", err);
        });
    };
    
    fetchContactDetails();
  }, [contactId]);

  // Update contact notes mutation
  const updateNotesMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: number; notes: string }) => {
      return apiRequest("PATCH", `/api/contacts/${id}/notes`, { notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      // Refresh contact data after updating notes
      fetch(`/api/contacts/${contactId}`)
        .then(res => res.json())
        .then(updatedContact => {
          setContact(updatedContact);
        });
      
      toast({
        title: "Notes Updated",
        description: "Contact notes have been successfully updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update notes: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Generate initials from name
  const getInitials = (firstName: string | null, lastName: string | null) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`;
  };
  
  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };
  
  const handleSaveNotes = (id: number, notes: string) => {
    updateNotesMutation.mutate({ id, notes });
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center p-8">
        <div className="animate-pulse space-y-2">
          <div className="h-8 w-40 bg-neutral-200 rounded mb-4"></div>
          <div className="h-32 w-full max-w-lg bg-neutral-200 rounded"></div>
          <div className="h-32 w-full max-w-lg bg-neutral-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-500">Error Loading Contact</CardTitle>
          <CardDescription>
            There was a problem loading the contact details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>{error.message}</p>
          <Button onClick={onBack} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Contacts
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Render empty state
  if (!contact) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Contact Not Found</CardTitle>
          <CardDescription>
            The contact you're looking for could not be found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Contacts
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Render contact details
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={onBack} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Contacts
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact Overview Card */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary text-white text-xl">
                    {getInitials(contact.firstName, contact.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">
                    {contact.firstName} {contact.lastName}
                  </CardTitle>
                  <CardDescription>
                    {contact.title ? 
                      <Badge variant="outline" className="mt-1 font-normal">
                        {contact.title}
                      </Badge>
                      : "No title"}
                  </CardDescription>
                  <div className="mt-1">
                    {contact.isActive === false ? (
                      <Badge variant="secondary" className="bg-neutral-200">Inactive</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-neutral-500">Contact Information</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Mail className="h-5 w-5 text-neutral-400 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="overflow-hidden">
                      <span className="block text-sm text-neutral-800 break-words">
                        {contact.email || "No email address"}
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Phone className="h-5 w-5 text-neutral-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="block text-sm text-neutral-800">
                      {contact.phone || "No phone number"}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <MapPin className="h-5 w-5 text-neutral-400 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="text-sm overflow-hidden">
                      {contact.address ? (
                        <div className="space-y-1">
                          <p className="break-words">{contact.address}</p>
                          {contact.city && <p>{contact.city}{contact.state ? `, ${contact.state}` : ''}</p>}
                          {contact.country && <p>{contact.country}</p>}
                        </div>
                      ) : (
                        <span className="text-neutral-600">No address provided</span>
                      )}
                    </div>
                  </li>
                </ul>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-neutral-500">Additional Details</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <UserRound className="h-5 w-5 text-neutral-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="block text-sm text-neutral-800">
                      Created: {formatDate(contact.createdAt)}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Tag className="h-5 w-5 text-neutral-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="block text-sm text-neutral-800">
                      ID: {contact.id}
                    </span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Notes and History Section */}
        <div className="md:col-span-2">
          <Tabs defaultValue="notes">
            <TabsList className="mb-4">
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="communications">Communications</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
              <TabsTrigger value="related">Related Records</TabsTrigger>
            </TabsList>
            
            <TabsContent value="notes">
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                  <CardDescription>
                    Record important details about this contact
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ContactNotes 
                    contact={contact}
                    onSaveNotes={handleSaveNotes}
                    isSubmittingNotes={updateNotesMutation.isPending}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="communications">
              <CommunicationPanel 
                contactId={contact.id}
                contactType="customer"
                contactName={`${contact.firstName} ${contact.lastName}`}
                email={contact.email || ""}
                phone={contact.phone || ""}
              />
            </TabsContent>
            
            <TabsContent value="activities">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                  <CardDescription>
                    History of activities with this contact
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="py-6 text-center text-neutral-500">
                    <CalendarDays className="mx-auto h-12 w-12 text-neutral-300" />
                    <p className="mt-3">No activities recorded yet</p>
                    <Button variant="outline" className="mt-4">
                      Add New Activity
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="related">
              <Card>
                <CardHeader>
                  <CardTitle>Related Records</CardTitle>
                  <CardDescription>
                    Other records related to this contact
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="py-6 text-center text-neutral-500">
                    <Building className="mx-auto h-12 w-12 text-neutral-300" />
                    <p className="mt-3">No related records found</p>
                    <div className="flex justify-center mt-4 space-x-3">
                      <Button variant="outline">
                        Link to Account
                      </Button>
                      <Button variant="outline">
                        Create Opportunity
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}