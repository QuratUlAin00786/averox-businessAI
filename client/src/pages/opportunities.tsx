import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Opportunity, InsertOpportunity } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { OpportunityList } from "@/components/opportunities/opportunity-list";
import { OpportunityForm } from "@/components/opportunities/opportunity-form";
import { OpportunityDetail } from "@/components/opportunities/opportunity-detail";
import { apiRequestJson } from "@/lib/queryClient";
import { Loader2, Plus, RefreshCw } from "lucide-react";

export default function Opportunities() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for dialog visibility
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  
  // Fetch opportunities
  const {
    data: opportunities = [],
    isLoading,
    error,
  } = useQuery<Opportunity[]>({
    queryKey: ["/api/opportunities"],
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to load opportunities: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Create opportunity mutation
  const createOpportunityMutation = useMutation({
    mutationFn: async (data: InsertOpportunity) => {
      return apiRequestJson<Opportunity>("/api/opportunities", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/pipeline"] });
      setIsAddOpen(false);
      toast({
        title: "Success",
        description: "Opportunity created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create opportunity: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update opportunity mutation
  const updateOpportunityMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertOpportunity> }) => {
      return apiRequestJson<Opportunity>(`/api/opportunities/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/pipeline"] });
      setIsEditOpen(false);
      toast({
        title: "Success",
        description: "Opportunity updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update opportunity: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete opportunity mutation
  const deleteOpportunityMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequestJson(`/api/opportunities/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/pipeline"] });
      setIsDeleteOpen(false);
      setSelectedOpportunity(null);
      toast({
        title: "Success",
        description: "Opportunity deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete opportunity: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update opportunity status mutation
  const changeStatusMutation = useMutation({
    mutationFn: async ({ 
      id, 
      data 
    }: { 
      id: number; 
      data: { isClosed: boolean; isWon: boolean } 
    }) => {
      return apiRequestJson<Opportunity>(`/api/opportunities/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/pipeline"] });
      setIsViewOpen(false);
      toast({
        title: "Success",
        description: "Opportunity status updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update opportunity status: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Event handlers
  const handleAddOpportunity = () => {
    setSelectedOpportunity(null);
    setIsAddOpen(true);
  };

  const handleEditOpportunity = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setIsEditOpen(true);
  };

  const handleViewOpportunity = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setIsViewOpen(true);
  };

  const handleDeleteOpportunity = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setIsDeleteOpen(true);
  };

  const handleChangeStatus = (
    opportunity: Opportunity, 
    status: { isClosed: boolean; isWon: boolean }
  ) => {
    changeStatusMutation.mutate({ 
      id: opportunity.id, 
      data: status 
    });
  };

  const handleCreateSubmit = (data: InsertOpportunity) => {
    createOpportunityMutation.mutate(data);
  };

  const handleEditSubmit = (data: Partial<InsertOpportunity>) => {
    if (selectedOpportunity) {
      updateOpportunityMutation.mutate({ id: selectedOpportunity.id, data });
    }
  };

  // Error state
  if (error) {
    return (
      <div className="py-6">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
          <div className="flex flex-col items-center justify-center h-96 bg-white rounded-lg shadow">
            <p className="text-red-600 mb-4">Error loading opportunities</p>
            <Button 
              variant="outline" 
              onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/opportunities'] })}
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
              Opportunities
            </h2>
          </div>
          <div className="flex mt-4 md:mt-0 md:ml-4">
            <Button onClick={handleAddOpportunity}>
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              Add Opportunity
            </Button>
          </div>
        </div>
      </div>
      
      <div className="px-4 mx-auto mt-6 max-w-7xl sm:px-6 md:px-8">
        <OpportunityList
          data={opportunities}
          isLoading={isLoading}
          onEdit={handleEditOpportunity}
          onView={handleViewOpportunity}
          onDelete={handleDeleteOpportunity}
          onChangeStatus={handleChangeStatus}
        />
      </div>

      {/* Add/Edit Opportunity Dialog */}
      <OpportunityForm
        isOpen={isAddOpen || isEditOpen}
        isEditing={isEditOpen}
        opportunity={selectedOpportunity}
        isSubmitting={createOpportunityMutation.isPending || updateOpportunityMutation.isPending}
        onClose={() => {
          setIsAddOpen(false);
          setIsEditOpen(false);
        }}
        onSubmit={isEditOpen ? handleEditSubmit : handleCreateSubmit}
      />

      {/* View Opportunity Dialog */}
      <OpportunityDetail
        isOpen={isViewOpen}
        opportunity={selectedOpportunity}
        onClose={() => setIsViewOpen(false)}
        onEdit={handleEditOpportunity}
        onChangeStatus={handleChangeStatus}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the opportunity "{selectedOpportunity?.name}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedOpportunity && deleteOpportunityMutation.mutate(selectedOpportunity.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteOpportunityMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
