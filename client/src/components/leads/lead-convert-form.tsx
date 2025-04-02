import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lead, Account } from "@shared/schema";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Schema for conversion options
const conversionSchema = z.object({
  createContact: z.boolean().default(true),
  createAccount: z.boolean().default(false),
  createOpportunity: z.boolean().default(false),
  accountId: z.number().optional().nullable(),
  accountName: z.string().optional(),
  opportunityName: z.string().optional(),
  amount: z.string().optional(),
  stage: z.enum(["Lead Generation", "Qualification", "Proposal", "Negotiation", "Closing"]).optional(),
  expectedCloseDate: z.string().optional(),
});

type ConversionFormValues = z.infer<typeof conversionSchema>;

interface LeadConvertFormProps {
  isOpen: boolean;
  lead: Lead | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: ConversionFormValues) => void;
}

export function LeadConvertForm({
  isOpen,
  lead,
  isSubmitting,
  onClose,
  onSubmit,
}: LeadConvertFormProps) {
  const { toast } = useToast();
  const [createNewAccount, setCreateNewAccount] = useState(false);
  
  // Fetch accounts for dropdown
  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
    enabled: isOpen,
  });
  
  const form = useForm<ConversionFormValues>({
    resolver: zodResolver(conversionSchema),
    defaultValues: {
      createContact: true,
      createAccount: false,
      createOpportunity: false,
      accountId: null,
      accountName: lead?.company || "",
      opportunityName: lead ? `${lead.company || "New"} - Initial Opportunity` : "",
      amount: "",
      stage: "Lead Generation",
      expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    },
  });

  const handleSubmit = (values: ConversionFormValues) => {
    try {
      const finalValues = { 
        ...values,
        // If creating a new account, use accountName and set accountId to null
        // Otherwise use accountId and ignore accountName
        accountId: values.createAccount ? null : createNewAccount ? null : values.accountId,
      };
      
      console.log("Converting lead with values:", finalValues);
      onSubmit(finalValues);
    } catch (error) {
      console.error("Lead conversion error:", error);
      toast({
        title: "Error",
        description: "Failed to convert lead. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Watch values for conditional rendering
  const createAccount = form.watch("createAccount");
  const createOpportunity = form.watch("createOpportunity");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Convert Lead: {lead?.firstName} {lead?.lastName}</DialogTitle>
          <DialogDescription>
            Convert this lead into a contact and optionally create or link to an account and opportunity.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="createContact"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled // Always create a contact
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Create Contact</FormLabel>
                      <p className="text-sm text-neutral-500">
                        Create a new contact from this lead (required)
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="createAccount"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          if (checked === false) {
                            setCreateNewAccount(false);
                          }
                        }}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Create or Link to Account</FormLabel>
                      <p className="text-sm text-neutral-500">
                        Create a new account or link to an existing one
                      </p>
                    </div>
                  </FormItem>
                )}
              />
              
              {createAccount && (
                <div className="pl-10 space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="create-new-account"
                      checked={createNewAccount}
                      onCheckedChange={(checked) => {
                        setCreateNewAccount(checked === true);
                      }}
                    />
                    <label
                      htmlFor="create-new-account"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Create New Account
                    </label>
                  </div>
                  
                  {createNewAccount ? (
                    <FormField
                      control={form.control}
                      name="accountName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter account name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : (
                    <FormField
                      control={form.control}
                      name="accountId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Existing Account</FormLabel>
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
                              <SelectItem value="none">None</SelectItem>
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
                  )}
                </div>
              )}

              <FormField
                control={form.control}
                name="createOpportunity"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Create Opportunity</FormLabel>
                      <p className="text-sm text-neutral-500">
                        Create a new sales opportunity from this lead
                      </p>
                    </div>
                  </FormItem>
                )}
              />
              
              {createOpportunity && (
                <div className="pl-10 space-y-4">
                  <FormField
                    control={form.control}
                    name="opportunityName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Opportunity Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter opportunity name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="0.00" />
                          </FormControl>
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
                            onValueChange={(value: any) => field.onChange(value)}
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
                  
                  <FormField
                    control={form.control}
                    name="expectedCloseDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expected Close Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Convert Lead
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}