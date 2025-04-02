import { useState, useEffect, useMemo } from "react";
import { 
  add, 
  eachDayOfInterval, 
  endOfMonth, 
  format, 
  getDay, 
  isEqual, 
  isSameDay, 
  isSameMonth, 
  isToday, 
  parse, 
  startOfToday, 
  endOfDay,
  startOfDay,
  isWithinInterval,
  parseISO,
} from "date-fns";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  MapPin 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Event } from "@shared/schema";

interface MonthlyCalendarProps {
  events: Event[];
  onEventClick: (event: Event) => void;
  onDateClick: (date: Date) => void;
}

export function MonthlyCalendar({ events, onEventClick, onDateClick }: MonthlyCalendarProps) {
  const today = startOfToday();
  const [selectedDay, setSelectedDay] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(format(today, "MMM-yyyy"));
  
  const firstDayCurrentMonth = useMemo(() => parse(currentMonth, "MMM-yyyy", new Date()), [currentMonth]);
  
  const days = useMemo(() => eachDayOfInterval({
    start: firstDayCurrentMonth,
    end: endOfMonth(firstDayCurrentMonth),
  }), [firstDayCurrentMonth]);
  
  const previousMonth = () => {
    const firstDayPreviousMonth = add(firstDayCurrentMonth, { months: -1 });
    setCurrentMonth(format(firstDayPreviousMonth, "MMM-yyyy"));
  };
  
  const nextMonth = () => {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 });
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"));
  };
  
  // Determine which events occur on each day
  const eventsOnDate = (date: Date) => {
    return events.filter(event => {
      // Convert string dates to Date objects
      const eventStart = typeof event.startDate === 'string' 
        ? parseISO(event.startDate) 
        : event.startDate;
        
      const eventEnd = typeof event.endDate === 'string' 
        ? parseISO(event.endDate) 
        : event.endDate;
      
      // Check if the day is within event range
      return isWithinInterval(date, {
        start: startOfDay(eventStart),
        end: endOfDay(eventEnd)
      });
    });
  };
  
  // Format day events for display
  const formatEventTime = (event: Event) => {
    const startDate = new Date(event.startDate);
    
    if (event.isAllDay) {
      return "All day";
    }
    
    return format(startDate, "h:mm a");
  };

  // Get first day of month offset (0 = Sunday, 1 = Monday, etc.)
  const startingDayIndex = getDay(firstDayCurrentMonth);
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-xl text-neutral-900">
          {format(firstDayCurrentMonth, "MMMM yyyy")}
        </h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={previousMonth}>
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Previous month</span>
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-5 w-5" />
            <span className="sr-only">Next month</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              setCurrentMonth(format(today, "MMM-yyyy"));
              setSelectedDay(today);
            }}
          >
            Today
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-px bg-neutral-200 border border-neutral-200 rounded-lg overflow-hidden">
        {/* Calendar header - day names */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="bg-white p-2 text-center font-medium text-neutral-500">
            {day}
          </div>
        ))}
        
        {/* Empty cells for days not in current month */}
        {Array.from({ length: startingDayIndex }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-white p-2 h-32 min-h-[8rem]" />
        ))}
        
        {/* Calendar days */}
        {days.map((day) => {
          // Get events for this day
          const dayEvents = eventsOnDate(day);
          const isSelected = isSameDay(day, selectedDay);
          
          return (
            <div
              key={day.toString()}
              className={cn(
                "bg-white p-2 min-h-[8rem] max-h-32 overflow-y-auto transition-colors",
                isSelected ? "bg-blue-50" : "",
                !isSameMonth(day, firstDayCurrentMonth) ? "text-neutral-300" : "",
                isToday(day) ? "border border-blue-500" : "",
                isSelected ? "border border-blue-700" : "",
              )}
              onClick={() => {
                setSelectedDay(day);
                onDateClick(day);
              }}
            >
              <div className="flex justify-between items-start">
                <time
                  dateTime={format(day, "yyyy-MM-dd")}
                  className={cn(
                    "font-semibold text-sm",
                    isToday(day) ? "text-blue-600" : "",
                    isSameMonth(day, firstDayCurrentMonth) ? "text-neutral-900" : "text-neutral-400",
                  )}
                >
                  {format(day, "d")}
                </time>
              </div>
              
              {/* Events list */}
              <div className="mt-1 space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                    className={cn(
                      "px-2 py-1 text-xs rounded-md truncate cursor-pointer",
                      event.status === "Cancelled" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800",
                      event.status === "Tentative" ? "bg-yellow-100 text-yellow-800" : "",
                    )}
                  >
                    <div className="font-medium truncate">{event.title}</div>
                    <div className="flex items-center text-xs space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatEventTime(event)}</span>
                    </div>
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-neutral-500 pl-2">
                    + {dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}