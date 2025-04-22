import { ProposalElement } from '@shared/schema';
import { TextElementEditor } from './text-element-editor';
import { HeaderElementEditor } from './header-element-editor';
import { ImageElementEditor } from './image-element-editor';
import { TableElementEditor } from './table-element-editor';
import { ListElementEditor } from './list-element-editor';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

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

  switch (element.elementType) {
    case 'Text':
      return (
        <TextElementEditor 
          element={element} 
          onChange={onChange} 
          disabled={disabled} 
        />
      );
      
    case 'Header':
      return (
        <HeaderElementEditor 
          element={element} 
          onChange={onChange} 
          disabled={disabled} 
        />
      );
      
    case 'Image':
      return (
        <ImageElementEditor 
          element={element} 
          onChange={onChange} 
          disabled={disabled} 
        />
      );
      
    case 'Table':
      return (
        <TableElementEditor 
          element={element} 
          onChange={onChange} 
          disabled={disabled} 
        />
      );
      
    case 'List':
      return (
        <ListElementEditor 
          element={element} 
          onChange={onChange} 
          disabled={disabled} 
        />
      );
      
    // For other element types, we'll add specific editors later
    default:
      return (
        <div className="p-4 border rounded bg-gray-50">
          <p className="text-sm text-gray-500 mb-2">
            Element type <strong>{element.elementType}</strong> doesn't have a specialized editor yet.
          </p>
          <p className="text-sm text-gray-500">
            This element can still be rendered in the proposal, but editing is limited.
          </p>
        </div>
      );
  }
}