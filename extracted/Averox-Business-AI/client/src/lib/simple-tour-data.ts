import { TourStep } from "@/components/ui/simple-tour";

// Types of tours
export type TourType = 
  | 'dashboard'
  | 'contacts'
  | 'accounts'
  | 'leads'
  | 'opportunities'
  | 'calendar'
  | 'tasks'
  | 'reports'
  | 'settings'
  | 'intelligence'
  | 'workflows'
  | 'subscriptions'
  | 'communicationCenter'
  | 'accounting'
  | 'inventory'
  | 'training';

// Interface for a complete tour
export interface TourData {
  id: TourType;
  title: string;
  description: string;
  steps: TourStep[];
}

// Dashboard tour
export const dashboardTour: TourData = {
  id: 'dashboard',
  title: 'Dashboard Tour',
  description: 'Learn how to navigate and use the dashboard effectively',
  steps: [
    {
      title: 'Welcome to Your AVEROX CRM Dashboard',
      content: 'This is your personalized dashboard that gives you a complete overview of your business activities. From here, you can monitor performance metrics, track your sales pipeline, manage tasks, and view recent activities across your organization.',
    },
    {
      title: 'Personalized Greeting',
      content: 'Notice the personalized greeting that changes based on the time of day (Good morning, Good afternoon, or Good evening) along with your name. The current date is also displayed for your reference.',
    },
    {
      title: 'Action Buttons',
      content: 'These buttons at the top right allow you to export dashboard data as a CSV file or create new reports. Try clicking the Export button to download your current dashboard data for offline analysis.',
    },
    {
      title: 'New Leads Metric',
      content: 'This special card highlights new leads that have entered your pipeline. The percentage indicates the change compared to the previous period. You can click on this card to navigate directly to your leads page.',
    },
    {
      title: 'Key Performance Indicators',
      content: 'These metric cards show critical business performance data including conversion rates, revenue generated, and number of open deals. Each card displays the current value and the percentage change compared to the previous period.',
    },
    {
      title: 'Sales Pipeline Visualization',
      content: 'This chart visualizes your entire sales process from lead generation to closing deals. Each stage shows the number of opportunities and their total value. You can see at a glance where prospects are in your sales funnel.',
    },
    {
      title: 'Pipeline Stage Details',
      content: 'Each column in the pipeline chart represents a different stage in your sales process. The height of the bar indicates the total value of opportunities at that stage, while the percentage shows the proportion of your total pipeline value.',
    },
    {
      title: 'Recent Activities Feed',
      content: 'This section displays the latest actions performed by you and your team members. It includes calls made, emails sent, meetings scheduled, and other important interactions with leads and customers.',
    },
    {
      title: 'Activity Details',
      content: 'Each activity entry shows who performed the action, what they did, and when it happened. This helps you stay informed about all customer interactions across your organization.',
    },
    {
      title: 'Tasks Management',
      content: 'The Tasks section shows your upcoming responsibilities with due dates. You can quickly see what needs your attention today, tomorrow, this week, or later.',
    },
    {
      title: 'Task Creation and Management',
      content: 'You can create new tasks directly from this section using the "Create New Task" button. Tasks can be marked as complete by clicking the checkbox next to them.',
    },
    {
      title: 'Upcoming Events',
      content: 'This section displays scheduled events like meetings, calls, and deadlines. It helps you prepare for upcoming engagements with clients and team members.',
    },
    {
      title: 'Navigation and Customization',
      content: 'Use the sidebar on the left to navigate to different sections of AVEROX CRM. You can access detailed views of your contacts, accounts, leads, opportunities, and more. The dashboard automatically refreshes to show you the most up-to-date information.',
    },
    {
      title: 'Tour Help Button',
      content: 'You can restart this tour at any time by clicking the help button in the bottom right corner of the screen. Similar help buttons are available throughout AVEROX CRM to guide you through different features.',
    }
  ]
};

// Contacts tour
export const contactsTour: TourData = {
  id: 'contacts',
  title: 'Contacts Tour',
  description: 'Learn how to manage your contacts effectively',
  steps: [
    {
      title: 'Contacts Management',
      content: 'This is where you manage all your contacts. You can add, edit, and delete contacts as well as filter and search for specific ones.',
    },
    {
      title: 'Search and Filter',
      content: 'Quickly find contacts by name, email, company, or any other field using the search bar and filters.',
    },
    {
      title: 'Contact List',
      content: 'This table shows all your contacts with essential information. Click on a contact to view their full details.',
    },
    {
      title: 'Add New Contact',
      content: 'Click the Add button to add a new contact to your database.',
    }
  ]
};

// Accounts tour
export const accountsTour: TourData = {
  id: 'accounts',
  title: 'Accounts Tour',
  description: 'Learn how to manage your accounts effectively',
  steps: [
    {
      title: 'Accounts Management',
      content: 'This is where you manage all your business accounts. You can add, edit, and delete accounts as well as filter and search for specific ones.',
    },
    {
      title: 'Search and Filter',
      content: 'Quickly find accounts by name, industry, location, or any other field using the search bar and filters.',
    },
    {
      title: 'Account List',
      content: 'This table shows all your accounts with essential information. Click on an account to view their full details.',
    },
    {
      title: 'Account Details',
      content: 'View and edit detailed information about the account including contacts, location, and business details.',
    },
    {
      title: 'Account Communications',
      content: 'View all communications with this account including emails, calls, meetings, and other interactions.',
    },
    {
      title: 'Add New Account',
      content: 'Click the Add button to add a new business account to your database.',
    }
  ]
};

// Leads tour
export const leadsTour: TourData = {
  id: 'leads',
  title: 'Leads Tour',
  description: 'Learn how to manage your leads effectively',
  steps: [
    {
      title: 'Leads Management',
      content: 'This is where you manage all your leads. You can add, edit, and delete leads as well as filter and search for specific ones.',
    },
    {
      title: 'Search and Filter',
      content: 'Quickly find leads by name, source, status, or any other field using the search bar and filters.',
    },
    {
      title: 'Lead List',
      content: 'This table shows all your leads with essential information. Click on a lead to view their full details.',
    },
    {
      title: 'Lead Status',
      content: 'Change the status of a lead directly from this dropdown. You can mark leads as new, contacted, qualified, or converted.',
    },
    {
      title: 'Add New Lead',
      content: 'Click the Add button to add a new lead to your database.',
    }
  ]
};

// Opportunities tour
export const opportunitiesTour: TourData = {
  id: 'opportunities',
  title: 'Opportunities Tour',
  description: 'Learn how to manage your sales opportunities effectively',
  steps: [
    {
      title: 'Opportunities Management',
      content: 'This is where you manage all your sales opportunities. You can add, edit, and delete opportunities as well as filter and search for specific ones.',
    },
    {
      title: 'Search and Filter',
      content: 'Quickly find opportunities by name, amount, stage, or any other field using the search bar and filters.',
    },
    {
      title: 'Opportunity List',
      content: 'This table shows all your opportunities with essential information. Click on an opportunity to view its full details.',
    },
    {
      title: 'Opportunity Stage',
      content: 'Change the stage of an opportunity directly from this dropdown. You can move opportunities through your sales pipeline from lead generation to closing.',
    },
    {
      title: 'Create Proposal',
      content: 'Click the Create Proposal button to create a professional proposal for this opportunity with our interactive proposal builder.',
    },
    {
      title: 'Add New Opportunity',
      content: 'Click the Add button to add a new sales opportunity to your database.',
    }
  ]
};

// Communication Center tour
export const communicationCenterTour: TourData = {
  id: 'communicationCenter',
  title: 'Communication Center Tour',
  description: 'Learn how to use the unified communication center',
  steps: [
    {
      title: 'Communication Center',
      content: 'This is your unified communication center where you can manage all your interactions with leads, customers, and partners across different channels.',
    },
    {
      title: 'Communication Channels',
      content: 'These tabs allow you to switch between different communication channels like Email, WhatsApp, SMS, Phone, and Social Media.',
    },
    {
      title: 'Contact List',
      content: 'This is a list of your contacts with whom you have ongoing conversations. Click on a contact to view your conversation history.',
    },
    {
      title: 'Conversation View',
      content: 'Here you can see your conversation history with the selected contact and send new messages.',
    },
    {
      title: 'Compose Message',
      content: 'Use this area to compose and send new messages. You can also attach files, use templates, and schedule messages for later.',
    }
  ]
};

// Collection of all tours
export const allTours: Record<TourType, TourData> = {
  dashboard: dashboardTour,
  contacts: contactsTour,
  accounts: accountsTour,
  leads: leadsTour,
  opportunities: opportunitiesTour,
  communicationCenter: communicationCenterTour,
  calendar: {
    id: 'calendar',
    title: 'Calendar Tour',
    description: 'Learn how to use the calendar',
    steps: [
      {
        title: 'Calendar',
        content: 'This is your calendar where you can view and manage all your appointments and events.',
      }
    ]
  },
  tasks: {
    id: 'tasks',
    title: 'Tasks Tour',
    description: 'Learn how to manage your tasks',
    steps: [
      {
        title: 'Tasks Management',
        content: 'This is where you manage all your tasks and to-dos.',
      }
    ]
  },
  reports: {
    id: 'reports',
    title: 'Reports Tour',
    description: 'Learn how to use reports',
    steps: [
      {
        title: 'Reports',
        content: 'This is where you can generate and view various reports about your business performance.',
      }
    ]
  },
  settings: {
    id: 'settings',
    title: 'Settings Tour',
    description: 'Learn how to configure AVEROX CRM',
    steps: [
      {
        title: 'Settings',
        content: 'This is where you can configure your AVEROX CRM to match your business needs and preferences.',
      }
    ]
  },
  intelligence: {
    id: 'intelligence',
    title: 'Intelligence Tour',
    description: 'Learn how to use AI-powered features',
    steps: [
      {
        title: 'AI Intelligence',
        content: 'This section provides AI-powered insights and recommendations to help you make better business decisions.',
      }
    ]
  },
  workflows: {
    id: 'workflows',
    title: 'Workflows Tour',
    description: 'Learn how to use workflows',
    steps: [
      {
        title: 'Workflows',
        content: 'This is where you can create automated workflows to streamline your business processes.',
      }
    ]
  },
  subscriptions: {
    id: 'subscriptions',
    title: 'Subscriptions Tour',
    description: 'Learn how to manage your subscription',
    steps: [
      {
        title: 'Subscriptions',
        content: 'This is where you can view and manage your AVEROX CRM subscription.',
      }
    ]
  },
  accounting: {
    id: 'accounting',
    title: 'Accounting Tour',
    description: 'Learn how to use the accounting features',
    steps: [
      {
        title: 'Accounting Module',
        content: 'This is your accounting module where you can manage invoices, credit notes, purchasing, and more.',
      }
    ]
  },
  inventory: {
    id: 'inventory',
    title: 'Inventory Tour',
    description: 'Learn how to use the inventory management features',
    steps: [
      {
        title: 'Inventory Management',
        content: 'This is your inventory management module where you can track products, manage stock, and handle warehouse operations.',
      }
    ]
  },
  training: {
    id: 'training',
    title: 'Training Tour',
    description: 'Learn how to use the training and help section',
    steps: [
      {
        title: 'Training & Help Center',
        content: 'This is your training and help center where you can find tutorials, videos, FAQs, and resources to help you get the most out of AVEROX CRM.',
      }
    ]
  }
};