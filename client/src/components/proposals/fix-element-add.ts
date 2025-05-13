import { apiRequestJson } from '@/lib/queryClient';
import { InsertProposalElement, ProposalElement } from '@shared/schema';

// Export the ProposalElementType type for use in other components
export type ProposalElementType = 'Header' | 'Text' | 'Image' | 'Table' | 'List' | 'Quote' | 'ProductList' | 'Signature' | 'PageBreak' | 'Custom';

/**
 * Create a new proposal element
 */
export async function createProposalElement(
  proposalId: number,
  elementType: ProposalElementType,
  userId: number,
  name?: string,
  content?: any,
  sortOrder?: number
): Promise<ProposalElement> {
  console.log(`Creating new ${elementType} element for proposal ${proposalId}`);
  
  // Get default content if not provided
  const defaultContent = content || getElementDefaultContent(elementType);
  
  // Prepare the element data
  const elementData: InsertProposalElement = {
    proposalId,
    elementType,
    name: name || `New ${elementType}`,
    content: typeof defaultContent === 'string' 
      ? defaultContent 
      : JSON.stringify(defaultContent),
    sortOrder: sortOrder !== undefined ? sortOrder : 0,
    createdBy: userId,
  };
  
  console.log('Creating element with data:', {
    ...elementData,
    // Don't log full content to avoid console spam
    content: typeof defaultContent === 'object' ? '(object)' : '(string)'
  });
  
  try {
    // Make the API request
    const response = await apiRequestJson<{ data: ProposalElement }>(
      'POST',
      `/api/proposals/${proposalId}/elements`,
      elementData
    );
    
    console.log('Element created successfully:', response.data?.id);
    return response.data;
  } catch (error) {
    console.error('Error creating proposal element:', error);
    throw error;
  }
}

/**
 * Refresh the list of elements for a proposal
 */
export async function refreshProposalElements(
  proposalId: number
): Promise<ProposalElement[]> {
  try {
    const response = await apiRequestJson<{ data: ProposalElement[] }>(
      'GET', 
      `/api/proposals/${proposalId}/elements`
    );
    
    return response.data || [];
  } catch (error) {
    console.error('Error refreshing proposal elements:', error);
    return [];
  }
}

/**
 * Get default content for a specific element type
 */
export function getElementDefaultContent(type: ProposalElementType): any {
  switch (type) {
    case 'Header':
      return {
        text: 'New Section',
        level: 2,
        alignment: 'left'
      };
      
    case 'Text':
      return {
        text: 'Enter your text here. This is a paragraph that can contain detailed information about your products or services.',
        alignment: 'left'
      };
      
    case 'Image':
      return {
        src: '',
        alt: 'Image description',
        width: 400,
        height: 300,
        caption: 'Image caption'
      };
      
    case 'Table':
      return {
        headers: ['Column 1', 'Column 2', 'Column 3'],
        rows: [
          ['Data 1', 'Data 2', 'Data 3'],
          ['Data 4', 'Data 5', 'Data 6'],
        ],
        caption: 'Table caption'
      };
      
    case 'List':
      return {
        type: 'unordered',
        items: [
          'List item 1',
          'List item 2',
          'List item 3'
        ]
      };
      
    case 'Quote':
      return {
        text: 'This is a quote or testimonial that highlights key points.',
        attribution: 'Source Name',
        alignment: 'left'
      };
      
    case 'ProductList':
      return {
        title: 'Products and Services',
        products: [
          { name: 'Product 1', description: 'Description', price: '$0.00' },
          { name: 'Product 2', description: 'Description', price: '$0.00' }
        ]
      };
      
    case 'Signature':
      return {
        title: 'Signature',
        name: '',
        title: '',
        date: '',
        companyName: ''
      };
      
    case 'PageBreak':
      return {
        visible: true
      };
      
    case 'Custom':
      return {
        content: 'Custom element content'
      };
      
    default:
      return {
        text: 'Default content'
      };
  }
}