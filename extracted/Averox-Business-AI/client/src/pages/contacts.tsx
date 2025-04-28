import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Contact, insertContactSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { ContactList } from "@/components/contacts/contact-list";
import { ContactForm } from "@/components/contacts/contact-form";
import { ContactDetail } from "@/components/contacts/contact-detail";
import { DeleteContactDialog } from "@/components/contacts/delete-contact-dialog";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

export default function Contacts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // State for contact form
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  
  // State for delete dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
  
  // State for detail view
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
  const [contactToView, setContactToView] = useState<number | null>(null);

  // Fetch contacts query
  const {
    data: contacts = [],
    isLoading,
    error,
  } = useQuery<Contact[], Error>({
    queryKey: ["/api/contacts"],
    select: (data: Contact[]) => {
      console.log("Processing contacts data:", data);
      return data.sort((a, b) => {
        // Sort by creation date, newest first
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
    },
  });

  // Create contact mutation
  const createContactMutation = useMutation({
    mutationFn: async (contact: z.infer<typeof insertContactSchema>) => {
      return apiRequest("POST", "/api/contacts", contact);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      setIsContactFormOpen(false);
      setSelectedContact(null);
      toast({
        title: "Contact created",
        description: "The contact has been successfully created.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create contact: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update contact mutation
  const updateContactMutation = useMutation({
    mutationFn: async ({ id, contact }: { id: number; contact: z.infer<typeof insertContactSchema> }) => {
      return apiRequest("PUT", `/api/contacts/${id}`, contact);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      setIsContactFormOpen(false);
      setSelectedContact(null);
      setIsEditing(false);
      toast({
        title: "Contact updated",
        description: "The contact has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update contact: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete contact mutation
  const deleteContactMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/contacts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      setIsDeleteDialogOpen(false);
      setContactToDelete(null);
      toast({
        title: "Contact deleted",
        description: "The contact has been successfully deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete contact: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Form handlers
  const handleAddContact = () => {
    setSelectedContact(null);
    setIsEditing(false);
    setIsContactFormOpen(true);
  };

  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact);
    setIsEditing(true);
    setIsContactFormOpen(true);
  };

  const handleDeleteContact = (contactId: number) => {
    const contact = contacts.find((c) => c.id === contactId);
    if (contact) {
      setContactToDelete(contact);
      setIsDeleteDialogOpen(true);
    }
  };

  const handleContactFormSubmit = (values: z.infer<typeof insertContactSchema>) => {
    if (isEditing && selectedContact) {
      updateContactMutation.mutate({ id: selectedContact.id, contact: values });
    } else {
      createContactMutation.mutate(values);
    }
  };

  const handleConfirmDelete = () => {
    if (contactToDelete) {
      deleteContactMutation.mutate(contactToDelete.id);
    }
  };
  
  // Handle viewing contact details
  const handleViewContact = (contact: Contact) => {
    setContactToView(contact.id);
    setIsDetailViewOpen(true);
  };
  
  const handleCloseDetailView = () => {
    setIsDetailViewOpen(false);
    setContactToView(null);
  };

  return (
    <div className="py-6">
      {isDetailViewOpen && contactToView ? (
        <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
          <ContactDetail 
            contactId={contactToView}
            onBack={handleCloseDetailView}
          />
        </div>
      ) : (
        <>
          <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
            <div className="mb-6 pb-5 border-b border-neutral-200">
              <h1 className="text-2xl font-bold text-neutral-700">Contacts</h1>
              <p className="mt-1 text-sm text-neutral-500">
                Manage your contacts and keep track of your relationships.
              </p>
            </div>
          </div>
          
          <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-100">
              <ContactList
                contacts={contacts}
                isLoading={isLoading}
                error={error as Error}
                onEdit={handleEditContact}
                onDelete={handleDeleteContact}
                onAdd={handleAddContact}
                onView={handleViewContact}
              />
            </div>
          </div>
        </>
      )}

      {/* Contact Form Dialog */}
      <ContactForm
        isOpen={isContactFormOpen}
        isEditing={isEditing}
        contact={selectedContact}
        isSubmitting={createContactMutation.isPending || updateContactMutation.isPending}
        onClose={() => setIsContactFormOpen(false)}
        onSubmit={handleContactFormSubmit}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteContactDialog
        contact={contactToDelete}
        isOpen={isDeleteDialogOpen}
        isDeleting={deleteContactMutation.isPending}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
