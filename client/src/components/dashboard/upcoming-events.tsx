import { Button } from "@/components/ui/button";
import { MoreVertical, Clock, MapPin, Video, ChevronRight } from "lucide-react";

interface Event {
  id: number;
  title: string;
  date: {
    month: string;
    day: string;
  };
  time: string;
  location: string;
  locationType: "physical" | "virtual";
  status: "Confirmed" | "Recurring" | "Draft";
}

export function UpcomingEvents() {
  const events: Event[] = [
    {
      id: 1,
      title: "Client Presentation - Acme Corp",
      date: {
        month: "MAY",
        day: "18"
      },
      time: "10:00 AM - 11:30 AM",
      location: "Conference Room A",
      locationType: "physical",
      status: "Confirmed"
    },
    {
      id: 2,
      title: "Team Weekly Sync",
      date: {
        month: "MAY",
        day: "19"
      },
      time: "2:00 PM - 3:00 PM",
      location: "Zoom Meeting",
      locationType: "virtual",
      status: "Recurring"
    },
    {
      id: 3,
      title: "Sales Training Workshop",
      date: {
        month: "MAY",
        day: "20"
      },
      time: "9:00 AM - 12:00 PM",
      location: "Training Room B",
      locationType: "physical",
      status: "Draft"
    }
  ];

  const getStatusClass = (status: Event["status"]) => {
    switch (status) {
      case "Confirmed":
        return "bg-secondary text-white";
      case "Recurring":
        return "bg-primary-light bg-opacity-20 text-primary";
      case "Draft":
        return "bg-neutral-100 text-neutral-600";
    }
  };

  return (
    <div className="overflow-hidden bg-white rounded-lg shadow">
      <div className="px-4 py-5 border-b border-neutral-200 sm:px-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium leading-6 text-neutral-700">Upcoming Events</h3>
          <div className="flex">
            <Button variant="ghost" size="icon" className="p-1 ml-3 text-neutral-400 hover:text-neutral-500">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
      <ul className="divide-y divide-neutral-200">
        {events.map((event) => (
          <li key={event.id}>
            <div className="block hover:bg-neutral-50">
              <div className="flex items-center px-4 py-4 sm:px-6">
                <div className="flex-shrink-0">
                  <div className="flex flex-col items-center justify-center w-10 h-14 bg-primary-light bg-opacity-10 rounded-md">
                    <span className="text-xs font-medium text-primary">{event.date.month}</span>
                    <span className="text-lg font-bold text-primary-dark">{event.date.day}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0 px-4">
                  <div>
                    <p className="text-sm font-medium text-neutral-700 truncate">{event.title}</p>
                    <div className="flex mt-1">
                      <div className="flex items-center text-sm text-neutral-500">
                        <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-neutral-400" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center ml-4 text-sm text-neutral-500">
                        {event.locationType === "physical" ? (
                          <MapPin className="flex-shrink-0 mr-1.5 h-5 w-5 text-neutral-400" />
                        ) : (
                          <Video className="flex-shrink-0 mr-1.5 h-5 w-5 text-neutral-400" />
                        )}
                        <span>{event.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(event.status)}`}>
                    {event.status}
                  </span>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="px-4 py-3 bg-neutral-50 text-center sm:px-6">
        <Button variant="outline" className="text-neutral-700 border-neutral-200 shadow-sm">
          View Calendar
          <ChevronRight className="w-5 h-5 ml-2 -mr-1" />
        </Button>
      </div>
    </div>
  );
}
