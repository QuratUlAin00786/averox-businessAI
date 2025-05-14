import { ProposalElement } from '@shared/schema';
import { TextElementEditor } from './text-element-editor';
import { HeaderElementEditor } from './header-element-editor';
import { ImageElementEditor } from './image-element-editor';
import { TableElementEditor } from './table-element-editor';
import { ListElementEditor } from './list-element-editor';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { getDefaultContent } from '../proposal-element-renderer';

// Export default content templates for when new elements are created
export const getDefaultElementContent = (type: string) => {
  return getDefaultContent(type);
};

export interface ElementEditorFactoryProps {
  element: ProposalElement;
  onSave: (updatedElement: ProposalElement) => void;
  isReadOnly?: boolean;
}

export function ElementEditorFactory({ element, onSave, isReadOnly = false }: ElementEditorFactoryProps) {
  if (!element || !element.elementType) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Invalid element or missing element type.
        </AlertDescription>
      </Alert>
    );
  }
  
  // Create a copy to avoid directly mutating the original
  const elementCopy = { ...element };
  
  // Ensure content is properly initialized
  if (!elementCopy.content || (typeof elementCopy.content === 'string' && elementCopy.content === '')) {
    try {
      console.log("Initializing default content for", elementCopy.elementType);
      elementCopy.content = getDefaultElementContent(elementCopy.elementType);
    } catch (error) {
      console.error("Error setting default content:", error);
    }
  }
  
  // Parse string content into object if needed with better error handling
  if (typeof elementCopy.content === 'string') {
    try {
      const contentStr = elementCopy.content.trim();
      
      // Only try to parse if it looks like JSON (starts with { or [)
      if (contentStr && (contentStr.startsWith('{') || contentStr.startsWith('['))) {
        try {
          const parsedContent = JSON.parse(contentStr);
          console.log("Parsed content from string:", parsedContent);
          elementCopy.content = parsedContent;
        } catch (parseError) {
          console.error("Error parsing content JSON:", parseError, "Content:", contentStr);
          // If JSON parsing fails but we have content, use the string as-is
          // This helps with plain text that might have been stored as a string
          if (contentStr.length > 0 && elementCopy.elementType === 'Text') {
            console.log("Using string content as text:", contentStr);
            elementCopy.content = { text: contentStr };
          } else {
            // For non-text elements or empty content, use default
            console.log("Using default content for", elementCopy.elementType);
            elementCopy.content = getDefaultElementContent(elementCopy.elementType);
          }
        }
      } else if (contentStr.length > 0) {
        // If content doesn't look like JSON but has text, use it directly for text elements
        if (elementCopy.elementType === 'Text') {
          console.log("Using plain string content as text:", contentStr);
          elementCopy.content = { text: contentStr };
        } else {
          console.log("String content doesn't look like JSON, using default for", elementCopy.elementType);
          elementCopy.content = getDefaultElementContent(elementCopy.elementType);
        }
      } else {
        // Empty content, use default
        console.log("Empty content string, using default for", elementCopy.elementType);
        elementCopy.content = getDefaultElementContent(elementCopy.elementType);
      }
    } catch (error) {
      console.error("Unexpected error handling content:", error);
      elementCopy.content = getDefaultElementContent(elementCopy.elementType);
    }
  }

  try {
    switch (elementCopy.elementType) {
      case 'Text':
        return (
          <TextElementEditor 
            element={elementCopy} 
            onChange={onSave} 
            disabled={isReadOnly} 
          />
        );
        
      case 'Header':
        return (
          <HeaderElementEditor 
            element={elementCopy} 
            onChange={onSave} 
            disabled={isReadOnly} 
          />
        );
        
      case 'Image':
        return (
          <ImageElementEditor 
            element={elementCopy} 
            onChange={onSave} 
            disabled={isReadOnly} 
          />
        );
        
      case 'Table':
        return (
          <TableElementEditor 
            element={elementCopy} 
            onChange={onSave} 
            disabled={isReadOnly} 
          />
        );
        
      case 'List':
        return (
          <ListElementEditor 
            element={elementCopy} 
            onChange={onSave} 
            disabled={isReadOnly} 
          />
        );
        
      // For other element types, we'll add specific editors later
      default:
        return (
          <div className="p-4 border rounded bg-gray-50">
            <p className="text-sm text-gray-500 mb-2">
              Element type <strong>{elementCopy.elementType}</strong> doesn't have a specialized editor yet.
            </p>
            <p className="text-sm text-gray-500">
              This element can still be rendered in the proposal, but editing is limited.
            </p>
          </div>
        );
    }
  } catch (error: any) {
    console.error("Error rendering element editor:", error, element);
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error rendering editor for {element.elementType}: {error.message || 'Unknown error'}
        </AlertDescription>
      </Alert>
    );
  }
}