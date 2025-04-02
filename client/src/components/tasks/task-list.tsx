import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Task } from "@shared/schema";
import { Check, Edit, MoreHorizontal, Trash2, Calendar, Clock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface TaskListProps {
  data: Task[];
  isLoading: boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (task: Task, status: "Not Started" | "In Progress" | "Completed" | "Deferred") => void;
  onPriorityChange?: (task: Task, priority: "High" | "Medium" | "Normal") => void;
}

export function TaskList({
  data,
  isLoading,
  onEdit,
  onDelete,
  onStatusChange,
  onPriorityChange,
}: TaskListProps) {
  const [filter, setFilter] = useState("all");
  const [searchText, setSearchText] = useState("");

  // Filter tasks by status
  const filteredByStatus = filter === "all" 
    ? data 
    : data.filter(task => 
        filter === "completed" 
          ? task.status === "Completed" 
          : task.status !== "Completed"
      );
      
  // Filter tasks by search text
  const filteredTasks = searchText 
    ? filteredByStatus.filter(task => 
        task.title.toLowerCase().includes(searchText.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchText.toLowerCase()))
      )
    : filteredByStatus;

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case "High":
        return "bg-red-600 text-white hover:bg-red-700";
      case "Medium":
        return "bg-amber-500 text-white hover:bg-amber-600";
      case "Normal":
        return "bg-blue-600 text-white hover:bg-blue-700";
      default:
        return "bg-gray-500 text-white hover:bg-gray-600";
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "In Progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Deferred":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "Not Started":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return "—";
    return format(new Date(date), "MMM d, yyyy");
  };

  const renderMobileCard = (task: Task) => (
    <Card key={task.id} className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-medium">{task.title}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onStatusChange(task, "Completed")}
                disabled={task.status === "Completed"}
              >
                <Check className="mr-2 h-4 w-4" />
                Mark as Complete
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(task)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="py-2">
        {task.description && (
          <p className="text-sm text-gray-500 mb-2">{task.description}</p>
        )}
        <div className="flex flex-wrap gap-2 text-xs">
          {task.dueDate && (
            <div className="flex items-center text-gray-600">
              <Calendar className="mr-1 h-3 w-3" />
              {formatDate(task.dueDate)}
            </div>
          )}
          {task.reminderDate && (
            <div className="flex items-center text-gray-600">
              <Clock className="mr-1 h-3 w-3" />
              {formatDate(task.reminderDate)}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between">
        <Badge className={getStatusColor(task.status)}>
          {task.status || "Not Started"}
        </Badge>
        <Badge className={getPriorityColor(task.priority)}>
          {task.priority || "Normal"} Priority
        </Badge>
      </CardFooter>
    </Card>
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="md:w-1/3">
          <Input
            placeholder="Search tasks..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="active">Active Tasks</SelectItem>
              <SelectItem value="completed">Completed Tasks</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Mobile view (cards) */}
      <div className="md:hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredTasks.length > 0 ? (
          filteredTasks.map(renderMobileCard)
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">No tasks found</p>
          </div>
        )}
      </div>

      {/* Desktop view (table) */}
      <div className="hidden md:block rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <Checkbox 
                      checked={task.status === "Completed"} 
                      onCheckedChange={(checked) => {
                        if (checked) {
                          onStatusChange(task, "Completed");
                        } else {
                          onStatusChange(task, "Not Started");
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div>{task.title}</div>
                    {task.description && (
                      <div className="text-xs text-gray-500">{task.description}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    {task.dueDate ? formatDate(task.dueDate) : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority || "Normal"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(task.status)}>
                      {task.status || "Not Started"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(task)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onDelete(task)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  No tasks found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}