import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, ChevronRight, Plus } from "lucide-react";
import { Link } from "wouter";
import { MyTask } from "@/lib/data";

interface MyTasksProps {
  tasks: MyTask[];
}

export function MyTasks({ tasks }: MyTasksProps) {
  const getPriorityClass = (priority: MyTask["priority"]) => {
    switch (priority) {
      case "High":
        return "bg-primary text-white";
      case "Medium":
        return "bg-secondary text-white";
      case "Normal":
        return "bg-neutral-400 text-white";
      default:
        return "bg-neutral-400 text-white";
    }
  };

  const formatDueDate = (dueDate: string) => {
    if (dueDate === 'Today') {
      return 'Due today';
    } else if (dueDate === 'Tomorrow') {
      return 'Due tomorrow';
    } else {
      return `Due ${dueDate}`;
    }
  };

  return (
    <div className="overflow-hidden bg-white rounded-lg shadow">
      <div className="px-4 py-5 border-b border-neutral-200 sm:px-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium leading-6 text-neutral-700">My Tasks</h3>
          <div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary hover:bg-primary-light hover:bg-opacity-20"
              onClick={() => {
                const message = "Opening task creation form...";
                console.log(message);
                window.alert(message);
              }}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Task
            </Button>
          </div>
        </div>
      </div>
      
      {tasks.length > 0 ? (
        <>
          <ul className="divide-y divide-neutral-200">
            {tasks.map((task) => (
              <li key={task.id}>
                <div 
                  className="block hover:bg-neutral-50 cursor-pointer"
                  onClick={() => {
                    const message = `Viewing task details: ${task.title}`;
                    console.log(message);
                    window.alert(message);
                  }}
                >
                  <div className="flex items-center px-4 py-4 sm:px-6">
                    <div className="flex items-center flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        <Checkbox 
                          id={String(task.id)} 
                          className="w-4 h-4 text-primary border-neutral-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            const message = `Task marked as complete: ${task.title}`;
                            console.log(message);
                            window.alert(message);
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0 px-4">
                        <div>
                          <p className="text-sm font-medium text-neutral-700 truncate">{task.title}</p>
                          <div className="flex flex-wrap mt-1 gap-y-1">
                            <div className="flex items-center text-sm text-neutral-500">
                              <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-neutral-400" />
                              <span>{formatDueDate(task.dueDate)}</span>
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
            <Link href="/tasks">
              <Button variant="outline" className="text-neutral-700 border-neutral-200 shadow-sm">
                View All Tasks
                <ChevronRight className="w-5 h-5 ml-2 -mr-1" />
              </Button>
            </Link>
          </div>
        </>
      ) : (
        <div className="px-4 py-10 text-center text-neutral-500">
          <p>No pending tasks</p>
          <Button 
            variant="outline" 
            className="mt-4 text-neutral-700 border-neutral-200 shadow-sm"
            onClick={() => {
              const message = "Opening task creation form...";
              console.log(message);
              window.alert(message);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Task
          </Button>
        </div>
      )}
    </div>
  );
}
