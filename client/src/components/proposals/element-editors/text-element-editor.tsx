import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ProposalElement } from '@shared/schema';
import { ElementEditorProps } from './editor-types';

export function TextElementEditor({ element, onChange, disabled = false }: ElementEditorProps) {
  // Get initial text from content
  const getInitialContent = () => {
    if (typeof element.content === 'string') {
      try {
        return JSON.parse(element.content);
      } catch (e) {
        console.error('Error parsing content:', e);
        return { text: '' };
      }
    }
    return element.content || { text: '' };
  };
  
  const [content, setContent] = useState(getInitialContent());
  const [text, setText] = useState(content.text || '');

  // Update local state if element changes from external source
  useEffect(() => {
    const newContent = getInitialContent();
    setContent(newContent);
    setText(newContent.text || '');
  }, [element.id, element.content]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    
    const updatedContent = {
      ...content,
      text: newText
    };
    
    setContent(updatedContent);
    
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