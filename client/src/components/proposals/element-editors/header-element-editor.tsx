import { ProposalElement } from '@shared/schema';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface HeaderElementEditorProps {
  element: ProposalElement;
  onChange: (updatedElement: ProposalElement) => void;
  disabled?: boolean;
}

export function HeaderElementEditor({ element, onChange, disabled = false }: HeaderElementEditorProps) {
  // Safely parse content with proper typing
  const content = typeof element.content === 'string' 
    ? JSON.parse(element.content) 
    : element.content || {};
  
  const text = content.text || '';
  const level = content.level || 1;

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedContent = {
      ...content,
      text: e.target.value
    };
    
    onChange({
      ...element,
      content: updatedContent
    });
  };

  const handleLevelChange = (value: string) => {
    const updatedContent = {
      ...content,
      level: parseInt(value, 10)
    };
    
    onChange({
      ...element,
      content: updatedContent
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="header-text">Heading Text</Label>
        <Input
          id="header-text"
          placeholder="Enter heading text"
          value={text}
          onChange={handleTextChange}
          disabled={disabled}
        />
      </div>
      
      <div>
        <Label htmlFor="header-level">Heading Level</Label>
        <Select 
          value={level.toString()} 
          onValueChange={handleLevelChange}
          disabled={disabled}
        >
          <SelectTrigger id="header-level">
            <SelectValue placeholder="Select heading level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Heading 1 (Largest)</SelectItem>
            <SelectItem value="2">Heading 2</SelectItem>
            <SelectItem value="3">Heading 3</SelectItem>
            <SelectItem value="4">Heading 4 (Smallest)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}