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

interface ElementEditorFactoryProps {
  element: ProposalElement;
  onChange: (updatedElement: ProposalElement) => void;
  disabled?: boolean;
}

export function ElementEditorFactory({ element, onChange, disabled = false }: ElementEditorFactoryProps) {
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
  
  // Parse string content into object if needed
  if (typeof elementCopy.content === 'string') {
    try {
      elementCopy.content = JSON.parse(elementCopy.content);
      console.log("Parsed content from string:", elementCopy.content);
    } catch (error) {
      console.error("Error parsing content:", error);
      // If parsing fails, set to default
      elementCopy.content = getDefaultElementContent(elementCopy.elementType);
    }
  }

  try {
    switch (elementCopy.elementType) {
      case 'Text':
        return (
          <TextElementEditor 
            element={elementCopy} 
            onChange={onChange} 
            disabled={disabled} 
          />
        );
        
      case 'Header':
        return (
          <HeaderElementEditor 
            element={elementCopy} 
            onChange={onChange} 
            disabled={disabled} 
          />
        );
        
      case 'Image':
        return (
          <ImageElementEditor 
            element={elementCopy} 
            onChange={onChange} 
            disabled={disabled} 
          />
        );
        
      case 'Table':
        return (
          <TableElementEditor 
            element={elementCopy} 
            onChange={onChange} 
            disabled={disabled} 
          />
        );
        
      case 'List':
        return (
          <ListElementEditor 
            element={elementCopy} 
            onChange={onChange} 
            disabled={disabled} 
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