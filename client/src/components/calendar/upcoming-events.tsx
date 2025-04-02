import { format, parseISO, isToday, isTomorrow, isThisWeek } from "date-fns";
import { 
  CalendarDays, 
  Clock, 
  MapPin, 
  ExternalLink,
  Video,
  Users,
  Phone
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Event } from "@shared/schema";

interface UpcomingEventsProps {
  events: Event[];
  onViewEvent: (event: Event) => void;
  onViewAll: () => void;
  isLoading?: boolean;
}

export function UpcomingEvents({ 
  events, 
  onViewEvent,
  onViewAll,
  isLoading = false
}: UpcomingEventsProps) {
  // Sort events by start date
  const sortedEvents = [...events].sort((a, b) => {
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });
  
  // Take only upcoming events (up to 5)
  const upcomingEvents = sortedEvents.filter(event => {
    const eventDate = typeof event.startDate === 'string' 
      ? parseISO(event.startDate) 
      : event.startDate;
      
    return eventDate >= new Date();
  }).slice(0, 5);
  
  const formatEventDate = (dateValue: string | Date) => {
    const date = typeof dateValue === 'string' ? parseISO(dateValue) : dateValue;
    
    if (isToday(date)) {
      return "Today";
    } else if (isTomorrow(date)) {
      return "Tomorrow";
    } else if (isThisWeek(date)) {
      return format(date, "EEEE"); // Day name
    } else {
      return format(date, "MMM d, yyyy");
    }
  };
  
  const formatEventTime = (event: Event) => {
    if (event.isAllDay) {
      return "All day";
    }
    
    const startDate = typeof event.startDate === 'string' 
      ? parseISO(event.startDate) 
      : event.startDate;
    return format(startDate, "h:mm a");
  };
  
  const getEventIcon = (event: Event) => {
    if (event.locationType === "virtual") {
      return <Video className="h-4 w-4 text-blue-500" />;
    }
    
    switch (event.eventType) {
      case "Meeting":
        return <Users className="h-4 w-4 text-indigo-500" />;
      case "Call":
        return <Phone className="h-4 w-4 text-green-500" />;
      default:
        return <CalendarDays className="h-4 w-4 text-neutral-500" />;
    }
  };
  
  const getEventStatusColor = (status: string | null) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "Tentative":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-neutral-100 text-neutral-800 border-neutral-200";
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">Upcoming Events</CardTitle>
          <Button variant="ghost" size="sm" onClick={onViewAll}>
            View all
            <ExternalLink className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className="w-14 h-14 bg-neutral-100 rounded-md animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-neutral-100 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-neutral-100 rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : upcomingEvents.length > 0 ? (
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <div 
                key={event.id} 
                className="flex items-start space-x-3 cursor-pointer hover:bg-neutral-50 rounded-md p-2 transition-colors"
                onClick={() => onViewEvent(event)}
              >
                <div className="w-14 h-14 rounded-md bg-blue-50 text-blue-600 flex flex-col items-center justify-center border border-blue-100">
                  <div className="text-xs font-medium">
                    {formatEventDate(event.startDate).includes("day") 
                      ? formatEventDate(event.startDate) 
                      : format(typeof event.startDate === 'string' ? parseISO(event.startDate) : event.startDate, "MMM")}
                  </div>
                  {!formatEventDate(event.startDate).includes("day") && (
                    <div className="text-lg font-bold">
                      {format(typeof event.startDate === 'string' ? parseISO(event.startDate) : event.startDate, "d")}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-neutral-900 truncate">{event.title}</h4>
                    <Badge variant="outline" className={getEventStatusColor(event.status)}>
                      {event.status || "Confirmed"}
                    </Badge>
                  </div>
                  
                  <div className="mt-1 text-sm space-y-1">
                    <div className="flex items-center text-neutral-500">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      <span>{formatEventTime(event)}</span>
                    </div>
                    
                    {event.location && (
                      <div className="flex items-center text-neutral-500">
                        {event.locationType === "virtual" ? (
                          <Video className="h-3.5 w-3.5 mr-1" />
                        ) : (
                          <MapPin className="h-3.5 w-3.5 mr-1" />
                        )}
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-neutral-500">
            <CalendarDays className="h-8 w-8 mx-auto text-neutral-300 mb-2" />
            <p>No upcoming events</p>
            <Button variant="link" className="mt-2" onClick={onViewAll}>
              Schedule a new event
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}