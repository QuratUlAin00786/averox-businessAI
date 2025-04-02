import { format, parseISO } from "date-fns";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Repeat,
  Users,
  Trash,
  Edit,
  AlertTriangle
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Event } from "@shared/schema";

interface EventDetailProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
}

export function EventDetail({
  isOpen,
  onClose,
  event,
  onEdit,
  onDelete
}: EventDetailProps) {
  if (!event) return null;

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, "PPP");
  };

  const formatTime = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, "h:mm a");
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "Meeting":
        return <Users className="h-4 w-4" />;
      case "Call":
        return <Clock className="h-4 w-4" />;
      default:
        return <CalendarIcon className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "Confirmed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Confirmed</Badge>;
      case "Tentative":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Tentative</Badge>;
      case "Cancelled":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
      default:
        return null;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <div className="flex justify-between items-start">
            <SheetTitle className="text-xl font-bold pr-10">{event.title}</SheetTitle>
            {getStatusBadge(event.status)}
          </div>
          <SheetDescription>
            <div className="flex items-center text-sm text-neutral-500 mt-1">
              {getEventTypeIcon(event.eventType || "Meeting")}
              <span className="ml-1">{event.eventType || "Meeting"}</span>
            </div>
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          <div className="space-y-4">
            {/* Date and time section */}
            <div className="flex items-start space-x-3">
              <CalendarIcon className="h-5 w-5 text-neutral-500 mt-0.5" />
              <div>
                <p className="font-medium text-neutral-900">
                  {formatDate(event.startDate)}
                  {!isSameDate(event.startDate, event.endDate) && (
                    <> - {formatDate(event.endDate)}</>
                  )}
                </p>
                {!event.isAllDay && (
                  <p className="text-sm text-neutral-500">
                    {formatTime(event.startDate)} - {formatTime(event.endDate)}
                  </p>
                )}
                {event.isAllDay && (
                  <p className="text-sm text-neutral-500">All day</p>
                )}
              </div>
            </div>

            {/* Location section */}
            {event.location && (
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-neutral-500 mt-0.5" />
                <div>
                  <p className="font-medium text-neutral-900">{event.location}</p>
                  <p className="text-sm text-neutral-500">
                    {event.locationType === "physical" ? "In-Person" : "Virtual"}
                  </p>
                </div>
              </div>
            )}

            {/* Recurring info */}
            {event.isRecurring && (
              <div className="flex items-start space-x-3">
                <Repeat className="h-5 w-5 text-neutral-500 mt-0.5" />
                <div>
                  <p className="font-medium text-neutral-900">Recurring Event</p>
                  <p className="text-sm text-neutral-500 capitalize">
                    {event.recurringRule || ""}
                  </p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Description */}
          {event.description && (
            <div>
              <h3 className="font-medium text-neutral-900 mb-2">Description</h3>
              <p className="text-sm text-neutral-600 whitespace-pre-wrap">{event.description}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex space-x-2 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onEdit(event)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => onDelete(event)}
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Helper function to check if two dates are on the same day
function isSameDate(date1: string | Date, date2: string | Date) {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}