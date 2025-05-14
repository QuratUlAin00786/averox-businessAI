import React, { useState, useEffect, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ProposalElement } from '@shared/schema';
import { ElementEditorProps } from './editor-types';

export function TextElementEditor({ element, onChange, disabled = false }: ElementEditorProps) {
  // Create refs to track if we need to update
  const isInitialRender = useRef(true);
  const lastSavedText = useRef('');
  
  // Parse content safely with enhanced error handling
  const parseContent = (contentData: any): { text: string } => {
    try {
      // Handle string content (needs parsing)
      if (typeof contentData === 'string') {
        try {
          const parsed = JSON.parse(contentData);
          return parsed && typeof parsed === 'object' ? parsed : { text: contentData };
        } catch (e) {
          console.error('Error parsing content string:', e);
          // If JSON parsing fails, treat the entire string as text content
          return { text: contentData };
        }
      }
      
      // Handle object content (already parsed)
      if (contentData && typeof contentData === 'object') {
        // If text property doesn't exist, create an empty one
        if (!('text' in contentData)) {
          console.warn('Content object missing text property:', contentData);
          return { ...contentData, text: '' };
        }
        return contentData;
      }
      
      // Handle null/undefined case
      return { text: '' };
    } catch (err) {
      console.error('Unexpected error in parseContent:', err, contentData);
      return { text: '' };
    }
  };
  
  // Get initial content
  const initialContent = parseContent(element.content);
  const initialText = initialContent.text || '';
  
  // Set up state
  const [text, setText] = useState(initialText);
  const [isDirty, setIsDirty] = useState(false);
  
  // Setup the lastSavedText ref on mount
  useEffect(() => {
    lastSavedText.current = initialText;
    isInitialRender.current = false;
  }, []);
  
  // Handle external content changes (only if not editing)
  useEffect(() => {
    if (!isDirty && !isInitialRender.current) {
      const parsedContent = parseContent(element.content);
      setText(parsedContent.text || '');
      lastSavedText.current = parsedContent.text || '';
    }
  }, [element.id, element.content]);
  
  // Text input handler with change marking
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    setIsDirty(newText !== lastSavedText.current);
  };
  
  // Save handler with explicit user action and enhanced error handling
  const handleSave = () => {
    if (!isDirty) return;
    
    try {
      // Preserve any existing content properties other than text
      const existingContent = parseContent(element.content);
      const updatedContent = { 
        ...existingContent,
        text 
      };
      
      // Update our local state
      lastSavedText.current = text;
      setIsDirty(false);
      
      // Format content based on how it was originally provided
      let newContent: any;
      if (typeof element.content === 'string') {
        // If content was originally a string, convert back to string
        newContent = JSON.stringify(updatedContent);
      } else {
        // Otherwise keep as object
        newContent = updatedContent;
      }
      
      // Log what we're saving for debugging
      console.log('Saving text element with content:', {
        original: element.content,
        new: newContent,
        text
      });
      
      // Call the onChange handler
      onChange({
        ...element,
        content: newContent
      });
      
      console.log('Text saved successfully:', text);
    } catch (error) {
      console.error('Error saving text:', error);
      // We don't reset isDirty here so the user can try again
    }
  };
  
  // Auto-save when focus leaves the textarea
  const handleBlur = () => {
    if (isDirty) {
      handleSave();
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="text-content">Text Content</Label>
        <Textarea
          id="text-content"
          className="min-h-32 font-normal"
          placeholder="Enter text content here..."
          value={text}
          onChange={handleTextChange}
          onBlur={handleBlur}
          disabled={disabled}
        />
      </div>
      
      {isDirty && (
        <div className="flex justify-end">
          <Button 
            size="sm" 
            onClick={handleSave}
            disabled={disabled}
          >
            Save Text
          </Button>
        </div>
      )}
    </div>
  );
}