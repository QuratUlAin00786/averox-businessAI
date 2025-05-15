import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ElementEditorProps } from './editor-types';

interface SignatureContent {
  label?: string;
  name?: string;
  role?: string;
  date?: boolean;
  signedBy?: string;
  signedAt?: string;
}

export function SignatureElementEditor({ 
  element, 
  onChange, 
  disabled = false 
}: ElementEditorProps) {
  // Initialize form state
  const [content, setContent] = useState<SignatureContent>({
    label: 'Signature',
    name: '',
    role: '',
    date: true
  });

  // Load content from element when it changes
  useEffect(() => {
    if (element?.content) {
      let elementContent = element.content as SignatureContent;
      if (typeof element.content === 'string') {
        try {
          elementContent = JSON.parse(element.content);
        } catch (e) {
          console.error('Error parsing signature content:', e);
        }
      }
      setContent(prevContent => ({
        ...prevContent,
        ...elementContent
      }));
    }
  }, [element]);

  // Handle form changes and update parent
  const handleChange = (field: keyof SignatureContent, value: string | boolean) => {
    if (disabled) return;
    
    const updatedContent = { ...content, [field]: value };
    setContent(updatedContent);
    
    // Create a copy of the element with updated content
    const updatedElement = {
      ...element,
      content: updatedContent
    };
    
    onChange(updatedElement);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="signature-label">Signature Label</Label>
        <Input
          id="signature-label"
          value={content.label || ''}
          onChange={(e) => handleChange('label', e.target.value)}
          placeholder="Signature"
          disabled={disabled}
        />
      </div>
      
      <div>
        <Label htmlFor="signature-name">Signer Name</Label>
        <Input
          id="signature-name"
          value={content.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Full Name"
          disabled={disabled}
        />
      </div>
      
      <div>
        <Label htmlFor="signature-role">Signer Title/Role</Label>
        <Input
          id="signature-role"
          value={content.role || ''}
          onChange={(e) => handleChange('role', e.target.value)}
          placeholder="Title or Role"
          disabled={disabled}
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="signature-date"
          checked={content.date || false}
          onCheckedChange={(checked) => handleChange('date', checked)}
          disabled={disabled}
        />
        <Label htmlFor="signature-date">Include Date</Label>
      </div>
    </div>
  );
}