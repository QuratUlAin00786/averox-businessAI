// This file would contain data fetching and manipulation functions
// In a real implementation, these would connect to the backend APIs

// Example function for getting dashboard data
export async function getDashboardData() {
  // In a real implementation, this would fetch from an API
  return {
    stats: {
      newLeads: 34,
      conversionRate: "28.5%",
      revenue: "$24,563",
      openDeals: 18
    },
    pipeline: {
      leadGeneration: { value: "$112,000", percentage: 45 },
      qualification: { value: "$86,000", percentage: 35 },
      proposal: { value: "$65,000", percentage: 28 },
      negotiation: { value: "$42,000", percentage: 18 },
      closing: { value: "$24,500", percentage: 12 }
    },
    activities: [
      {
        id: 1,
        user: "Sarah Johnson",
        action: "created a new lead",
        detail: "Acme Corporation - Technology Services",
        time: "35 minutes ago"
      },
      // More activities...
    ],
    tasks: [
      {
        id: "task-1",
        title: "Follow up with Acme Corp about proposal",
        dueDate: "Due today",
        priority: "High"
      },
      // More tasks...
    ],
    events: [
      {
        id: 1,
        title: "Client Presentation - Acme Corp",
        date: { month: "MAY", day: "18" },
        time: "10:00 AM - 11:30 AM",
        location: "Conference Room A",
        status: "Confirmed"
      },
      // More events...
    ]
  };
}
