import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Account, insertAccountSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { AccountList } from "@/components/accounts/account-list";
import { AccountForm } from "@/components/accounts/account-form";
import { DeleteAccountDialog } from "@/components/accounts/delete-account-dialog";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

export default function Accounts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // State for account form
  const [isAccountFormOpen, setIsAccountFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  
  // State for delete dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);

  // Fetch accounts query
  const {
    data: accounts = [],
    isLoading,
    error,
  } = useQuery<Account[], Error>({
    queryKey: ["/api/accounts"],
    select: (data: Account[]) => {
      return data.sort((a, b) => {
        // Sort by name alphabetically
        return (a.name || "").localeCompare(b.name || "");
      });
    },
  });

  // Create account mutation
  const createAccountMutation = useMutation({
    mutationFn: async (account: z.infer<typeof insertAccountSchema>) => {
      return apiRequest("POST", "/api/accounts", account);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      setIsAccountFormOpen(false);
      setSelectedAccount(null);
      toast({
        title: "Account created",
        description: "The account has been successfully created.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create account: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update account mutation
  const updateAccountMutation = useMutation({
    mutationFn: async ({ id, account }: { id: number; account: z.infer<typeof insertAccountSchema> }) => {
      return apiRequest("PUT", `/api/accounts/${id}`, account);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      setIsAccountFormOpen(false);
      setSelectedAccount(null);
      setIsEditing(false);
      toast({
        title: "Account updated",
        description: "The account has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update account: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/accounts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      setIsDeleteDialogOpen(false);
      setAccountToDelete(null);
      toast({
        title: "Account deleted",
        description: "The account has been successfully deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete account: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Form handlers
  const handleAddAccount = () => {
    setSelectedAccount(null);
    setIsEditing(false);
    setIsAccountFormOpen(true);
  };

  const handleEditAccount = (account: Account) => {
    setSelectedAccount(account);
    setIsEditing(true);
    setIsAccountFormOpen(true);
  };

  const handleDeleteAccount = (accountId: number) => {
    const account = accounts.find((c) => c.id === accountId);
    if (account) {
      setAccountToDelete(account);
      setIsDeleteDialogOpen(true);
    }
  };

  const handleAccountFormSubmit = (values: z.infer<typeof insertAccountSchema>) => {
    if (isEditing && selectedAccount) {
      updateAccountMutation.mutate({ id: selectedAccount.id, account: values });
    } else {
      createAccountMutation.mutate(values);
    }
  };

  const handleConfirmDelete = () => {
    if (accountToDelete) {
      deleteAccountMutation.mutate(accountToDelete.id);
    }
  };

  // Handle viewing account details - to be implemented in the future
  const handleViewAccount = (account: Account) => {
    toast({
      title: "View Account",
      description: `Viewing details for ${account.name} will be implemented in a future release.`,
    });
  };

  return (
    <div className="py-6">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
        <div className="mb-6 pb-5 border-b border-neutral-200">
          <h1 className="text-2xl font-bold text-neutral-700">Accounts</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Manage your business accounts and client relationships.
          </p>
        </div>
      </div>
      
      <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-100">
          <AccountList
            accounts={accounts}
            isLoading={isLoading}
            error={error as Error}
            onEdit={handleEditAccount}
            onDelete={handleDeleteAccount}
            onAdd={handleAddAccount}
            onView={handleViewAccount}
          />
        </div>
      </div>

      {/* Account Form Dialog */}
      <AccountForm
        isOpen={isAccountFormOpen}
        isEditing={isEditing}
        account={selectedAccount}
        isSubmitting={createAccountMutation.isPending || updateAccountMutation.isPending}
        onClose={() => setIsAccountFormOpen(false)}
        onSubmit={handleAccountFormSubmit}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteAccountDialog
        account={accountToDelete}
        isOpen={isDeleteDialogOpen}
        isDeleting={deleteAccountMutation.isPending}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
