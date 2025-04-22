import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ProposalElement } from '@shared/schema';

interface TextElementEditorProps {
  element: ProposalElement;
  onChange: (updatedElement: ProposalElement) => void;
  disabled?: boolean;
}

export function TextElementEditor({ element, onChange, disabled = false }: TextElementEditorProps) {
  // Safely parse content with proper typing
  const content = typeof element.content === 'string' 
    ? JSON.parse(element.content) 
    : element.content || {};
  
  const text = content.text || '';

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const updatedContent = {
      ...content,
      text: e.target.value
    };
    
    onChange({
      ...element,
      content: updatedContent
    });
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
          disabled={disabled}
        />
      </div>
    </div>
  );
}