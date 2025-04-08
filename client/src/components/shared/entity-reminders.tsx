import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { Task, insertTaskSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { CalendarIcon, Bell, Plus, Trash2, Clock, CheckCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EntityRemindersProps {
  entityId: number;
  entityType: 'contact' | 'account' | 'lead' | 'opportunity';
  entityName: string;
}

const reminderSchema = insertTaskSchema.extend({
  reminderDate: z.date({
    required_error: "Please select a reminder date",
  }),
  dueDate: z.date().optional(),
  title: z.string().min(2, "Title must be at least 2 characters"),
});

type ReminderForm = z.infer<typeof reminderSchema>;

export function EntityReminders({
  entityId,
  entityType,
  entityName,
}: EntityRemindersProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch reminders for this entity
  const { data: reminders, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks/reminders", entityType, entityId],
    queryFn: async () => {
      const res = await apiRequest(
        "GET",
        `/api/tasks/reminders?relatedToType=${entityType}&relatedToId=${entityId}`
      );
      return await res.json();
    }
  });

  // Create reminder mutation
  const createReminderMutation = useMutation({
    mutationFn: async (newReminder: ReminderForm) => {
      const res = await apiRequest("POST", "/api/tasks", {
        ...newReminder,
        isReminder: true,
        relatedToType: entityType,
        relatedToId: entityId,
        reminderDate: newReminder.reminderDate.toISOString(),
        dueDate: newReminder.dueDate ? newReminder.dueDate.toISOString() : null,
      });
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/reminders", entityType, entityId] });
      form.reset();
      setIsDialogOpen(false);
      toast({
        title: "Reminder created",
        description: "Your reminder has been successfully created.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create reminder",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete reminder mutation
  const deleteReminderMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/reminders", entityType, entityId] });
      toast({
        title: "Reminder deleted",
        description: "Your reminder has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete reminder",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Complete reminder mutation
  const completeReminderMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("PATCH", `/api/tasks/${id}`, {
        status: "Completed",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/reminders", entityType, entityId] });
      toast({
        title: "Reminder completed",
        description: "Your reminder has been marked as completed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update reminder",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form for creating reminders
  const form = useForm<ReminderForm>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "Normal" as const,
      status: "Not Started",
      isReminder: true,
    },
  });

  const onSubmit = (values: ReminderForm) => {
    createReminderMutation.mutate(values);
  };

  const getRelativeTime = (dateStr: string | Date) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInMs = date.getTime() - now.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 0) {
      return `${Math.abs(diffInDays)} day${Math.abs(diffInDays) !== 1 ? 's' : ''} ago`;
    } else if (diffInDays === 0) {
      return "Today";
    } else if (diffInDays === 1) {
      return "Tomorrow";
    } else if (diffInDays < 7) {
      return `In ${diffInDays} days`;
    } else {
      return format(date, "MMM d, yyyy");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "text-red-600";
      case "Medium":
        return "text-orange-500";
      case "Normal":
      default:
        return "text-blue-500";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Reminders</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> Add Reminder
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Reminder</DialogTitle>
              <DialogDescription>
                Set a reminder for {entityName}. You'll be notified when it's due.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g., Follow up with client" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add details about this reminder"
                          className="min-h-[100px]"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="reminderDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Reminder Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={`pl-3 text-left font-normal ${
                                  !field.value ? "text-muted-foreground" : ""
                                }`}
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
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value || "Normal"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Normal">Normal</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={createReminderMutation.isPending}
                  >
                    {createReminderMutation.isPending ? (
                      <>
                        <span className="animate-spin mr-2">
                          <Clock className="h-4 w-4" />
                        </span>
                        Creating...
                      </>
                    ) : (
                      "Create Reminder"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-6">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : !reminders || reminders.length === 0 ? (
        <div className="text-center py-8 border border-dashed rounded-md">
          <Bell className="h-8 w-8 mx-auto text-neutral-400 mb-2" />
          <p className="text-neutral-500">No reminders set</p>
          <Button 
            variant="link" 
            onClick={() => setIsDialogOpen(true)}
            className="mt-2"
          >
            Create your first reminder
          </Button>
        </div>
      ) : (
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {reminders
              .sort((a, b) => new Date(a.reminderDate || "").getTime() - new Date(b.reminderDate || "").getTime())
              .map((reminder) => (
                <Card key={reminder.id} className="overflow-hidden">
                  <CardHeader className="p-3 pb-0">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">{reminder.title}</CardTitle>
                      <div className={`text-xs font-medium ${getPriorityColor(reminder.priority || "Normal")}`}>
                        {reminder.priority}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 pt-2 pb-0">
                    {reminder.description && (
                      <p className="text-sm text-neutral-600 mb-2">{reminder.description}</p>
                    )}
                    <div className="flex items-center text-xs text-neutral-500">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>
                        {reminder.reminderDate 
                          ? getRelativeTime(reminder.reminderDate)
                          : "No date set"}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-2 flex justify-end gap-2 border-t mt-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => deleteReminderMutation.mutate(reminder.id)}
                      disabled={deleteReminderMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                    {reminder.status !== "Completed" && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => completeReminderMutation.mutate(reminder.id)}
                        disabled={completeReminderMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}