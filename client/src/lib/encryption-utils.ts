/**
 * Utilities for handling encrypted content in the proposal editor
 */

/**
 * Safely extracts content from potentially encrypted proposal element content
 * Works with both encrypted objects and regular content
 * 
 * @param content The content from a proposal element, which might be encrypted
 * @param defaultContent Default content to use if extraction fails
 * @returns Usable content object for the element editor
 */
export function extractContent(content: any, defaultContent: any = {}): any {
  try {
    // If content is undefined/null, return default
    if (!content) {
      console.log("Empty content, using default");
      return defaultContent;
    }
    
    // If content is a string (non-encrypted), try to parse it as JSON
    if (typeof content === 'string') {
      try {
        const parsedContent = JSON.parse(content);
        console.log("Parsed string content successfully");
        return parsedContent;
      } catch (e) {
        console.log("Content is a string but not valid JSON, using as raw text");
        // If the element is text type, we can use the string directly as content
        return { text: content };
      }
    }
    
    // Handle encrypted object format (from CryptoSphere)
    if (content && typeof content === 'object') {
      // Check if this is an encrypted object format
      if (content.iv && content.encrypted && content.keyId) {
        console.log("Found encrypted content object, cannot decrypt on client side");
        // We can't decrypt on the client side, so we need to use default content
        return defaultContent;
      }
      
      // Regular object content, use as is
      return content;
    }
    
    // Fallback
    return defaultContent;
  } catch (error) {
    console.error("Error extracting content:", error);
    return defaultContent;
  }
}

/**
 * Prepares content for saving, preserving encryption metadata if present
 * 
 * @param element The original element with potentially encrypted content
 * @param newContent The new content to save
 * @returns Content formatted properly for saving
 */
export function prepareContentForSave(element: any, newContent: any): any {
  try {
    const originalContent = element.content;
    
    // If original content was encrypted (has encryption metadata)
    if (originalContent && typeof originalContent === 'object' && 
        originalContent.iv && originalContent.encrypted && originalContent.keyId) {
      
      // We can't encrypt on client side, so return the original encrypted object
      // with a special _updateData field that the server will use to update the content
      return {
        ...originalContent,
        _updateData: newContent // Server will extract this and re-encrypt
      };
    }
    
    // If not encrypted, return the new content directly
    return newContent;
  } catch (error) {
    console.error("Error preparing content for save:", error);
    return newContent;
  }
}