import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Opportunity, insertOpportunitySchema, User, Account } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

// Extend the opportunity schema for form validation
const formSchema = insertOpportunitySchema.extend({
  // Add any additional validation rules here
  amount: z.string()
    .optional()
    .nullable()
    .refine(val => !val || !isNaN(parseFloat(val)), {
      message: "Amount must be a valid number",
    }),
  expectedCloseDate: z.string().optional().nullable(),
  isClosed: z.boolean().optional().default(false),
  isWon: z.boolean().optional().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface OpportunityFormProps {
  isOpen: boolean;
  isEditing: boolean;
  opportunity: Opportunity | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: FormValues) => void;
}

export function OpportunityForm({
  isOpen,
  isEditing,
  opportunity,
  isSubmitting,
  onClose,
  onSubmit,
}: OpportunityFormProps) {
  const { toast } = useToast();
  
  // Fetch users for owner dropdown
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: isOpen,
  });
  
  // Fetch accounts for account dropdown
  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
    enabled: isOpen,
  });
  
  // Format the date to YYYY-MM-DD for the date picker
  const formatDateForInput = (dateString: string | null | undefined) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return format(date, "yyyy-MM-dd");
    } catch (e) {
      return "";
    }
  };
  
  // Initialize the form with current opportunity data or empty values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: opportunity?.name || "",
      stage: opportunity?.stage || "Lead Generation",
      amount: opportunity?.amount || "",
      accountId: opportunity?.accountId || null,
      ownerId: opportunity?.ownerId || null,
      notes: opportunity?.notes || "",
      expectedCloseDate: formatDateForInput(opportunity?.expectedCloseDate),
      isClosed: opportunity?.isClosed || false,
      isWon: opportunity?.isWon || false,
    },
  });

  // Reset form when opportunity changes
  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: opportunity?.name || "",
        stage: opportunity?.stage || "Lead Generation",
        amount: opportunity?.amount || "",
        accountId: opportunity?.accountId || null,
        ownerId: opportunity?.ownerId || null,
        notes: opportunity?.notes || "",
        expectedCloseDate: formatDateForInput(opportunity?.expectedCloseDate),
        isClosed: opportunity?.isClosed || false,
        isWon: opportunity?.isWon || false,
      });
    }
  }, [isOpen, opportunity, form]);

  const handleSubmit = async (values: FormValues) => {
    try {
      console.log("Submitting opportunity form with values:", values);
      onSubmit(values);
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description: "Failed to save opportunity. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Opportunity" : "Add New Opportunity"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the opportunity information below."
              : "Fill out the form below to create a new opportunity."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {/* Opportunity Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opportunity Name*</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="E.g. Acme Corp - New Software License" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Account and Stage */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="accountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account</FormLabel>
                    <Select
                      value={field.value?.toString() || "none"}
                      onValueChange={(value) => {
                        field.onChange(value && value !== "none" ? parseInt(value) : null);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an account" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No Account</SelectItem>
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id.toString()}>
                            {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stage</FormLabel>
                    <Select
                      value={field.value || "Lead Generation"}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a stage" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Lead Generation">Lead Generation</SelectItem>
                        <SelectItem value="Qualification">Qualification</SelectItem>
                        <SelectItem value="Proposal">Proposal</SelectItem>
                        <SelectItem value="Negotiation">Negotiation</SelectItem>
                        <SelectItem value="Closing">Closing</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Amount and Expected Close Date */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="0.00" 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expectedCloseDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Close Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Owner */}
            <FormField
              control={form.control}
              name="ownerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Owner</FormLabel>
                  <Select
                    value={field.value?.toString() || "none"}
                    onValueChange={(value) => {
                      field.onChange(value && value !== "none" ? parseInt(value) : null);
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an owner" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No Owner</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.firstName} {user.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any additional information here..." 
                      className="h-24"
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Save Changes" : "Create Opportunity"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}