import React, { useState, useEffect, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ProposalElement } from '@shared/schema';
import { ElementEditorProps } from './editor-types';
import { extractContent, prepareContentForSave } from '@/lib/encryption-utils';

export function TextElementEditor({ element, onChange, disabled = false }: ElementEditorProps) {
  // Create refs to track if we need to update
  const isInitialRender = useRef(true);
  const lastSavedText = useRef('');
  
  // Get initial content with support for encrypted data
  const defaultContent = { text: 'Enter text here...' };
  const initialContent = extractContent(element.content, defaultContent);
  const initialText = initialContent.text || '';
  
  // Set up state
  const [text, setText] = useState(initialText);
  const [isDirty, setIsDirty] = useState(false);
  
  // Setup the lastSavedText ref on mount
  useEffect(() => {
    lastSavedText.current = initialText;
    isInitialRender.current = false;
  }, [initialText]);
  
  // Handle external content changes (only if not editing)
  useEffect(() => {
    if (!isDirty && !isInitialRender.current) {
      const content = extractContent(element.content, defaultContent);
      setText(content.text || '');
      lastSavedText.current = content.text || '';
    }
  }, [element.id, element.content, isDirty]);
  
  // Text input handler with change marking
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    setIsDirty(newText !== lastSavedText.current);
  };
  
  // Save handler with improved encryption support
  const handleSave = () => {
    if (!isDirty) return;
    
    try {
      // Create updated content object
      const updatedContent = { 
        text
      };
      
      // Prepare the content for saving, handling encryption metadata if present
      const newContent = prepareContentForSave(element, updatedContent);
      
      // Update our local state
      lastSavedText.current = text;
      setIsDirty(false);
      
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