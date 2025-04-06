import { SimpleButton } from "@/components/ui/simple-button";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, ChevronRight, Plus } from "lucide-react";
import { MyTask } from "@/lib/data";
import { useLanguage } from "@/hooks/use-language";
import { TooltipHelper } from "@/components/ui/tooltip-helper";

interface MyTasksProps {
  tasks: MyTask[];
}

export function MyTasks({ tasks }: MyTasksProps) {
  const { t } = useLanguage();
  const getPriorityClass = (priority: MyTask["priority"]) => {
    // Handle both English and Arabic priority levels
    switch (priority) {
      case "High":
      case "عالية":
        return "bg-red-500 text-white";
      case "Medium":
      case "متوسطة":
        return "bg-orange-500 text-white";
      case "Normal":
      case "عادية":
        return "bg-blue-500 text-white";
      case "Low":
      case "منخفضة":
        return "bg-green-500 text-white";
      default:
        return "bg-neutral-400 text-white";
    }
  };

  const formatDueDate = (dueDate: string) => {
    if (dueDate === 'Today' || dueDate === t.dashboard.today) {
      return `${t.dashboard.due} ${t.dashboard.today.toLowerCase()}`;
    } else if (dueDate === 'Tomorrow' || dueDate === t.dashboard.tomorrow) {
      return `${t.dashboard.due} ${t.dashboard.tomorrow.toLowerCase()}`;
    } else {
      return `${t.dashboard.due} ${dueDate}`;
    }
  };

  return (
    <div className="h-full overflow-hidden bg-white rounded-lg shadow">
      <div className="px-4 py-3 border-b border-neutral-200 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center">
            <h3 className="text-lg font-medium leading-6 text-neutral-700">{t.dashboard.myTasks}</h3>
            <TooltipHelper 
              content={t.tooltips.dashboard.tasks} 
              side="top" 
              className="ml-2"
              iconSize={18}
            />
          </div>
          <SimpleButton 
            variant="outline" 
            className="border-primary text-primary hover:bg-primary hover:text-white"
            onClick={() => window.alert("Opening task creation form...")}
          >
            <Plus className="w-4 h-4 mr-1" />
            {t.buttons.add} {t.navigation.tasks}
          </SimpleButton>
        </div>
      </div>
      
      <div className="px-0 py-0">
        {tasks.length > 0 ? (
          <>
            <ul className="divide-y divide-neutral-200">
              {tasks.map((task) => (
                <li key={task.id}>
                  <div className="flex hover:bg-neutral-50 cursor-pointer" 
                       onClick={() => window.alert(`Viewing task details: ${task.title}`)}>
                    <div className="flex-shrink-0 pl-4 pt-4">
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
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col px-4 py-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-neutral-700">{task.title}</p>
                          <ChevronRight className="w-4 h-4 text-neutral-400 flex-shrink-0 ml-2" />
                        </div>
                        <div className="flex flex-wrap items-center mt-1 gap-2">
                          <div className="flex items-center text-xs text-neutral-500">
                            <Calendar className="flex-shrink-0 mr-1 h-3.5 w-3.5 text-neutral-400" />
                            <span>{formatDueDate(task.dueDate)}</span>
                          </div>
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${getPriorityClass(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="px-4 py-3 border-t border-neutral-200 text-center">
              <SimpleButton 
                variant="outline" 
                className="text-primary border-primary w-full sm:w-auto"
                href="/tasks"
                onClick={() => window.alert("Navigating to tasks page...")}
              >
                {t.dashboard.viewAllTasks}
                <ChevronRight className="w-4 h-4 ml-1" />
              </SimpleButton>
            </div>
          </>
        ) : (
          <div className="px-4 py-6 text-center text-neutral-500">
            <p>{t.dashboard.noTasks}</p>
            <SimpleButton 
              variant="outline" 
              className="mt-4 text-primary border-primary"
              onClick={() => window.alert("Opening task creation form...")}
            >
              <Plus className="w-4 h-4 mr-1" />
              {t.dashboard.createNewTask}
            </SimpleButton>
          </div>
        )}
      </div>
    </div>
  );
}
