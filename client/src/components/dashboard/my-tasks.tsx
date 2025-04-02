import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, ChevronRight } from "lucide-react";

interface Task {
  id: string;
  title: string;
  dueDate: string;
  priority: "High" | "Medium" | "Normal";
}

export function MyTasks() {
  const tasks: Task[] = [
    {
      id: "task-1",
      title: "Follow up with Acme Corp about proposal",
      dueDate: "Due today",
      priority: "High"
    },
    {
      id: "task-2",
      title: "Prepare quarterly sales report",
      dueDate: "Due tomorrow",
      priority: "Medium"
    },
    {
      id: "task-3",
      title: "Schedule demo with new client",
      dueDate: "Due in 3 days",
      priority: "Normal"
    }
  ];

  const getPriorityClass = (priority: Task["priority"]) => {
    switch (priority) {
      case "High":
        return "bg-primary text-white";
      case "Medium":
        return "bg-warning text-white";
      case "Normal":
        return "bg-neutral-400 text-white";
    }
  };

  return (
    <div className="overflow-hidden bg-white rounded-lg shadow">
      <div className="px-4 py-5 border-b border-neutral-200 sm:px-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium leading-6 text-neutral-700">My Tasks</h3>
          <div>
            <Button variant="ghost" className="text-xs text-primary hover:bg-primary-light hover:bg-opacity-20">
              Add Task
            </Button>
          </div>
        </div>
      </div>
      <ul className="divide-y divide-neutral-200">
        {tasks.map((task) => (
          <li key={task.id}>
            <div className="block hover:bg-neutral-50">
              <div className="flex items-center px-4 py-4 sm:px-6">
                <div className="flex items-center flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    <Checkbox id={task.id} className="w-4 h-4 text-primary border-neutral-300" />
                  </div>
                  <div className="flex-1 min-w-0 px-4">
                    <div>
                      <p className="text-sm font-medium text-neutral-700 truncate">{task.title}</p>
                      <div className="flex mt-1">
                        <div className="flex items-center text-sm text-neutral-500">
                          <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-neutral-400" />
                          <span>{task.dueDate}</span>
                        </div>
                        <div className="flex items-center ml-4 text-sm text-neutral-500">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityClass(task.priority)}`}>
                            {task.priority} Priority
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <ChevronRight className="w-5 h-5 text-neutral-400" />
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="px-4 py-3 bg-neutral-50 text-center sm:px-6">
        <Button variant="outline" className="text-neutral-700 border-neutral-200 shadow-sm">
          View All Tasks
          <ChevronRight className="w-5 h-5 ml-2 -mr-1" />
        </Button>
      </div>
    </div>
  );
}
