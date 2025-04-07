import { TourStep } from "@/components/ui/guided-tour";

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
      target: '.dashboard-header',
      title: 'Welcome to your Dashboard',
      content: 'This is your personal dashboard where you can see an overview of your business performance, recent activities, and upcoming tasks.',
      placement: 'bottom',
    },
    {
      target: '.stats-cards',
      title: 'Performance Metrics',
      content: 'These cards show your key performance indicators like new leads, conversion rate, revenue generated, and open deals.',
      placement: 'bottom',
    },
    {
      target: '.sales-pipeline',
      title: 'Sales Pipeline',
      content: 'Here you can see your sales pipeline with the number of leads in each stage and the total value.',
      placement: 'right',
    },
    {
      target: '.tasks-section',
      title: 'Your Tasks',
      content: 'This section displays your upcoming tasks. You can create new tasks, mark them as complete, or navigate to the tasks page for more details.',
      placement: 'left',
    },
    {
      target: '.activities-section',
      title: 'Recent Activities',
      content: 'Keep track of recent activities across your team including calls, emails, meetings, and more.',
      placement: 'left',
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
      target: '.contacts-header',
      title: 'Contacts Management',
      content: 'This is where you manage all your contacts. You can add, edit, and delete contacts as well as filter and search for specific ones.',
      placement: 'bottom',
    },
    {
      target: '.contacts-search',
      title: 'Search and Filter',
      content: 'Quickly find contacts by name, email, company, or any other field using the search bar and filters.',
      placement: 'bottom',
    },
    {
      target: '.contacts-table',
      title: 'Contact List',
      content: 'This table shows all your contacts with essential information. Click on a contact to view their full details.',
      placement: 'top',
    },
    {
      target: '.contacts-add-button',
      title: 'Add New Contact',
      content: 'Click here to add a new contact to your database.',
      placement: 'left',
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
      target: '.accounts-header',
      title: 'Accounts Management',
      content: 'This is where you manage all your business accounts. You can add, edit, and delete accounts as well as filter and search for specific ones.',
      placement: 'bottom',
    },
    {
      target: '.accounts-search',
      title: 'Search and Filter',
      content: 'Quickly find accounts by name, industry, location, or any other field using the search bar and filters.',
      placement: 'bottom',
    },
    {
      target: '.accounts-table',
      title: 'Account List',
      content: 'This table shows all your accounts with essential information. Click on an account to view their full details.',
      placement: 'top',
    },
    {
      target: '.account-details-tab',
      title: 'Account Details',
      content: 'View and edit detailed information about the account including contacts, location, and business details.',
      placement: 'right',
    },
    {
      target: '.account-communications-tab',
      title: 'Account Communications',
      content: 'View all communications with this account including emails, calls, meetings, and other interactions.',
      placement: 'right',
    },
    {
      target: '.accounts-add-button',
      title: 'Add New Account',
      content: 'Click here to add a new business account to your database.',
      placement: 'left',
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
      target: '.leads-header',
      title: 'Leads Management',
      content: 'This is where you manage all your leads. You can add, edit, and delete leads as well as filter and search for specific ones.',
      placement: 'bottom',
    },
    {
      target: '.leads-search',
      title: 'Search and Filter',
      content: 'Quickly find leads by name, source, status, or any other field using the search bar and filters.',
      placement: 'bottom',
    },
    {
      target: '.leads-table',
      title: 'Lead List',
      content: 'This table shows all your leads with essential information. Click on a lead to view their full details.',
      placement: 'top',
    },
    {
      target: '.lead-status-dropdown',
      title: 'Lead Status',
      content: 'Change the status of a lead directly from this dropdown. You can mark leads as new, contacted, qualified, or converted.',
      placement: 'right',
    },
    {
      target: '.leads-add-button',
      title: 'Add New Lead',
      content: 'Click here to add a new lead to your database.',
      placement: 'left',
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
      target: '.opportunities-header',
      title: 'Opportunities Management',
      content: 'This is where you manage all your sales opportunities. You can add, edit, and delete opportunities as well as filter and search for specific ones.',
      placement: 'bottom',
    },
    {
      target: '.opportunities-search',
      title: 'Search and Filter',
      content: 'Quickly find opportunities by name, amount, stage, or any other field using the search bar and filters.',
      placement: 'bottom',
    },
    {
      target: '.opportunities-table',
      title: 'Opportunity List',
      content: 'This table shows all your opportunities with essential information. Click on an opportunity to view its full details.',
      placement: 'top',
    },
    {
      target: '.opportunity-stage-dropdown',
      title: 'Opportunity Stage',
      content: 'Change the stage of an opportunity directly from this dropdown. You can move opportunities through your sales pipeline from lead generation to closing.',
      placement: 'right',
    },
    {
      target: '.opportunity-proposal-button',
      title: 'Create Proposal',
      content: 'Click here to create a professional proposal for this opportunity with our interactive proposal builder.',
      placement: 'right',
    },
    {
      target: '.opportunities-add-button',
      title: 'Add New Opportunity',
      content: 'Click here to add a new sales opportunity to your database.',
      placement: 'left',
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
      target: '.communication-header',
      title: 'Communication Center',
      content: 'This is your unified communication center where you can manage all your interactions with leads, customers, and partners across different channels.',
      placement: 'bottom',
    },
    {
      target: '.communication-channels',
      title: 'Communication Channels',
      content: 'These tabs allow you to switch between different communication channels like Email, WhatsApp, SMS, Phone, and Social Media.',
      placement: 'right',
    },
    {
      target: '.communication-contacts',
      title: 'Contact List',
      content: 'This is a list of your contacts with whom you have ongoing conversations. Click on a contact to view your conversation history.',
      placement: 'right',
    },
    {
      target: '.communication-conversation',
      title: 'Conversation View',
      content: 'Here you can see your conversation history with the selected contact and send new messages.',
      placement: 'left',
    },
    {
      target: '.communication-compose',
      title: 'Compose Message',
      content: 'Use this area to compose and send new messages. You can also attach files, use templates, and schedule messages for later.',
      placement: 'top',
    }
  ]
};

// Settings tour
export const settingsTour: TourData = {
  id: 'settings',
  title: 'Settings Tour',
  description: 'Learn how to configure your AVEROX CRM',
  steps: [
    {
      target: '.settings-header',
      title: 'Settings',
      content: 'This is where you can configure your AVEROX CRM to match your business needs and preferences.',
      placement: 'bottom',
    },
    {
      target: '.settings-menu',
      title: 'Settings Menu',
      content: 'This menu provides access to different settings categories like profile, system, API keys, teams, data migration, and more.',
      placement: 'right',
    },
    {
      target: '.settings-profile',
      title: 'Profile Settings',
      content: 'Update your personal information, change your password, and manage your notification preferences.',
      placement: 'right',
    },
    {
      target: '.settings-system',
      title: 'System Settings',
      content: 'Configure system-wide settings like language, timezone, date format, and RTL layout.',
      placement: 'right',
    },
    {
      target: '.settings-api-keys',
      title: 'API Keys',
      content: 'Manage your API keys for integrations with external services like OpenAI, SendGrid, Twilio, and more.',
      placement: 'right',
    },
    {
      target: '.settings-teams',
      title: 'Teams',
      content: 'Create and manage teams, assign members, and set permissions for team access.',
      placement: 'right',
    },
    {
      target: '.settings-data-migration',
      title: 'Data Migration',
      content: 'Easily migrate your data from other CRM platforms like Zoho, Salesforce, MS Dynamics, and HubSpot.',
      placement: 'right',
    }
  ]
};

// Training tour
export const trainingTour: TourData = {
  id: 'training',
  title: 'Training Tour',
  description: 'Learn how to use the training and help section',
  steps: [
    {
      target: '.training-header',
      title: 'Training & Help Center',
      content: 'This is your training and help center where you can find tutorials, videos, FAQs, and resources to help you get the most out of AVEROX CRM.',
      placement: 'bottom',
    },
    {
      target: '.training-tutorials',
      title: 'Tutorials',
      content: 'Step-by-step guides to help you learn how to use different features of AVEROX CRM.',
      placement: 'bottom',
    },
    {
      target: '.training-videos',
      title: 'Video Tutorials',
      content: 'Watch video tutorials that demonstrate how to use AVEROX CRM effectively.',
      placement: 'bottom',
    },
    {
      target: '.training-faq',
      title: 'Frequently Asked Questions',
      content: 'Find answers to common questions about using AVEROX CRM.',
      placement: 'right',
    },
    {
      target: '.training-resources',
      title: 'Downloadable Resources',
      content: 'Access and download helpful resources like user guides, API documentation, and migration checklists.',
      placement: 'right',
    },
    {
      target: '.training-webinars',
      title: 'Webinars & Events',
      content: 'Register for upcoming webinars and access recordings of past events to enhance your CRM knowledge.',
      placement: 'top',
    }
  ]
};

// Accounting tour
export const accountingTour: TourData = {
  id: 'accounting',
  title: 'Accounting Tour',
  description: 'Learn how to use the accounting features',
  steps: [
    {
      target: '.accounting-header',
      title: 'Accounting Module',
      content: 'This is your accounting module where you can manage invoices, credit notes, purchasing, and more.',
      placement: 'bottom',
    },
    {
      target: '.accounting-menu',
      title: 'Accounting Menu',
      content: 'This menu provides access to different accounting features like invoices, credit notes, purchasing, and reports.',
      placement: 'right',
    },
    {
      target: '.invoices-section',
      title: 'Invoices',
      content: 'Create, manage, and track invoices for your customers. You can also set up recurring invoices and payment reminders.',
      placement: 'right',
    },
    {
      target: '.credit-notes-section',
      title: 'Credit Notes',
      content: 'Issue credit notes to customers for refunds, returns, or corrections to invoices.',
      placement: 'right',
    },
    {
      target: '.purchasing-section',
      title: 'Purchasing',
      content: 'Manage your purchases, purchase orders, and supplier payments.',
      placement: 'right',
    },
    {
      target: '.accounting-reports',
      title: 'Accounting Reports',
      content: 'Generate and view financial reports like profit and loss, balance sheet, cash flow, and tax summaries.',
      placement: 'right',
    }
  ]
};

// Inventory tour
export const inventoryTour: TourData = {
  id: 'inventory',
  title: 'Inventory Tour',
  description: 'Learn how to use the inventory management features',
  steps: [
    {
      target: '.inventory-header',
      title: 'Inventory Management',
      content: 'This is your inventory management module where you can track products, manage stock, and handle warehouse operations.',
      placement: 'bottom',
    },
    {
      target: '.inventory-menu',
      title: 'Inventory Menu',
      content: 'This menu provides access to different inventory features like products, categories, transactions, and reports.',
      placement: 'right',
    },
    {
      target: '.products-section',
      title: 'Products',
      content: 'Manage your product catalog including details like SKU, price, cost, description, and images.',
      placement: 'right',
    },
    {
      target: '.categories-section',
      title: 'Categories',
      content: 'Organize your products into categories for better management and reporting.',
      placement: 'right',
    },
    {
      target: '.transactions-section',
      title: 'Inventory Transactions',
      content: 'Track inventory movements like stock receipts, adjustments, and transfers between locations.',
      placement: 'right',
    },
    {
      target: '.inventory-reports',
      title: 'Inventory Reports',
      content: 'Generate and view reports like stock levels, inventory valuation, slow-moving items, and reorder suggestions.',
      placement: 'right',
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
  calendar: {
    id: 'calendar',
    title: 'Calendar Tour',
    description: 'Learn how to use the calendar',
    steps: [
      {
        target: '.calendar-header',
        title: 'Calendar',
        content: 'This is your calendar where you can view and manage all your appointments and events.',
        placement: 'bottom',
      }
    ]
  },
  tasks: {
    id: 'tasks',
    title: 'Tasks Tour',
    description: 'Learn how to manage your tasks',
    steps: [
      {
        target: '.tasks-header',
        title: 'Tasks Management',
        content: 'This is where you manage all your tasks and to-dos.',
        placement: 'bottom',
      }
    ]
  },
  reports: {
    id: 'reports',
    title: 'Reports Tour',
    description: 'Learn how to use reports',
    steps: [
      {
        target: '.reports-header',
        title: 'Reports',
        content: 'This is where you can generate and view various reports about your business performance.',
        placement: 'bottom',
      }
    ]
  },
  settings: settingsTour,
  intelligence: {
    id: 'intelligence',
    title: 'Intelligence Tour',
    description: 'Learn how to use AI-powered features',
    steps: [
      {
        target: '.intelligence-header',
        title: 'AI Intelligence',
        content: 'This section provides AI-powered insights and recommendations to help you make better business decisions.',
        placement: 'bottom',
      }
    ]
  },
  workflows: {
    id: 'workflows',
    title: 'Workflows Tour',
    description: 'Learn how to use workflows',
    steps: [
      {
        target: '.workflows-header',
        title: 'Workflows',
        content: 'This is where you can create automated workflows to streamline your business processes.',
        placement: 'bottom',
      }
    ]
  },
  subscriptions: {
    id: 'subscriptions',
    title: 'Subscriptions Tour',
    description: 'Learn how to manage your subscription',
    steps: [
      {
        target: '.subscriptions-header',
        title: 'Subscriptions',
        content: 'This is where you can view and manage your AVEROX CRM subscription.',
        placement: 'bottom',
      }
    ]
  },
  communicationCenter: communicationCenterTour,
  accounting: accountingTour,
  inventory: inventoryTour,
  training: trainingTour
};