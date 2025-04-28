import { ProposalElement } from '@shared/schema';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Image } from 'lucide-react';

interface ImageElementEditorProps {
  element: ProposalElement;
  onChange: (updatedElement: ProposalElement) => void;
  disabled?: boolean;
}

export function ImageElementEditor({ element, onChange, disabled = false }: ImageElementEditorProps) {
  // Safely parse content with proper typing
  const content = typeof element.content === 'string' 
    ? JSON.parse(element.content) 
    : element.content || {};
  
  const url = content.url || '';
  const alt = content.alt || '';
  const caption = content.caption || '';
  const width = content.width || 800;

  const handleChange = (field: string, value: string | number) => {
    const updatedContent = {
      ...content,
      [field]: value
    };
    
    onChange({
      ...element,
      content: updatedContent
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="image-url">Image URL</Label>
        <Input
          id="image-url"
          placeholder="Enter image URL"
          value={url}
          onChange={(e) => handleChange('url', e.target.value)}
          disabled={disabled}
        />
      </div>
      
      {url && (
        <div className="border rounded p-2 my-2 bg-gray-50">
          <div className="text-center">
            <div className="relative w-full h-40 overflow-hidden bg-gray-100 rounded border mb-2">
              {url ? (
                <img 
                  src={url} 
                  alt={alt || 'Preview'} 
                  className="object-contain w-full h-full" 
                  onError={(e) => {
                    // On error, show a placeholder
                    (e.target as HTMLImageElement).src = '';
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).parentElement!.classList.add('flex', 'items-center', 'justify-center');
                    (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="text-gray-400"><svg class="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg><p class="text-sm mt-2">Error loading image</p></div>';
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-gray-400">
                    <Image className="w-10 h-10 mx-auto" />
                    <p className="text-sm mt-2">No image URL provided</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div>
        <Label htmlFor="image-alt">Alt Text</Label>
        <Input
          id="image-alt"
          placeholder="Alternative text for accessibility"
          value={alt}
          onChange={(e) => handleChange('alt', e.target.value)}
          disabled={disabled}
        />
      </div>
      
      <div>
        <Label htmlFor="image-caption">Caption</Label>
        <Textarea
          id="image-caption"
          placeholder="Enter image caption (optional)"
          value={caption}
          onChange={(e) => handleChange('caption', e.target.value)}
          disabled={disabled}
        />
      </div>
      
      <div>
        <Label htmlFor="image-width">Width (px)</Label>
        <Input
          id="image-width"
          type="number"
          min={100}
          max={1200}
          value={width}
          onChange={(e) => handleChange('width', parseInt(e.target.value, 10) || 800)}
          disabled={disabled}
        />
      </div>
    </div>
  );
}