import { Button } from "@/components/ui/button";
import { SimpleButton } from "@/components/ui/simple-button";
import { MoreVertical, Clock, MapPin, Video, ChevronRight, Calendar, Plus } from "lucide-react";
import { Link } from "wouter";
import { UpcomingEvent } from "@/lib/data";

interface UpcomingEventsProps {
  events: UpcomingEvent[];
}

export function UpcomingEvents({ events }: UpcomingEventsProps) {
  const getStatusClass = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "bg-secondary text-white";
      case "Recurring":
        return "bg-primary bg-opacity-10 text-primary";
      case "Draft":
        return "bg-neutral-100 text-neutral-600";
      default:
        return "bg-neutral-100 text-neutral-600";
    }
  };

  return (
    <div className="overflow-hidden bg-white rounded-lg shadow">
      <div className="px-4 py-5 border-b border-neutral-200 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
          <h3 className="text-lg font-medium leading-6 text-neutral-700 mb-2 sm:mb-0">Upcoming Events</h3>
          <div className="flex">
            <SimpleButton 
              variant="outline" 
              className="border-primary text-primary hover:bg-primary hover:text-white w-full sm:w-auto"
              onClick={() => window.alert("Opening event creation form...")}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Event
            </SimpleButton>
          </div>
        </div>
      </div>
      
      {events.length > 0 ? (
        <>
          <ul className="divide-y divide-neutral-200">
            {events.map((event) => (
              <li key={event.id}>
                <SimpleButton
                  variant="ghost"
                  className="block hover:bg-neutral-50 w-full p-0 h-auto bg-transparent text-left"
                  onClick={() => window.alert(`Viewing event details: ${event.title}`)}
                >
                  <div className="flex px-4 py-4 sm:px-6">
                    <div className="flex-shrink-0">
                      <div className="flex flex-col items-center justify-center w-12 h-16 bg-primary bg-opacity-10 rounded-md">
                        <span className="text-xs font-medium text-primary">{event.date.month}</span>
                        <span className="text-lg font-bold text-primary">{event.date.day}</span>
                      </div>
                    </div>
                    <div className="flex flex-col flex-1 min-w-0 px-4">
                      <div className="flex flex-wrap justify-between items-start">
                        <p className="text-sm font-medium text-neutral-700 truncate mr-2">{event.title}</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium my-1 ${getStatusClass(event.status)}`}>
                          {event.status}
                        </span>
                      </div>
                      <div className="flex flex-col xs:flex-row gap-2 xs:gap-4 mt-1">
                        <div className="flex items-center text-sm text-neutral-500">
                          <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-neutral-400" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center text-sm text-neutral-500">
                          {event.locationType === "physical" ? (
                            <MapPin className="flex-shrink-0 mr-1.5 h-5 w-5 text-neutral-400" />
                          ) : (
                            <Video className="flex-shrink-0 mr-1.5 h-5 w-5 text-neutral-400" />
                          )}
                          <span className="truncate max-w-[150px]">{event.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </SimpleButton>
              </li>
            ))}
          </ul>
          <div className="px-4 py-3 bg-neutral-50 text-center sm:px-6">
            <SimpleButton 
              variant="outline" 
              className="text-neutral-700 border-neutral-200 shadow-sm w-full sm:w-auto"
              href="/calendar"
              onClick={() => window.alert("Navigating to calendar page...")}
            >
              View Calendar
              <ChevronRight className="w-5 h-5 ml-2 -mr-1" />
            </SimpleButton>
          </div>
        </>
      ) : (
        <div className="px-4 py-10 text-center text-neutral-500">
          <p>No upcoming events</p>
          <SimpleButton 
            variant="outline" 
            className="mt-4 text-neutral-700 border-neutral-200 shadow-sm w-full sm:w-auto"
            onClick={() => window.alert("Opening event scheduling form...")}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Schedule New Event
          </SimpleButton>
        </div>
      )}
    </div>
  );
}
