import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { apiRequest } from "@/lib/queryClient";
import { Event, InsertEvent } from "@shared/schema";
import { MonthlyCalendar } from "@/components/calendar/monthly-calendar";
import { EventForm } from "@/components/calendar/event-form";
import { EventDetail } from "@/components/calendar/event-detail";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Calendar() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Fetch events
  const { 
    data: events = [], 
    isLoading,
    isError,
    error 
  } = useQuery({ 
    queryKey: ['/api/events'], 
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to load events",
        description: error.message
      });
    }
  });
  
  // Create event mutation using standard apiRequest
  const createMutation = useMutation({
    mutationFn: (eventData: InsertEvent) => {
      console.log('Creating event with data:', eventData);
      return apiRequest('POST', '/api/events', eventData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      toast({
        title: "Event created",
        description: "Your event has been successfully created."
      });
      setIsFormOpen(false);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to create event",
        description: error.message
      });
    }
  });
  
  // Update event mutation
  const updateMutation = useMutation({
    mutationFn: (data: { id: number; event: Partial<InsertEvent> }) => {
      return apiRequest('PATCH', `/api/events/${data.id}`, data.event);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      toast({
        title: "Event updated",
        description: "Your event has been successfully updated."
      });
      setIsFormOpen(false);
      setIsDetailOpen(false);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to update event",
        description: error.message
      });
    }
  });
  
  // Delete event mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest('DELETE', `/api/events/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      toast({
        title: "Event deleted",
        description: "Your event has been successfully deleted."
      });
      setIsDetailOpen(false);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to delete event",
        description: error.message
      });
    }
  });
  
  const handleOpenCreateForm = () => {
    setSelectedEvent(null);
    setIsFormOpen(true);
  };
  
  const handleOpenEditForm = (event: Event) => {
    setSelectedEvent(event);
    setIsDetailOpen(false);
    setIsFormOpen(true);
  };
  
  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsDetailOpen(true);
  };
  
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setIsFormOpen(true);
  };
  
  const handleCreateEvent = (data: InsertEvent) => {
    createMutation.mutate(data);
  };
  
  const handleUpdateEvent = (data: InsertEvent) => {
    if (selectedEvent) {
      updateMutation.mutate({
        id: selectedEvent.id,
        event: data
      });
    }
  };
  
  const handleDeleteEvent = (event: Event) => {
    if (confirm("Are you sure you want to delete this event?")) {
      deleteMutation.mutate(event.id);
    }
  };
  


  return (
    <div className="container mx-auto py-6 space-y-8">
      <PageHeader
        title="Calendar"
        description="View and manage your events and appointments"
        actions={
          <div className="flex gap-2">
            <Button onClick={handleOpenCreateForm} className="flex items-center space-x-2">
              <PlusCircle className="h-4 w-4" />
              <span>Add Event</span>
            </Button>
          </div>
        }
      />
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-opacity-50 rounded-full border-t-transparent"></div>
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-red-500">
            <p>Failed to load calendar: {error?.message}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/events'] })}
            >
              Retry
            </Button>
          </div>
        ) : (
          <MonthlyCalendar 
            events={events}
            onEventClick={handleEventClick}
            onDateClick={handleDateClick}
          />
        )}
      </div>
      
      {/* Event Creation Status */}
      {createMutation.isPending && (
        <div className="bg-blue-50 p-4 rounded-lg flex items-center">
          <div className="animate-spin h-5 w-5 mr-2 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          <p>Creating event...</p>
        </div>
      )}
      
      {createMutation.isError && (
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="font-medium text-red-800">Error creating event:</h3>
          <pre className="mt-2 text-sm bg-white p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(createMutation.error, null, 2)}
          </pre>
        </div>
      )}
      
      {/* Event Form */}
      <EventForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={selectedEvent ? handleUpdateEvent : handleCreateEvent}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        event={selectedEvent}
      />
      
      {/* Event Detail */}
      <EventDetail
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        event={selectedEvent}
        onEdit={handleOpenEditForm}
        onDelete={handleDeleteEvent}
      />
    </div>
  );
}