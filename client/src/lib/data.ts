import { apiRequestJson } from "./queryClient";
import { Task, Event, Activity, User } from "@shared/schema";

export interface DashboardStats {
  newLeads: number;
  conversionRate: string;
  revenue: string;
  openDeals: number;
}

export interface PipelineStage {
  name: string;
  value: string;
  percentage: number;
  color: string;
}

export interface PipelineData {
  stages: PipelineStage[];
}

export interface DashboardActivity extends Omit<Activity, 'userId'> {
  user: {
    name: string;
    avatar: string;
    initials: string;
  };
  time: string;
  isLast?: boolean;
}

export interface UpcomingEvent {
  id: number;
  title: string;
  date: {
    month: string;
    day: string;
  };
  time: string;
  location: string;
  locationType: "physical" | "virtual";
  status: string;
}

export interface MyTask {
  id: number | string;
  title: string;
  dueDate: string;
  priority: "High" | "Medium" | "Normal";
}

export interface DashboardData {
  stats: {
    id: number;
    title: string;
    value: string;
    change: {
      value: string;
      trend: "up" | "down" | "neutral";
      text: string;
      percentage?: number;
    };
  }[];
  pipelineStages: PipelineStage[];
  recentActivities: DashboardActivity[];
  upcomingEvents: UpcomingEvent[];
  myTasks: MyTask[];
}

// Stage colors for pipeline visualization
const stageColors = {
  "Lead Generation": "#4361ee",
  "Qualification": "#3a0ca3",
  "Proposal": "#7209b7", 
  "Negotiation": "#f72585",
  "Closing": "#ff6b6b"
};

// Format a date object into a string like "Today", "Tomorrow", or "Apr 19"
function formatTaskDueDate(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const taskDate = new Date(date);
  taskDate.setHours(0, 0, 0, 0);
  
  if (taskDate.getTime() === today.getTime()) {
    return 'Today';
  } else if (taskDate.getTime() === tomorrow.getTime()) {
    return 'Tomorrow';
  } else {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[taskDate.getMonth()]} ${taskDate.getDate()}`;
  }
}

// Transform event from API to UI format
function transformEvent(event: Event): UpcomingEvent {
  const startDate = new Date(event.startDate);
  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  
  // Format time for display
  const hours = startDate.getHours();
  const minutes = startDate.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  const timeString = `${formattedHours}:${minutes} ${ampm}`;
  
  return {
    id: event.id,
    title: event.title,
    date: {
      month: monthNames[startDate.getMonth()],
      day: startDate.getDate().toString(),
    },
    time: timeString,
    location: event.location || '',
    locationType: (event.locationType as "physical" | "virtual") || 'physical',
    status: event.status || 'Confirmed',
  };
}

// Format relative time string for activities
function getRelativeTimeString(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} sec ago`;
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} min ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return 'Yesterday';
  }
  
  if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks === 1) {
    return '1 week ago';
  }
  
  if (diffInWeeks < 4) {
    return `${diffInWeeks} weeks ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths === 1) {
    return '1 month ago';
  }
  
  return `${diffInMonths} months ago`;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return await apiRequestJson<DashboardStats>('GET', '/api/dashboard/stats');
}

export async function getSalesPipeline(): Promise<PipelineData> {
  const data = await apiRequestJson<{ stages: { name: string, value: string, percentage: number }[] }>('GET', '/api/dashboard/pipeline');
  
  // Add colors to each stage
  const stagesWithColors = data.stages.map(stage => ({
    ...stage,
    color: stageColors[stage.name as keyof typeof stageColors] || '#7286D3'
  }));
  
  return { stages: stagesWithColors };
}

export async function getRecentActivities(): Promise<DashboardActivity[]> {
  return await apiRequestJson<DashboardActivity[]>('GET', '/api/dashboard/activities');
}

export async function getUpcomingEvents(): Promise<UpcomingEvent[]> {
  const now = new Date();
  const events = await apiRequestJson<Event[]>('GET', '/api/events');
  
  // Filter to upcoming events and sort by date
  const upcomingEvents = events
    .filter(event => new Date(event.startDate) > now)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 3) // Take only the next 3 events
    .map(transformEvent);
  
  return upcomingEvents;
}

export async function getMyTasks(): Promise<MyTask[]> {
  // Get tasks assigned to current user (for demo, we'll use user ID 1)
  const tasks = await apiRequestJson<Task[]>('GET', '/api/tasks');
  
  // Filter to incomplete tasks
  const myIncompleteTasks = tasks
    .filter(task => task.status !== 'Completed')
    .sort((a, b) => {
      // Sort by priority first
      const priorityOrder = { "High": 0, "Medium": 1, "Normal": 2 };
      const priorityDiff = 
        (priorityOrder[a.priority as keyof typeof priorityOrder] || 0) - 
        (priorityOrder[b.priority as keyof typeof priorityOrder] || 0);
      
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by due date
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return 0;
    })
    .slice(0, 3) // Take top 3 tasks
    .map(task => ({
      id: task.id,
      title: task.title,
      dueDate: task.dueDate ? formatTaskDueDate(new Date(task.dueDate)) : 'No due date',
      priority: task.priority as "High" | "Medium" | "Normal" || "Normal"
    }));
  
  return myIncompleteTasks;
}

export async function getDashboardData(): Promise<DashboardData> {
  try {
    // Fetch all dashboard data in parallel
    const [statsData, pipelineData, activitiesData, upcomingEventsData, tasksData] = await Promise.all([
      getDashboardStats(),
      getSalesPipeline(),
      getRecentActivities(),
      getUpcomingEvents(),
      getMyTasks()
    ]);
    
    // Transform stats data for the UI
    const stats = [
      {
        id: 1,
        title: "New Leads",
        value: statsData.newLeads.toString(),
        change: {
          value: "+12.5%",
          trend: "up" as const,
          text: "from last month",
          percentage: 12.5,
        },
      },
      {
        id: 2,
        title: "Conversion Rate",
        value: statsData.conversionRate,
        change: {
          value: "-3.2%",
          trend: "down" as const,
          text: "from last month",
          percentage: -3.2,
        },
      },
      {
        id: 3,
        title: "Revenue",
        value: statsData.revenue,
        change: {
          value: "+8.7%",
          trend: "up" as const,
          text: "from last month",
          percentage: 8.7,
        },
      },
      {
        id: 4,
        title: "Open Deals",
        value: statsData.openDeals.toString(),
        change: {
          value: "No change",
          trend: "neutral" as const,
          text: "from last month",
        },
      },
    ];
    
    // Add isLast property to the last activity
    const processedActivities = [...activitiesData];
    if (processedActivities.length > 0) {
      processedActivities[processedActivities.length - 1].isLast = true;
    }
    
    return {
      stats,
      pipelineStages: pipelineData.stages,
      recentActivities: processedActivities,
      upcomingEvents: upcomingEventsData,
      myTasks: tasksData,
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    
    // In case of error, return empty data
    return {
      stats: [],
      pipelineStages: [],
      recentActivities: [],
      upcomingEvents: [],
      myTasks: [],
    };
  }
}
