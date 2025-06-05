import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Lead, InsertLead } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { LeadList } from "@/components/leads/lead-list";
import { LeadForm } from "@/components/leads/lead-form";
import { LeadDetail } from "@/components/leads/lead-detail";
import { LeadConvertForm } from "@/components/leads/lead-convert-form";
import { apiRequestJson } from "@/lib/queryClient";
import { Loader2, Plus, RefreshCw, Trash2 } from "lucide-react";

export default function Leads() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for dialog visibility
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isConvertOpen, setIsConvertOpen] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  
  // Fetch leads
  const {
    data: leads = [],
    isLoading,
    error,
  } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });

  // Handle query error
  if (error) {
    toast({
      title: "Error",
      description: `Failed to load leads: ${error.message}`,
      variant: "destructive",
    });
  }

  // Create lead mutation
  const createLeadMutation = useMutation({
    mutationFn: async (data: InsertLead) => {
      return apiRequestJson<Lead>("POST", "/api/leads", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      setIsAddOpen(false);
      toast({
        title: "Success",
        description: "Lead created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create lead: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update lead mutation
  const updateLeadMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertLead> }) => {
      return apiRequestJson<Lead>("PATCH", `/api/leads/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      setIsEditOpen(false);
      toast({
        title: "Success",
        description: "Lead updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update lead: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete lead mutation
  const deleteLeadMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequestJson("DELETE", `/api/leads/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      setIsDeleteOpen(false);
      setSelectedLead(null);
      toast({
        title: "Success",
        description: "Lead deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete lead: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Convert lead mutation
  const convertLeadMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequestJson("POST", `/api/leads/${id}/convert`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities"] });
      setIsConvertOpen(false);
      setSelectedLead(null);
      toast({
        title: "Success",
        description: "Lead converted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to convert lead: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Event handlers
  const handleAddLead = () => {
    setSelectedLead(null);
    setIsAddOpen(true);
  };

  const handleEditLead = (lead: Lead) => {
    setSelectedLead(lead);
    setIsEditOpen(true);
  };

  const handleViewLead = (lead: Lead) => {
    setSelectedLead(lead);
    setIsViewOpen(true);
  };

  const handleDeleteLead = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDeleteOpen(true);
  };

  const handleConvertLead = (lead: Lead) => {
    setSelectedLead(lead);
    setIsConvertOpen(true);
  };

  const handleCreateSubmit = (data: InsertLead) => {
    createLeadMutation.mutate(data);
  };

  const handleEditSubmit = (data: Partial<InsertLead>) => {
    if (selectedLead) {
      updateLeadMutation.mutate({ id: selectedLead.id, data });
    }
  };

  const handleConvertSubmit = (data: any) => {
    if (selectedLead) {
      convertLeadMutation.mutate({ id: selectedLead.id, data });
    }
  };

  const handleBulkDelete = () => {
    // For simplicity, delete all leads visible on current page
    if (leads.length > 0) {
      // Delete all leads one by one
      leads.forEach(lead => {
        deleteLeadMutation.mutate(lead.id);
      });
      setShowBulkDeleteDialog(false);
    }
  };

  // Error state
  if (error) {
    return (
      <div className="py-6">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
          <div className="flex flex-col items-center justify-center h-96 bg-white rounded-lg shadow">
            <p className="text-red-600 mb-4">Error loading leads</p>
            <Button 
              variant="outline" 
              onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/leads'] })}
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-neutral-600 sm:text-3xl sm:truncate">
              Leads
            </h2>
          </div>
          <div className="flex mt-4 md:mt-0 md:ml-4 space-x-2">
            <Button variant="outline" onClick={() => setShowBulkDeleteDialog(true)}>
              <Trash2 className="-ml-1 mr-2 h-5 w-5" />
              Delete Leads
            </Button>
            <Button onClick={handleAddLead}>
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              Add Lead
            </Button>
          </div>
        </div>
      </div>
      
      <div className="px-4 mx-auto mt-6 max-w-7xl sm:px-6 md:px-8">
        <LeadList
          data={leads}
          isLoading={isLoading}
          onEdit={handleEditLead}
          onView={handleViewLead}
          onDelete={handleDeleteLead}
          onConvert={handleConvertLead}
        />
      </div>

      {/* Add/Edit Lead Dialog */}
      <LeadForm
        isOpen={isAddOpen || isEditOpen}
        isEditing={isEditOpen}
        lead={selectedLead}
        isSubmitting={createLeadMutation.isPending || updateLeadMutation.isPending}
        onClose={() => {
          setIsAddOpen(false);
          setIsEditOpen(false);
        }}
        onSubmit={isEditOpen ? handleEditSubmit : handleCreateSubmit}
      />

      {/* View Lead Dialog */}
      <LeadDetail
        isOpen={isViewOpen}
        lead={selectedLead}
        onClose={() => setIsViewOpen(false)}
        onEdit={handleEditLead}
        onConvert={handleConvertLead}
      />

      {/* Convert Lead Dialog */}
      <LeadConvertForm
        isOpen={isConvertOpen}
        lead={selectedLead}
        isSubmitting={convertLeadMutation.isPending}
        onClose={() => setIsConvertOpen(false)}
        onSubmit={handleConvertSubmit}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the lead "{selectedLead?.firstName} {selectedLead?.lastName}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedLead) {
                  deleteLeadMutation.mutate(selectedLead.id);
                  setIsDeleteOpen(false);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteLeadMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Dialog */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete All Leads</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all {leads.length} leads currently displayed.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteLeadMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
