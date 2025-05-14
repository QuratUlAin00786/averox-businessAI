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
  
  // Get default content for this element type
  const defaultContent = getDefaultElementContent(elementCopy.elementType);
  
  // Process content based on data type
  try {
    console.log("Processing element content");
    
    // If content is undefined/null, use default content
    if (!elementCopy.content) {
      console.log("No content found, using default");
      elementCopy.content = defaultContent;
    }
    // If content is a string, try to parse it as JSON
    else if (typeof elementCopy.content === 'string') {
      try {
        const parsedContent = JSON.parse(elementCopy.content);
        console.log("Successfully parsed string content as JSON");
        elementCopy.content = parsedContent;
      } catch (parseError) {
        console.log("Content is a string but not valid JSON, using as raw text");
        // For text elements, we can use the string directly
        if (elementCopy.elementType === 'Text') {
          elementCopy.content = { text: elementCopy.content };
        } else {
          // For other element types, use default content
          elementCopy.content = defaultContent;
        }
      }
    }
    // Handle content that's already in proper object format
    else if (typeof elementCopy.content === 'object') {
      // No conversion needed, content is already an object
      console.log("Content is already an object, using as is");
    }
    else {
      // Fallback for unknown content format
      console.warn("Unknown content format, using default");
      elementCopy.content = defaultContent;
    }
  } catch (error) {
    console.error("Error processing content:", error);
    elementCopy.content = defaultContent;
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