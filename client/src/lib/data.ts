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

export interface DashboardActivity {
  id: number;
  action: string;
  detail?: string;
  relatedToType?: string;
  relatedToId?: number;
  createdAt?: string;
  icon?: string;
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
  priority: "High" | "Medium" | "Normal" | "Low" | "عالية" | "متوسطة" | "عادية" | "منخفضة";
}

export interface MarketingCampaign {
  id: number;
  name: string;
  status: string;
  platform: string;
  reach: number;
  conversion: number;
  budget: string;
}

export interface MigrationItem {
  id: number;
  name: string;
  status: string;
  progress: number;
}

export interface PerformanceMetric {
  id: number;
  name: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
}

export interface TodayEvent {
  id: number;
  title: string;
  time: string;
  description: string;
  attendees?: string;
}

export interface TaskDueToday {
  id: number;
  title: string;
  priority: string;
  status: string;
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
  
  // Additional fields used in the dashboard.tsx
  todayEvents?: TodayEvent[];
  dueTasks?: TaskDueToday[];
  marketingCampaigns?: MarketingCampaign[];
  migrations?: MigrationItem[];
  performanceMetrics?: PerformanceMetric[];
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
  try {
    // First try to get activities from the dashboard-specific endpoint
    return await apiRequestJson<DashboardActivity[]>('GET', '/api/dashboard/activities');
  } catch (error) {
    console.warn('Failed to fetch dashboard activities, falling back to general activities');
    
    // If that fails, try the general activities endpoint
    try {
      const activities = await apiRequestJson<Activity[]>('GET', '/api/activities');
      
      // Get users data to map user IDs to names
      let users: User[] = [];
      try {
        users = await apiRequestJson<User[]>('GET', '/api/users');
      } catch (userError) {
        console.warn('Failed to fetch users:', userError);
      }
      
      // Get the currently logged-in user
      let currentUser: User | null = null;
      try {
        currentUser = await apiRequestJson<User>('GET', '/api/user');
      } catch (userError) {
        console.warn('Failed to fetch current user:', userError);
      }
      
      // Transform the activities for dashboard display
      return activities.map(activity => {
        // Get relative time - handle null case safely
        const createdAtDate = activity.createdAt ? new Date(activity.createdAt) : new Date();
        const timeString = getRelativeTimeString(createdAtDate);
        
        // Find the user who performed this activity
        const user = users.find(u => u.id === activity.userId);
        
        // Create user info with real name if available
        let userInfo = {
          name: 'System User', // Default fallback
          avatar: '',
          initials: 'SU'
        };
        
        if (user) {
          const firstName = user.firstName || '';
          const lastName = user.lastName || '';
          const fullName = [firstName, lastName].filter(Boolean).join(' ');
          
          // Get initials from first and last name
          const initials = [firstName?.[0], lastName?.[0]]
            .filter(Boolean)
            .join('')
            .toUpperCase();
            
          userInfo = {
            name: fullName || user.username,
            avatar: user.avatar || '',
            initials: initials || user.username?.[0]?.toUpperCase() || 'U'
          };
        } else if (currentUser && activity.userId === currentUser.id) {
          // If this activity belongs to the current user
          const firstName = currentUser.firstName || '';
          const lastName = currentUser.lastName || '';
          const fullName = [firstName, lastName].filter(Boolean).join(' ');
          
          // Get initials from first and last name
          const initials = [firstName?.[0], lastName?.[0]]
            .filter(Boolean)
            .join('')
            .toUpperCase();
            
          userInfo = {
            name: fullName || currentUser.username,
            avatar: currentUser.avatar || '',
            initials: initials || currentUser.username?.[0]?.toUpperCase() || 'U'
          };
        }
        
        // Create a properly typed DashboardActivity object by converting Date to string
        return {
          id: activity.id,
          action: activity.action || '',
          detail: activity.detail || undefined,
          relatedToType: activity.relatedToType || undefined,
          relatedToId: activity.relatedToId || undefined,
          // Convert Date to ISO string to match the DashboardActivity interface
          createdAt: activity.createdAt ? new Date(activity.createdAt).toISOString() : undefined,
          icon: activity.icon || undefined,
          time: timeString,
          user: userInfo
        };
      }).slice(0, 5); // Only take the 5 most recent
      
    } catch (secondError) {
      console.error('Failed to fetch activities from both endpoints:', secondError);
      return [];
    }
  }
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
      const priorityOrder = { 
        "High": 0, "Medium": 1, "Normal": 2, "Low": 3,
        "عالية": 0, "متوسطة": 1, "عادية": 2, "منخفضة": 3 
      };
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
      priority: task.priority as "High" | "Medium" | "Normal" | "Low" | "عالية" | "متوسطة" | "عادية" | "منخفضة" || "Normal"
    }));
  
  return myIncompleteTasks;
}

export async function getDashboardData(): Promise<DashboardData> {
  try {
    // First fetch stats and pipeline data - these are essential
    const statsData = await getDashboardStats();
    const pipelineData = await getSalesPipeline();
    
    // Then fetch the rest, but handle failures gracefully
    let activitiesData: DashboardActivity[] = [];
    let upcomingEventsData: UpcomingEvent[] = [];
    let tasksData: MyTask[] = [];
    
    try {
      activitiesData = await getRecentActivities();
    } catch (e) {
      console.warn('Failed to fetch activities data:', e);
    }
    
    try {
      upcomingEventsData = await getUpcomingEvents();
    } catch (e) {
      console.warn('Failed to fetch events data:', e);
    }
    
    try {
      tasksData = await getMyTasks();
    } catch (e) {
      console.warn('Failed to fetch tasks data:', e);
    }
    
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
    
    // Create sample activities if none exist (for demo purposes)
    let processedActivities = [...activitiesData];
    if (processedActivities.length === 0) {
      processedActivities = [
        {
          id: 1,
          action: "Added a new contact",
          detail: "New contact created",
          relatedToId: 1,
          relatedToType: "contact",
          createdAt: new Date().toISOString(),
          icon: "added",
          time: "10 min ago",
          user: {
            name: "Alex Johnson",
            avatar: "",
            initials: "AJ"
          }
        },
        {
          id: 2,
          action: "Updated opportunity status",
          detail: "Changed stage to Negotiation",
          relatedToId: 3,
          relatedToType: "opportunity",
          createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
          icon: "updated",
          time: "2 hours ago",
          user: {
            name: "Maria Garcia",
            avatar: "",
            initials: "MG"
          }
        },
        {
          id: 3,
          action: "Completed task",
          detail: "Follow-up call completed",
          relatedToId: 5,
          relatedToType: "task",
          createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          icon: "completed",
          time: "Yesterday",
          user: {
            name: "Thomas Chen",
            avatar: "",
            initials: "TC"
          }
        }
      ];
    }
    
    // Add isLast property to the last activity
    if (processedActivities.length > 0) {
      processedActivities[processedActivities.length - 1].isLast = true;
    }
    
    return {
      stats,
      pipelineStages: pipelineData.stages,
      recentActivities: processedActivities,
      upcomingEvents: upcomingEventsData.length > 0 ? upcomingEventsData : [
        // Fallback events if none returned from API
        {
          id: 101,
          title: "Client Meeting - GlobalTech",
          date: { month: "APR", day: "15" },
          time: "10:30 AM",
          location: "Conference Room A",
          locationType: "physical",
          status: "Confirmed"
        },
        {
          id: 102,
          title: "Sales Team Weekly Sync",
          date: { month: "APR", day: "16" },
          time: "9:00 AM",
          location: "Zoom Meeting",
          locationType: "virtual",
          status: "Confirmed"
        }
      ],
      myTasks: tasksData.length > 0 ? tasksData : [
        // Fallback tasks if none returned from API
        {
          id: 201,
          title: "Follow up with Acme Corp",
          dueDate: "Tomorrow",
          priority: "High"
        },
        {
          id: 202,
          title: "Prepare Q2 forecast report",
          dueDate: "Apr 20",
          priority: "Medium"
        },
        {
          id: 203,
          title: "Update lead qualification criteria",
          dueDate: "Apr 22",
          priority: "Normal"
        }
      ],
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    
    // In case of critical error (stats or pipeline), return fallback data
    return {
      stats: [
        {
          id: 1,
          title: "New Leads",
          value: "5",
          change: {
            value: "+10%",
            trend: "up" as const,
            text: "from last month",
            percentage: 10,
          },
        },
        {
          id: 2,
          title: "Conversion Rate",
          value: "15.2%",
          change: {
            value: "+2.8%",
            trend: "up" as const,
            text: "from last month",
            percentage: 2.8,
          },
        },
        {
          id: 3,
          title: "Revenue",
          value: "$78,500",
          change: {
            value: "+5.6%",
            trend: "up" as const,
            text: "from last month",
            percentage: 5.6,
          },
        },
        {
          id: 4,
          title: "Open Deals",
          value: "12",
          change: {
            value: "+2",
            trend: "up" as const,
            text: "from last month",
            percentage: 20,
          },
        },
      ],
      pipelineStages: [
        { name: "Lead Generation", value: "260000", percentage: 30, color: "#4361ee" },
        { name: "Qualification", value: "160000", percentage: 15, color: "#3a0ca3" },
        { name: "Proposal", value: "405000", percentage: 25, color: "#7209b7" },
        { name: "Negotiation", value: "195000", percentage: 20, color: "#f72585" },
        { name: "Closing", value: "85000", percentage: 10, color: "#ff6b6b" }
      ],
      recentActivities: [
        {
          id: 1,
          action: "Added a new contact",
          detail: "New contact created",
          relatedToId: 1,
          relatedToType: "contact",
          createdAt: new Date().toISOString(),
          icon: "added",
          time: "10 min ago",
          user: {
            name: "Alex Johnson",
            avatar: "",
            initials: "AJ"
          }
        },
        {
          id: 2,
          action: "Updated opportunity status",
          detail: "Changed stage to Negotiation",
          relatedToId: 3,
          relatedToType: "opportunity",
          createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
          icon: "updated",
          time: "2 hours ago",
          user: {
            name: "Maria Garcia",
            avatar: "",
            initials: "MG"
          }
        },
        {
          id: 3,
          action: "Completed task",
          detail: "Follow-up call completed",
          relatedToId: 5,
          relatedToType: "task",
          createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          icon: "completed",
          time: "Yesterday",
          isLast: true,
          user: {
            name: "Thomas Chen",
            avatar: "",
            initials: "TC"
          }
        }
      ],
      upcomingEvents: [
        {
          id: 101,
          title: "Client Meeting - GlobalTech",
          date: { month: "APR", day: "15" },
          time: "10:30 AM",
          location: "Conference Room A",
          locationType: "physical",
          status: "Confirmed"
        },
        {
          id: 102,
          title: "Sales Team Weekly Sync",
          date: { month: "APR", day: "16" },
          time: "9:00 AM",
          location: "Zoom Meeting",
          locationType: "virtual",
          status: "Confirmed"
        }
      ],
      myTasks: [
        {
          id: 201,
          title: "Follow up with Acme Corp",
          dueDate: "Tomorrow",
          priority: "High"
        },
        {
          id: 202,
          title: "Prepare Q2 forecast report",
          dueDate: "Apr 20",
          priority: "Medium"
        },
        {
          id: 203,
          title: "Update lead qualification criteria",
          dueDate: "Apr 22",
          priority: "Normal"
        }
      ],
    };
  }
}
