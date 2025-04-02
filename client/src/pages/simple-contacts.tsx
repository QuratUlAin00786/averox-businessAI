import { useQuery } from "@tanstack/react-query";
import { Contact } from "@shared/schema";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function SimpleContacts() {
  // TanStack Query approach
  const {
    data: contacts = [],
    isLoading,
    error,
  } = useQuery<Contact[], Error>({
    queryKey: ["/api/contacts"],
  });
  
  // Direct fetch approach
  const [directContacts, setDirectContacts] = useState<Contact[]>([]);
  const [directLoading, setDirectLoading] = useState(false);
  const [directError, setDirectError] = useState<Error | null>(null);
  
  const fetchContactsDirectly = async () => {
    setDirectLoading(true);
    setDirectError(null);
    
    try {
      console.log("Fetching contacts directly...");
      const response = await fetch("/api/contacts");
      console.log("Direct fetch response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Direct fetch data:", data);
      setDirectContacts(data || []);
    } catch (err) {
      console.error("Direct fetch error:", err);
      setDirectError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setDirectLoading(false);
    }
  };
  
  // Testing API endpoints
  const testEndpoints = async () => {
    try {
      console.log("Testing dashboard endpoint...");
      const dashboardRes = await fetch("/api/dashboard/stats");
      console.log("Dashboard stats status:", dashboardRes.status);
      if (dashboardRes.ok) {
        const dashData = await dashboardRes.json();
        console.log("Dashboard data:", dashData);
      }
      
      console.log("Testing tasks endpoint...");
      const tasksRes = await fetch("/api/tasks");
      console.log("Tasks status:", tasksRes.status);
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        console.log("Tasks data:", tasksData);
      }
      
      console.log("Testing contacts endpoint...");
      const contactsRes = await fetch("/api/contacts");
      console.log("Contacts status:", contactsRes.status);
      if (contactsRes.ok) {
        const contactsData = await contactsRes.json();
        console.log("Contacts data:", contactsData);
      }
    } catch (err) {
      console.error("Test endpoints error:", err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Simple Contacts Page</h1>
      
      <div className="mb-6 space-y-2">
        <Button onClick={fetchContactsDirectly} disabled={directLoading}>
          Fetch Contacts Directly
        </Button>
        <Button variant="outline" onClick={testEndpoints} className="ml-2">
          Test API Endpoints
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* TanStack Query Results */}
        <div className="border p-6 rounded">
          <h2 className="text-xl font-bold mb-4">TanStack Query Results</h2>
          
          {isLoading && <p className="text-lg">Loading contacts...</p>}
          
          {error && (
            <div className="p-4 border border-red-200 bg-red-50 text-red-800 rounded-md mb-4">
              <h3 className="font-bold">Error</h3>
              <p>{error.message}</p>
            </div>
          )}
          
          <div className="mb-4">
            <h3 className="font-semibold mb-2">API Response Info</h3>
            <p>Total contacts: {contacts.length}</p>
          </div>
          
          {contacts.length > 0 ? (
            <div>
              <h3 className="font-semibold mb-2">Contacts</h3>
              <div className="space-y-4">
                {contacts.map(contact => (
                  <div key={contact.id} className="p-4 border rounded-md">
                    <h4 className="font-bold">
                      {contact.firstName} {contact.lastName}
                    </h4>
                    <p>{contact.email || "No email"}</p>
                    <p>{contact.phone || "No phone"}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            !isLoading && <p className="text-neutral-500">No contacts found</p>
          )}
        </div>
        
        {/* Direct Fetch Results */}
        <div className="border p-6 rounded">
          <h2 className="text-xl font-bold mb-4">Direct Fetch Results</h2>
          
          {directLoading && <p className="text-lg">Loading contacts directly...</p>}
          
          {directError && (
            <div className="p-4 border border-red-200 bg-red-50 text-red-800 rounded-md mb-4">
              <h3 className="font-bold">Error</h3>
              <p>{directError.message}</p>
            </div>
          )}
          
          <div className="mb-4">
            <h3 className="font-semibold mb-2">API Response Info</h3>
            <p>Total contacts: {directContacts.length}</p>
          </div>
          
          {directContacts.length > 0 ? (
            <div>
              <h3 className="font-semibold mb-2">Contacts</h3>
              <div className="space-y-4">
                {directContacts.map(contact => (
                  <div key={contact.id} className="p-4 border rounded-md">
                    <h4 className="font-bold">
                      {contact.firstName} {contact.lastName}
                    </h4>
                    <p>{contact.email || "No email"}</p>
                    <p>{contact.phone || "No phone"}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            !directLoading && <p className="text-neutral-500">No contacts found</p>
          )}
        </div>
      </div>
    </div>
  );
}