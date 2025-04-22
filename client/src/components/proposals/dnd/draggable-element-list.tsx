import React, { useState } from 'react';
import { ProposalElement } from '@shared/schema';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ElementPreview } from '../proposal-element-renderer';
import {
  Trash2,
  ChevronsUp,
  ChevronsDown,
  ChevronUp,
  ChevronDown,
  GripVertical
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DraggableElementListProps {
  elements: ProposalElement[];
  selectedElementId: number | null;
  isReadOnly: boolean;
  onSelectElement: (element: ProposalElement) => void;
  onReorderElement: (elementId: number, newIndex: number) => void;
  onDeleteElement: (elementId: number) => void;
}

export function DraggableElementList({
  elements,
  selectedElementId,
  isReadOnly,
  onSelectElement,
  onReorderElement,
  onDeleteElement
}: DraggableElementListProps) {
  const [draggedElementId, setDraggedElementId] = useState<number | null>(null);
  const [dragOverElementId, setDragOverElementId] = useState<number | null>(null);

  // Handle drag start
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, elementId: number) => {
    if (isReadOnly) return;
    
    // Set data transfer
    e.dataTransfer.setData('text/plain', elementId.toString());
    e.dataTransfer.effectAllowed = 'move';
    
    // Add a slight delay to set the drag image
    setTimeout(() => {
      const draggedElement = elements.find(el => el.id === elementId);
      if (draggedElement) {
        const element = document.getElementById(`element-${elementId}`);
        if (element) {
          element.classList.add('opacity-50', 'border-dashed');
        }
      }
    }, 0);
    
    setDraggedElementId(elementId);
  };

  // Handle drag end
  const handleDragEnd = () => {
    if (isReadOnly) return;
    
    // Reset styling
    if (draggedElementId) {
      const element = document.getElementById(`element-${draggedElementId}`);
      if (element) {
        element.classList.remove('opacity-50', 'border-dashed');
      }
    }
    
    setDraggedElementId(null);
    setDragOverElementId(null);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, elementId: number) => {
    if (isReadOnly) return;
    
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedElementId !== elementId) {
      setDragOverElementId(elementId);
    }
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetElementId: number) => {
    if (isReadOnly) return;
    
    e.preventDefault();
    
    const sourceElementId = parseInt(e.dataTransfer.getData('text/plain'), 10);
    
    if (sourceElementId !== targetElementId) {
      const sourceIndex = elements.findIndex(el => el.id === sourceElementId);
      const targetIndex = elements.findIndex(el => el.id === targetElementId);
      
      if (sourceIndex !== -1 && targetIndex !== -1) {
        onReorderElement(sourceElementId, targetIndex);
      }
    }
    
    setDraggedElementId(null);
    setDragOverElementId(null);
  };

  // Handle drag leave
  const handleDragLeave = () => {
    if (isReadOnly) return;
    setDragOverElementId(null);
  };

  // Move element up
  const moveElementUp = (elementId: number) => {
    if (isReadOnly) return;
    
    const currentIndex = elements.findIndex(el => el.id === elementId);
    if (currentIndex <= 0) return;
    
    onReorderElement(elementId, currentIndex - 1);
  };

  // Move element down
  const moveElementDown = (elementId: number) => {
    if (isReadOnly) return;
    
    const currentIndex = elements.findIndex(el => el.id === elementId);
    if (currentIndex === -1 || currentIndex >= elements.length - 1) return;
    
    onReorderElement(elementId, currentIndex + 1);
  };

  // Move element to top
  const moveElementToTop = (elementId: number) => {
    if (isReadOnly) return;
    
    const currentIndex = elements.findIndex(el => el.id === elementId);
    if (currentIndex <= 0) return;
    
    onReorderElement(elementId, 0);
  };

  // Move element to bottom
  const moveElementToBottom = (elementId: number) => {
    if (isReadOnly) return;
    
    const currentIndex = elements.findIndex(el => el.id === elementId);
    if (currentIndex === -1 || currentIndex >= elements.length - 1) return;
    
    onReorderElement(elementId, elements.length - 1);
  };

  return (
    <div className="space-y-2">
      {elements.map((element) => {
        const isSelected = selectedElementId === element.id;
        const isDragged = draggedElementId === element.id;
        const isDraggedOver = dragOverElementId === element.id;
        const elementIndex = elements.findIndex(el => el.id === element.id);
        
        return (
          <div
            id={`element-${element.id}`}
            key={element.id}
            className={cn(
              "border rounded p-2 cursor-pointer transition-all",
              isSelected && "border-primary bg-primary/5",
              isDragged && "opacity-50 border-dashed",
              isDraggedOver && "border-primary-500 bg-primary-50"
            )}
            onClick={() => onSelectElement(element)}
            draggable={!isReadOnly}
            onDragStart={(e) => handleDragStart(e, element.id)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, element.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, element.id)}
          >
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-2">
                {!isReadOnly && (
                  <div className="cursor-grab text-gray-400">
                    <GripVertical className="h-4 w-4" />
                  </div>
                )}
                <Badge variant="outline" className="text-xs font-normal">
                  {element.elementType}
                </Badge>
              </div>
              
              {!isReadOnly && isSelected && (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveElementToTop(element.id);
                    }}
                    disabled={elementIndex === 0}
                    title="Move to top"
                  >
                    <ChevronsUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveElementUp(element.id);
                    }}
                    disabled={elementIndex === 0}
                    title="Move up"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveElementDown(element.id);
                    }}
                    disabled={elementIndex === elements.length - 1}
                    title="Move down"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveElementToBottom(element.id);
                    }}
                    disabled={elementIndex === elements.length - 1}
                    title="Move to bottom"
                  >
                    <ChevronsDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-red-600 hover:text-red-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteElement(element.id);
                    }}
                    title="Delete element"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            
            <div className="text-xs truncate font-medium mb-1">{element.name}</div>
            
            {isSelected && (
              <div className="mt-2 border-t pt-2">
                <ElementPreview element={element} isSelected={isSelected} />
              </div>
            )}
          </div>
        );
      })}

      {elements.length === 0 && (
        <div className="text-center p-4 border rounded bg-gray-50 text-gray-500 text-sm">
          No elements yet. {!isReadOnly && 'Use the + button to add elements.'}
        </div>
      )}
    </div>
  );
}