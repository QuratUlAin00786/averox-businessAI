import { ProposalElement } from '@shared/schema';

// Common interface for all element editors
export interface ElementEditorProps {
  element: ProposalElement;
  onChange: (updatedElement: ProposalElement) => void;
  disabled?: boolean;
}