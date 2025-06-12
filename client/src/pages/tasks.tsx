import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, Loader2, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { TaskList } from "@/components/tasks/task-list";
import { TaskForm } from "@/components/tasks/task-form";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequestJson } from "@/lib/queryClient";
import { Task, InsertTask } from "@shared/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Tasks() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Fetch tasks
  const {
    data: tasks = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/tasks"],
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to load tasks: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (data: InsertTask) => {
      return apiRequestJson<Task>("POST", "/api/tasks", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setIsAddOpen(false);
      toast({
        title: "Success",
        description: "Task created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create task: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertTask> }) => {
      return apiRequestJson<Task>("PATCH", `/api/tasks/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setIsEditOpen(false);
      toast({
        title: "Success",
        description: "Task updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update task: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequestJson<Task>("DELETE", `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setIsDeleteOpen(false);
      setSelectedTask(null);
      toast({
        title: "Success",
        description: "Task deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete task: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Event handlers
  const handleAddTask = () => {
    setSelectedTask(null);
    setIsAddOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsEditOpen(true);
  };

  const handleDeleteTask = (task: Task) => {
    setSelectedTask(task);
    setIsDeleteOpen(true);
  };

  const handleStatusChange = (
    task: Task,
    status: "Not Started" | "In Progress" | "Completed" | "Deferred"
  ) => {
    updateTaskMutation.mutate({
      id: task.id,
      data: { status },
    });
  };

  const handlePriorityChange = (
    task: Task,
    priority: "High" | "Medium" | "Normal"
  ) => {
    updateTaskMutation.mutate({
      id: task.id,
      data: { priority },
    });
  };

  const handleCreateSubmit = (data: InsertTask) => {
    createTaskMutation.mutate(data);
  };

  const handleEditSubmit = (data: Partial<InsertTask>) => {
    if (selectedTask) {
      updateTaskMutation.mutate({ id: selectedTask.id, data });
    }
  };

  // Error state
  if (error) {
    return (
      <div className="py-6">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
          <div className="flex flex-col items-center justify-center h-96 bg-white rounded-lg shadow">
            <p className="text-red-600 mb-4">Error loading tasks</p>
            <Button 
              variant="outline" 
              onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/tasks'] })}
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
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setLocation("/")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-neutral-600 sm:text-3xl sm:truncate">
              Tasks
            </h2>
          </div>
          <div className="flex mt-4 md:mt-0 md:ml-4">
            <Button onClick={handleAddTask}>
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              Add Task
            </Button>
          </div>
        </div>
      </div>
      
      <div className="px-4 mx-auto mt-6 max-w-7xl sm:px-6 md:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <TaskList
            data={tasks}
            isLoading={isLoading}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            onStatusChange={handleStatusChange}
            onPriorityChange={handlePriorityChange}
          />
        </div>
      </div>

      {/* Add/Edit Task Dialog */}
      <TaskForm
        isOpen={isAddOpen || isEditOpen}
        isEditing={isEditOpen}
        task={selectedTask}
        isSubmitting={createTaskMutation.isPending || updateTaskMutation.isPending}
        onClose={() => {
          setIsAddOpen(false);
          setIsEditOpen(false);
        }}
        onSubmit={isEditOpen ? handleEditSubmit : handleCreateSubmit}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the task "{selectedTask?.title}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedTask && deleteTaskMutation.mutate(selectedTask.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteTaskMutation.isPending && (
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
