import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";

interface EntityNotesProps {
  entityId: number;
  entityType: 'contact' | 'account' | 'lead' | 'opportunity';
  notes: string | null;
  onSaveNotes: (id: number, notes: string) => void;
  isSubmittingNotes: boolean;
}

export function EntityNotes({ 
  entityId, 
  entityType,
  notes: initialNotes, 
  onSaveNotes, 
  isSubmittingNotes 
}: EntityNotesProps) {
  const [notes, setNotes] = useState<string>(initialNotes || "");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const previousNotesRef = useRef<string>(initialNotes || "");
  
  const handleEditNotes = () => {
    setIsEditing(true);
  };
  
  const handleCancelEdit = () => {
    setNotes(previousNotesRef.current);
    setIsEditing(false);
  };
  
  const handleSaveNotes = () => {
    onSaveNotes(entityId, notes);
    previousNotesRef.current = notes;
    setIsEditing(false);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };
  
  const getEntityTypeLabel = () => {
    switch(entityType) {
      case 'contact': return 'contact';
      case 'account': return 'account';
      case 'lead': return 'lead';
      case 'opportunity': return 'opportunity';
      default: return 'record';
    }
  };
  
  return (
    <div className="space-y-4">
      {isEditing ? (
        <>
          <Textarea
            value={notes}
            onChange={handleChange}
            placeholder={`Add notes about this ${getEntityTypeLabel()}...`}
            className="min-h-[200px] resize-none"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleCancelEdit}
              disabled={isSubmittingNotes}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveNotes}
              disabled={isSubmittingNotes || notes === previousNotesRef.current}
            >
              {isSubmittingNotes ? (
                <span className="flex items-center">
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
                  Saving...
                </span>
              ) : (
                <span className="flex items-center">
                  <Save className="mr-2 h-4 w-4" />
                  Save Notes
                </span>
              )}
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="rounded-md border border-border bg-card p-4 min-h-[200px]">
            {notes ? (
              <div className="whitespace-pre-wrap">{notes}</div>
            ) : (
              <p className="text-neutral-500">No notes yet for this {getEntityTypeLabel()}.</p>
            )}
          </div>
          <div className="flex justify-end">
            <Button onClick={handleEditNotes} variant="outline">
              Edit Notes
            </Button>
          </div>
        </>
      )}
    </div>
  );
}