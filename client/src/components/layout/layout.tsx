import { useState } from "react";
import Sidebar from "./sidebar";
import TopBar from "./topbar";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar for desktop */}
      <Sidebar className="hidden md:flex" />
      
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Dark overlay */}
          <div 
            className="fixed inset-0 bg-neutral-600 bg-opacity-75 transition-opacity" 
            onClick={closeSidebar}
            aria-hidden="true"
          ></div>
          
          {/* Sidebar */}
          <div className="fixed inset-y-0 left-0 flex max-w-xs w-full">
            <div className="relative flex flex-col w-full max-w-xs bg-white">
              {/* Close button */}
              <div className="absolute top-0 right-0 pt-2 -mr-12">
                <button
                  type="button"
                  className="flex items-center justify-center w-10 h-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={closeSidebar}
                >
                  <span className="sr-only">Close sidebar</span>
                  <svg className="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Sidebar content */}
              <div className="h-full overflow-y-auto">
                <Sidebar />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Main content */}
      <div className="flex flex-col flex-1 w-0">
        <TopBar onToggleSidebar={toggleSidebar} />
        
        <main className="relative flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
