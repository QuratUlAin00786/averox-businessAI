import { ProposalElement } from '@shared/schema';

// Define type for text element content
export interface TextElementContent {
  text: string;
  [key: string]: any; // Allow for other properties
}

// Common interface for all element editors
export interface ElementEditorProps {
  element: ProposalElement;
  onChange: (updatedElement: ProposalElement) => void;
  disabled?: boolean;
}