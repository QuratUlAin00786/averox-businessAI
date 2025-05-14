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
  
  // Parse content safely
  const parseContent = (contentData: any): { text: string } => {
    if (typeof contentData === 'string') {
      try {
        return JSON.parse(contentData);
      } catch (e) {
        console.error('Error parsing content:', e);
        return { text: '' };
      }
    }
    return contentData || { text: '' };
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
  
  // Save handler with explicit user action
  const handleSave = () => {
    if (!isDirty) return;
    
    const updatedContent = { text };
    lastSavedText.current = text;
    setIsDirty(false);
    
    onChange({
      ...element,
      content: updatedContent
    });
    
    console.log('Text saved:', text);
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