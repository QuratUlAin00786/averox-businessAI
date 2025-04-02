import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Opportunities() {
  return (
    <div className="py-6">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-neutral-600 sm:text-3xl sm:truncate">
              Opportunities
            </h2>
          </div>
          <div className="flex mt-4 md:mt-0 md:ml-4">
            <Button>
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              Add Opportunity
            </Button>
          </div>
        </div>
      </div>
      
      <div className="px-4 mx-auto mt-6 max-w-7xl sm:px-6 md:px-8">
        <div className="flex items-center justify-center h-96 bg-white rounded-lg shadow">
          <p className="text-neutral-600">Opportunities management will be implemented here</p>
        </div>
      </div>
    </div>
  );
}
