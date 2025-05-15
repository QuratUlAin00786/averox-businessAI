import React, { useState, useEffect, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ProposalElement } from '@shared/schema';
import { ElementEditorProps, TextElementContent } from './editor-types';

export function TextElementEditor({ element, onChange, disabled = false }: ElementEditorProps) {
  // Create refs to track if we need to update
  const isInitialRender = useRef(true);
  const lastSavedText = useRef('');
  
  // Get initial content
  const defaultContent: TextElementContent = { text: 'Enter text here...' };
  
  // Process the content based on its type
  let initialText = '';
  if (typeof element.content === 'string') {
    // Attempt to parse string as JSON
    try {
      const parsed = JSON.parse(element.content) as TextElementContent;
      initialText = parsed.text || '';
    } catch (e) {
      // If not valid JSON, use the string directly
      initialText = element.content;
    }
  } else if (element.content && typeof element.content === 'object') {
    // Object format - either server-decrypted content or direct content
    const contentObj = element.content as TextElementContent;
    initialText = contentObj.text || '';
  }
  
  // Set up state
  const [text, setText] = useState(initialText || '');
  const [isDirty, setIsDirty] = useState(false);
  
  // Setup the lastSavedText ref on mount
  useEffect(() => {
    lastSavedText.current = initialText;
    isInitialRender.current = false;
  }, [initialText]);
  
  // Handle external content changes (only if not editing)
  useEffect(() => {
    if (!isDirty && !isInitialRender.current) {
      let newText = '';
      
      // Handle different content formats
      if (typeof element.content === 'string') {
        try {
          const parsed = JSON.parse(element.content) as TextElementContent;
          newText = parsed.text || '';
        } catch (e) {
          newText = element.content;
        }
      } else if (element.content && typeof element.content === 'object') {
        const contentObj = element.content as TextElementContent;
        newText = contentObj.text || '';
      }
      
      setText(newText);
      lastSavedText.current = newText;
    }
  }, [element.id, element.content, isDirty]);
  
  // Text input handler with change marking
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    setIsDirty(newText !== lastSavedText.current);
  };
  
  // Simple save handler
  const handleSave = () => {
    if (!isDirty) return;
    
    try {
      // Create updated content object
      const updatedContent: TextElementContent = { 
        text
      };
      
      // Update our local state
      lastSavedText.current = text;
      setIsDirty(false);
      
      // Log what we're saving for debugging
      console.log('Saving text element with content:', {
        original: element.content,
        new: updatedContent,
        text
      });
      
      // Call the onChange handler with updated element
      onChange({
        ...element,
        content: updatedContent
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