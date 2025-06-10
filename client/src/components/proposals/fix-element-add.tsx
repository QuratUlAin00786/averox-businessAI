// This file contains a completely rewritten approach to adding proposal elements
// for the AVEROX CRM. It addresses issues with the element creation process.

import { ProposalElement, InsertProposalElement } from '@shared/schema';
import { toast } from '@/hooks/use-toast';

// Define the type for element types
export type ProposalElementType = 'Header' | 'Text' | 'Image' | 'Table' | 'List' | 'Quote' | 'ProductList' | 'Signature' | 'PageBreak' | 'Custom';

/**
 * Creates a default content object for different element types
 */
export function getElementDefaultContent(type: ProposalElementType) {
  switch (type) {
    case 'Header':
      return {
        text: 'New Header',
        level: 2,
        alignment: 'left'
      };
    
    case 'Text':
      return {
        text: 'Enter your text here. This is a paragraph that can contain detailed information about your products or services.',
        alignment: 'left'
      };
    
    case 'List':
      return {
        items: [
          'First item',
          'Second item',
          'Third item'
        ],
        type: 'bullet' // or 'numbered'
      };
    
    case 'Table':
      return {
        headers: ['Column 1', 'Column 2', 'Column 3'],
        rows: [
          ['Row 1, Cell 1', 'Row 1, Cell 2', 'Row 1, Cell 3'],
          ['Row 2, Cell 1', 'Row 2, Cell 2', 'Row 2, Cell 3']
        ]
      };
    
    case 'Image':
      return {
        url: '',
        alt: 'Image description',
        caption: '',
        width: '100%'
      };
    
    case 'Quote':
      return {
        text: 'This is a quotation or testimonial from a client.',
        author: 'Client Name',
        company: 'Company Name'
      };
    
    case 'ProductList':
      return {
        products: [],
        showPrices: true,
        showImages: true
      };
    
    case 'Signature':
      return {
        name: '',
        title: '',
        date: '',
        signatureImage: ''
      };
    
    case 'PageBreak':
      return {};
    
    case 'Custom':
      return {
        html: '<div>Custom HTML content goes here</div>'
      };
    
    default:
      console.warn(`Unknown element type: ${type}, using empty content`);
      return {};
  }
}

/**
 * A complete rewrite of the element creation functionality
 * This ensures proper formatting of the element data for API submission
 */
export async function createProposalElement(
  proposalId: number,
  elementType: ProposalElementType,
  userId: number = 2 // Default value since it's hardcoded on server side
): Promise<ProposalElement | null> {
  try {
    console.log(`Creating new ${elementType} element for proposal ${proposalId}`);
    
    // Get the default content for this element type
    const defaultContent = getElementDefaultContent(elementType);
    
    // Create the element data with proper structure
    const newElement: InsertProposalElement = {
      proposalId,
      elementType,
      name: `New ${elementType}`,
      // We don't need to stringify here, server will handle it
      content: defaultContent,
      sortOrder: 0, // Server will adjust this
      createdBy: userId
    };
    
    console.log("Prepared element data:", newElement);
    
    // Make the API request
    const response = await fetch(`/api/proposals/${proposalId}/elements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newElement),
      credentials: 'include'
    });
    
    // Handle API errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Server error (${response.status}):`, errorText);
      
      let errorMessage: string;
      try {
        // Try to parse the error as JSON
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error || `Error code: ${response.status}`;
      } catch {
        // If not valid JSON, use text directly
        errorMessage = errorText || `Error code: ${response.status}`;
      }
      
      toast({
        title: "Element Creation Failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      return null;
    }
    
    // Parse the response
    const data = await response.json();
    console.log("Server response for element creation:", data);
    
    // Extract the element data from the response
    const createdElement = data.data || data;
    
    toast({
      title: "Element Created",
      description: `Added new ${elementType} element to the proposal`,
    });
    
    return createdElement;
    
  } catch (error: any) {
    console.error("Exception creating proposal element:", error);
    
    toast({
      title: "Element Creation Failed",
      description: error.message || "Unexpected error creating element",
      variant: "destructive"
    });
    
    return null;
  }
}

/**
 * A function to refresh the elements list for a proposal
 * Uses direct fetch instead of relying on React Query caching
 */
export async function refreshProposalElements(
  proposalId: number, 
  setElementsCallback: (elements: ProposalElement[]) => void
): Promise<ProposalElement[]> {
  try {
    console.log(`Manually refreshing elements for proposal ${proposalId}`);
    
    const response = await fetch(`/api/proposals/${proposalId}/elements`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch elements: ${response.status}`);
    }
    
    const result = await response.json();
    console.log("Elements refresh result:", result);
    
    if (result.success && Array.isArray(result.data)) {
      // Sort elements by sort order
      const sortedElements = [...result.data].sort((a, b) => 
        (a.sortOrder || 0) - (b.sortOrder || 0)
      );
      
      // Update state via callback
      setElementsCallback(sortedElements);
      return sortedElements;
    } else if (Array.isArray(result)) {
      // Handle legacy API format
      const sortedElements = [...result].sort((a, b) => 
        (a.sortOrder || 0) - (b.sortOrder || 0)
      );
      
      setElementsCallback(sortedElements);
      return sortedElements;
    } else {
      console.error("Invalid response format:", result);
      return [];
    }
    
  } catch (error: any) {
    console.error("Error refreshing elements list:", error);
    
    toast({
      title: "Error",
      description: "Failed to refresh elements list",
      variant: "destructive"
    });
    
    return [];
  }
}