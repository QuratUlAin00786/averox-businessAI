import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Proposal, ProposalTemplate, InsertProposal, insertProposalSchema } from '@shared/schema';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, CheckIcon, Loader2 } from 'lucide-react';
import { addDays, format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

interface ProposalFormProps {
  isOpen: boolean;
  isEditing: boolean;
  proposal: Proposal | null;
  opportunityId?: number;
  opportunityName?: string;
  accountId?: number;
  accountName?: string;
  templates: ProposalTemplate[];
  onClose: () => void;
  onSubmit: (data: InsertProposal | Partial<InsertProposal>) => void;
}

// Extend the InsertProposal schema with additional validation
const proposalFormSchema = insertProposalSchema.extend({
  name: z.string().min(1, { message: 'Proposal name is required' }),
  status: z.enum(['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired', 'Revoked']).optional(),
  expiresAt: z.date().optional().nullable(),
}).omit({ id: true });

type ProposalFormValues = z.infer<typeof proposalFormSchema>;

export function ProposalForm({
  isOpen,
  isEditing,
  proposal,
  opportunityId,
  opportunityName,
  accountId,
  accountName,
  templates,
  onClose,
  onSubmit,
}: ProposalFormProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [step, setStep] = useState<'info' | 'template'>(isEditing ? 'info' : 'template');

  // Initialize the form with default values or existing proposal data
  const form = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalFormSchema),
    defaultValues: {
      name: proposal?.name || '',
      accountId: proposal?.accountId || accountId || null,
      opportunityId: proposal?.opportunityId || opportunityId || null,
      status: proposal?.status || 'Draft',
      expiresAt: proposal?.expiresAt ? new Date(proposal.expiresAt) : null,
    },
  });

  // Update form values when editing a proposal
  useEffect(() => {
    if (isEditing && proposal) {
      form.reset({
        name: proposal.name,
        accountId: proposal.accountId,
        opportunityId: proposal.opportunityId,
        status: proposal.status as any, // Type assertion needed due to enum
        expiresAt: proposal.expiresAt ? new Date(proposal.expiresAt) : null,
      });
    } else if (!isEditing) {
      // Reset form for new proposal
      form.reset({
        name: '',
        accountId: accountId || null,
        opportunityId: opportunityId || null,
        status: 'Draft',
        expiresAt: addDays(new Date(), 30), // Default expiry is 30 days
      });
    }
  }, [form, isEditing, proposal, accountId, opportunityId]);

  // Reset the step when the dialog is closed
  useEffect(() => {
    if (!isOpen) {
      setStep(isEditing ? 'info' : 'template');
      setSelectedTemplateId(null);
    }
  }, [isOpen, isEditing]);

  const handleFormSubmit = (values: ProposalFormValues) => {
    try {
      // If we're creating a new proposal and a template is selected, add it
      if (!isEditing && selectedTemplateId) {
        values.templateId = selectedTemplateId;
      }

      // Make sure required fields are present
      const submissionData = {
        ...values,
        // Set default empty content object if not provided - MUST be a JSON object
        content: {},
        // Ensure opportunity and account IDs are set as numbers
        opportunityId: Number(opportunityId) || Number(values.opportunityId),
        accountId: Number(accountId) || Number(values.accountId),
        // Set creator to current user
        createdBy: 2 // Default to user ID 2 (can be replaced with actual user ID from context)
      };
      
      // Ensure the IDs are present and valid numbers
      if (!submissionData.opportunityId || isNaN(submissionData.opportunityId)) {
        console.error("Invalid opportunity ID:", submissionData.opportunityId);
        throw new Error("Invalid opportunity ID");
      }
      
      if (!submissionData.accountId || isNaN(submissionData.accountId)) {
        console.error("Invalid account ID:", submissionData.accountId);
        throw new Error("Invalid account ID");
      }
      
      console.log("Submitting proposal data:", submissionData);
      onSubmit(submissionData);
      form.reset();
    } catch (error) {
      console.error("Error in form submission:", error);
    }
  };

  // Go to the info step after template selection
  const handleTemplateSelect = (templateId: number | 'none') => {
    if (templateId !== 'none') {
      setSelectedTemplateId(Number(templateId));
    } else {
      setSelectedTemplateId(null);
    }
    
    setStep('info');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Proposal' : 'Create New Proposal'}
          </DialogTitle>
          <DialogDescription>
            {step === 'template' 
              ? 'Choose a template or start from scratch.' 
              : `${isEditing ? 'Edit' : 'Enter'} the proposal details and settings.`}
          </DialogDescription>
        </DialogHeader>

        {step === 'template' && !isEditing && (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <Card 
                className={cn(
                  "cursor-pointer overflow-hidden transition-all hover:shadow-md",
                  selectedTemplateId === null && "border-primary"
                )}
                onClick={() => handleTemplateSelect('none')}
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base">Blank Proposal</CardTitle>
                    {selectedTemplateId === null && (
                      <CheckIcon className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <CardDescription>Start with an empty proposal you can build from scratch.</CardDescription>
                </CardHeader>
              </Card>

              {templates.filter(t => t.isActive).map((template) => (
                <Card 
                  key={template.id}
                  className={cn(
                    "cursor-pointer overflow-hidden transition-all hover:shadow-md",
                    selectedTemplateId === template.id && "border-primary"
                  )}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      {selectedTemplateId === template.id && (
                        <CheckIcon className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <CardDescription>
                      {template.description || 'No description provided'}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={() => setStep('info')}>
                Next
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 'info' && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proposal Name*</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter proposal name" 
                        {...field} 
                        autoFocus
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {accountName && (
                <div className="text-sm">
                  <span className="font-medium">Account:</span> {accountName}
                </div>
              )}

              {opportunityName && (
                <div className="text-sm">
                  <span className="font-medium">Opportunity:</span> {opportunityName}
                </div>
              )}

              <FormField
                control={form.control}
                name="expiresAt"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Expiration Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button 
                            variant="outline" 
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value as Date}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      The proposal will expire on this date if not accepted or rejected.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isEditing && (
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Draft" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Draft
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Sent" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Sent
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Accepted" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Accepted
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Rejected" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Rejected
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <DialogFooter>
                <Button variant="outline" onClick={onClose} type="button">
                  Cancel
                </Button>
                {step === 'info' && !isEditing && (
                  <Button variant="outline" onClick={() => setStep('template')} type="button">
                    Back
                  </Button>
                )}
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isEditing ? 'Save Changes' : 'Create Proposal'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}