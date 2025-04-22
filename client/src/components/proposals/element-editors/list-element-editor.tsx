import { ProposalElement } from '@shared/schema';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface ListElementEditorProps {
  element: ProposalElement;
  onChange: (updatedElement: ProposalElement) => void;
  disabled?: boolean;
}

export function ListElementEditor({ element, onChange, disabled = false }: ListElementEditorProps) {
  // Safely parse content with proper typing
  const content = typeof element.content === 'string' 
    ? JSON.parse(element.content) 
    : element.content || {};
  
  const items = content.items || [''];
  const ordered = content.ordered || false;
  
  const [newItem, setNewItem] = useState('');

  const updateItems = (newItems: string[]) => {
    const updatedContent = {
      ...content,
      items: newItems
    };
    
    onChange({
      ...element,
      content: updatedContent
    });
  };

  const handleItemChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    updateItems(newItems);
  };

  const handleAddItem = () => {
    if (newItem.trim()) {
      updateItems([...items, newItem]);
      setNewItem('');
    } else {
      // Add an empty item
      updateItems([...items, '']);
    }
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    updateItems(newItems);
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === items.length - 1)
    ) {
      return;
    }

    const newItems = [...items];
    const itemToMove = newItems[index];
    
    if (direction === 'up') {
      newItems[index] = newItems[index - 1];
      newItems[index - 1] = itemToMove;
    } else {
      newItems[index] = newItems[index + 1];
      newItems[index + 1] = itemToMove;
    }
    
    updateItems(newItems);
  };

  const toggleOrdered = () => {
    const updatedContent = {
      ...content,
      ordered: !ordered
    };
    
    onChange({
      ...element,
      content: updatedContent
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch 
          id="list-type"
          checked={ordered}
          onCheckedChange={toggleOrdered}
          disabled={disabled}
        />
        <Label htmlFor="list-type">Ordered List</Label>
      </div>
      
      <div className="space-y-2">
        <Label>List Items</Label>
        <div className="space-y-2 max-h-60 overflow-y-auto border rounded p-2">
          {items.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-4">
              No items. Add items using the form below.
            </div>
          ) : (
            items.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex-shrink-0 text-gray-400 cursor-grab">
                  <GripVertical className="h-4 w-4" />
                </div>
                <div className="flex-grow">
                  <Input
                    value={item}
                    onChange={(e) => handleItemChange(index, e.target.value)}
                    placeholder={`Item ${index + 1}`}
                    disabled={disabled}
                  />
                </div>
                <div className="flex flex-shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleMoveItem(index, 'up')}
                    disabled={disabled || index === 0}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleMoveItem(index, 'down')}
                    disabled={disabled || index === items.length - 1}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleRemoveItem(index)}
                    disabled={disabled || items.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="flex gap-2">
        <div className="flex-grow">
          <Input
            placeholder="Add new item"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddItem();
              }
            }}
            disabled={disabled}
          />
        </div>
        <Button
          onClick={handleAddItem}
          disabled={disabled}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1" /> Add Item
        </Button>
      </div>
    </div>
  );
}