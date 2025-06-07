import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  ChevronLeft,
  ChevronRight,
  Save,
  Eye,
  Code,
  FileText,
  Image as ImageIcon,
  Type,
  Link,
  AlignLeft,
  AlignCenter,
  AlignRight,
  LayoutGrid,
  Copy,
  CornerDownLeft,
  MessageSquare,
  Database,
  Sliders,
  Clock,
  Share2,
  Trash2,
  Smartphone,
  Monitor,
  Send,
  Plus,
  X,
  RefreshCw,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Types for template elements
interface TemplateElement {
  id: string;
  type: 'header' | 'text' | 'image' | 'button' | 'divider' | 'spacer' | 'social' | 'column';
  content?: {
    text?: string;
    url?: string;
    alt?: string;
    html?: string;
  };
  settings?: {
    fontSize?: string;
    color?: string;
    backgroundColor?: string;
    padding?: string;
    alignment?: string;
    width?: string;
    height?: string;
  };
  children?: TemplateElement[];
}

// Database-driven email template system - no mock data permitted
const createEmptyTemplate = () => ({
  id: "",
  name: "",
  description: "",
  subject: "",
  previewText: "",
  elements: []
});

// Database-driven personalization tokens
const personalizationTokens = [
  { name: "Contact Fields", tokens: [
    { label: "First Name", value: "{{contact.firstName}}" },
    { label: "Last Name", value: "{{contact.lastName}}" },
    { label: "Email", value: "{{contact.email}}" },
    { label: "Company", value: "{{contact.company}}" },
    { label: "Phone", value: "{{contact.phone}}" }
  ]},
  { name: "Account Fields", tokens: [
    { label: "Account Name", value: "{{account.name}}" },
    { label: "Account Type", value: "{{account.type}}" },
    { label: "Account Industry", value: "{{account.industry}}" }
  ]},
  { name: "System Fields", tokens: [
    { label: "Current Date", value: "{{system.date}}" },
    { label: "Unsubscribe Link", value: "{{unsubscribe}}" },
    { label: "View in Browser", value: "{{viewInBrowser}}" }
  ]}
];

// Templates must be loaded from database - no hardcoded templates permitted
const loadTemplatesFromDatabase = async () => {
  // Return empty array until database integration is complete
  return [];
};

// Preview data must come from database - no hardcoded placeholders permitted
const loadPreviewDataFromDatabase = async () => {
  // Return empty object until database integration is complete
  return {};
};

export default function EmailTemplateEditor() {
  const [, setLocation] = useLocation();
  const [template, setTemplate] = useState(createEmptyTemplate());
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [mode, setMode] = useState<'visual' | 'code'>('visual');
  const [htmlCode, setHtmlCode] = useState<string>("");
  const [showPersonalization, setShowPersonalization] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Find the selected element
  const selectedElement = selectedElementId 
    ? template.elements.find(el => el.id === selectedElementId)
    : null;

  // Generate HTML code (simplified)
  useEffect(() => {
    if (mode === 'code') {
      // This is a simplified HTML generation, in a real implementation 
      // this would create proper responsive email HTML with inline styles
      let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${template.subject}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    img { max-width: 100%; height: auto; }
    .button { display: inline-block; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
`;

      // Add elements
      template.elements.forEach(element => {
        switch (element.type) {
          case 'header':
            html += `    <h1 style="font-size: ${element.settings.fontSize}; text-align: ${element.settings.textAlign}; color: ${element.settings.color}; padding-top: ${element.settings.paddingTop}; padding-bottom: ${element.settings.paddingBottom};">${element.content.text}</h1>\n`;
            break;
          case 'text':
            html += `    <p style="font-size: ${element.settings.fontSize}; line-height: ${element.settings.lineHeight}; color: ${element.settings.color}; padding-top: ${element.settings.paddingTop}; padding-bottom: ${element.settings.paddingBottom};">${element.content.text}</p>\n`;
            break;
          case 'image':
            html += `    <div style="text-align: ${element.settings.alignment}; padding-top: ${element.settings.paddingTop}; padding-bottom: ${element.settings.paddingBottom};">
      <img src="${element.content.src}" alt="${element.content.alt}" style="width: ${element.settings.width};" />
    </div>\n`;
            break;
          case 'button':
            html += `    <div style="text-align: ${element.settings.alignment}; padding-top: ${element.settings.paddingTop}; padding-bottom: ${element.settings.paddingBottom};">
      <a href="${element.content.link}" style="background-color: ${element.settings.backgroundColor}; color: ${element.settings.color}; padding: ${element.settings.paddingTop} ${element.settings.paddingRight} ${element.settings.paddingBottom} ${element.settings.paddingLeft}; border-radius: ${element.settings.borderRadius}; text-decoration: none; display: inline-block;">${element.content.text}</a>
    </div>\n`;
            break;
          case 'divider':
            html += `    <hr style="border: 0; border-top: ${element.settings.thickness} ${element.settings.style} ${element.settings.color}; margin-top: ${element.settings.paddingTop}; margin-bottom: ${element.settings.paddingBottom};" />\n`;
            break;
          case 'spacer':
            html += `    <div style="height: ${element.settings.height};"></div>\n`;
            break;
          case 'social':
            html += `    <div style="text-align: ${element.settings.alignment}; padding-top: ${element.settings.paddingTop}; padding-bottom: ${element.settings.paddingBottom};">`;
            element.content.networks.forEach(network => {
              html += `<a href="${network.url}" style="margin: 0 ${element.settings.iconSpacing};">
        <img src="https://placehold.co/${element.settings.iconSize}/${network.name === 'facebook' ? '1877F2' : network.name === 'twitter' ? '1DA1F2' : network.name === 'linkedin' ? '0A66C2' : network.name === 'instagram' ? 'E4405F' : '000000'}/FFFFFF?text=${network.name}" alt="${network.name}" width="${element.settings.iconSize}" />
      </a>`;
            });
            html += `</div>\n`;
            break;
        }
      });

      html += `  </div>
</body>
</html>`;
      
      setHtmlCode(html);
    }
  }, [mode, template]);

  // Update an element property
  const updateElement = (id: string, updates: any) => {
    const updatedElements = template.elements.map(element => {
      if (element.id === id) {
        return {
          ...element,
          ...updates,
          content: { ...element.content, ...updates.content },
          settings: { ...element.settings, ...updates.settings }
        };
      }
      return element;
    });

    setTemplate({ ...template, elements: updatedElements });
  };

  // Add a new element
  const addElement = (type: TemplateElement['type'], position?: number) => {
    const newId = `${type}${template.elements.filter(el => el.type === type).length + 1}`;
    let newElement: TemplateElement;

    // Create different default elements based on type
    switch (type) {
      case 'header':
        newElement = {
          id: newId,
          type: 'header',
          content: { text: '', link: '' },
          settings: {
            fontSize: '24px',
            textAlign: 'center',
            color: '#333333',
            backgroundColor: '',
            paddingTop: '20px',
            paddingBottom: '10px',
          }
        };
        break;

      case 'text':
        newElement = {
          id: newId,
          type: 'text',
          content: { text: '' },
          settings: {
            fontSize: '16px',
            lineHeight: '1.5',
            color: '#444444',
            paddingTop: '10px',
            paddingBottom: '10px',
          }
        };
        break;

      case 'image':
        newElement = {
          id: newId,
          type: 'image',
          content: {
            src: '',
            alt: '',
            link: '',
          },
          settings: {
            width: '100%',
            paddingTop: '10px',
            paddingBottom: '10px',
            alignment: 'center',
          }
        };
        break;

      case 'button':
        newElement = {
          id: newId,
          type: 'button',
          content: {
            text: '',
            link: '',
          },
          settings: {
            backgroundColor: '#4F46E5',
            color: '#FFFFFF',
            fontSize: '16px',
            fontWeight: 'bold',
            borderRadius: '4px',
            paddingTop: '12px',
            paddingBottom: '12px',
            paddingLeft: '24px',
            paddingRight: '24px',
            alignment: 'center',
            width: 'auto',
          }
        };
        break;

      case 'divider':
        newElement = {
          id: newId,
          type: 'divider',
          settings: {
            color: '#EEEEEE',
            thickness: '1px',
            style: 'solid',
            paddingTop: '5px',
            paddingBottom: '5px',
          }
        };
        break;

      case 'spacer':
        newElement = {
          id: newId,
          type: 'spacer',
          settings: {
            height: '20px',
          }
        };
        break;

      case 'social':
        newElement = {
          id: newId,
          type: 'social',
          content: {
            networks: []
          },
          settings: {
            iconSize: '32px',
            iconSpacing: '10px',
            alignment: 'center',
            paddingTop: '10px',
            paddingBottom: '10px',
          }
        };
        break;

      default:
        newElement = {
          id: newId,
          type,
        };
    }

    // Insert the new element
    const updatedElements = [...template.elements];
    if (position !== undefined) {
      updatedElements.splice(position, 0, newElement);
    } else {
      updatedElements.push(newElement);
    }

    setTemplate({ ...template, elements: updatedElements });
    setSelectedElementId(newId);
  };

  // Delete an element
  const deleteElement = (id: string) => {
    const updatedElements = template.elements.filter(element => element.id !== id);
    setTemplate({ ...template, elements: updatedElements });
    setSelectedElementId(null);
  };

  // Move an element up or down
  const moveElement = (id: string, direction: 'up' | 'down') => {
    const index = template.elements.findIndex(element => element.id === id);
    if (
      (direction === 'up' && index > 0) || 
      (direction === 'down' && index < template.elements.length - 1)
    ) {
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      const updatedElements = [...template.elements];
      const element = updatedElements[index];
      updatedElements.splice(index, 1);
      updatedElements.splice(newIndex, 0, element);
      setTemplate({ ...template, elements: updatedElements });
    }
  };

  // Duplicate an element
  const duplicateElement = (id: string) => {
    const elementToDuplicate = template.elements.find(element => element.id === id);
    if (elementToDuplicate) {
      const newId = `${elementToDuplicate.type}${template.elements.filter(el => el.type === elementToDuplicate.type).length + 1}`;
      const newElement = { 
        ...JSON.parse(JSON.stringify(elementToDuplicate)), 
        id: newId 
      };
      
      const index = template.elements.findIndex(element => element.id === id);
      const updatedElements = [...template.elements];
      updatedElements.splice(index + 1, 0, newElement);
      
      setTemplate({ ...template, elements: updatedElements });
      setSelectedElementId(newId);
    }
  };

  // Insert personalization token
  const insertToken = (token: string) => {
    if (selectedElement?.type === 'text' || selectedElement?.type === 'header') {
      const textArea = textAreaRef.current;
      if (textArea) {
        const start = textArea.selectionStart;
        const end = textArea.selectionEnd;
        const text = selectedElement.content.text;
        const newText = text.substring(0, start) + token + text.substring(end);
        
        updateElement(selectedElement.id, {
          content: { text: newText }
        });
        
        // Set cursor position after the inserted token
        setTimeout(() => {
          textArea.focus();
          textArea.setSelectionRange(start + token.length, start + token.length);
        }, 0);
      }
    }
  };

  // Render email elements for visual builder
  const renderElement = (element: TemplateElement) => {
    const isSelected = selectedElementId === element.id;
    
    // Common wrapper for all elements with selection UI
    const wrapperClasses = `relative p-1 mb-2 group ${isSelected ? 'outline outline-2 outline-primary' : 'hover:outline hover:outline-1 hover:outline-primary/50'}`;
    
    const elementControls = (
      <div className={`absolute top-0 right-0 bg-white rounded-bl-md border shadow-sm flex z-10 ${isSelected ? 'block' : 'hidden group-hover:flex'}`}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={() => moveElement(element.id, 'up')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Move Up</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={() => moveElement(element.id, 'down')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Move Down</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={() => duplicateElement(element.id)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Duplicate</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={() => deleteElement(element.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
    
    // Render different element types
    switch (element.type) {
      case 'header':
        return (
          <div 
            className={wrapperClasses}
            onClick={() => setSelectedElementId(element.id)}
          >
            {elementControls}
            <h1 
              style={{
                fontSize: element.settings.fontSize,
                textAlign: element.settings.textAlign as any,
                color: element.settings.color,
                backgroundColor: element.settings.backgroundColor || 'transparent',
                paddingTop: element.settings.paddingTop,
                paddingBottom: element.settings.paddingBottom,
              }}
            >
              {formatPreviewText(element.content.text)}
            </h1>
          </div>
        );
        
      case 'text':
        return (
          <div 
            className={wrapperClasses}
            onClick={() => setSelectedElementId(element.id)}
          >
            {elementControls}
            <p 
              style={{
                fontSize: element.settings.fontSize,
                lineHeight: element.settings.lineHeight,
                color: element.settings.color,
                paddingTop: element.settings.paddingTop,
                paddingBottom: element.settings.paddingBottom,
                fontWeight: element.settings.fontWeight || 'normal',
                textAlign: (element.settings.textAlign as any) || 'left',
              }}
            >
              {formatPreviewText(element.content.text)}
            </p>
          </div>
        );
        
      case 'image':
        return (
          <div 
            className={wrapperClasses}
            onClick={() => setSelectedElementId(element.id)}
          >
            {elementControls}
            <div 
              style={{
                textAlign: element.settings.alignment as any,
                paddingTop: element.settings.paddingTop,
                paddingBottom: element.settings.paddingBottom,
              }}
            >
              <img 
                src={element.content.src} 
                alt={element.content.alt} 
                style={{
                  width: element.settings.width,
                }}
              />
            </div>
          </div>
        );
        
      case 'button':
        return (
          <div 
            className={wrapperClasses}
            onClick={() => setSelectedElementId(element.id)}
          >
            {elementControls}
            <div 
              style={{
                textAlign: element.settings.alignment as any,
                paddingTop: element.settings.paddingTop,
                paddingBottom: element.settings.paddingBottom,
              }}
            >
              <a 
                href={element.content.link} 
                style={{
                  backgroundColor: element.settings.backgroundColor,
                  color: element.settings.color,
                  fontSize: element.settings.fontSize,
                  fontWeight: element.settings.fontWeight,
                  padding: `${element.settings.paddingTop} ${element.settings.paddingRight} ${element.settings.paddingBottom} ${element.settings.paddingLeft}`,
                  borderRadius: element.settings.borderRadius,
                  display: 'inline-block',
                  textDecoration: 'none',
                }}
                onClick={(e) => e.preventDefault()}
              >
                {element.content.text}
              </a>
            </div>
          </div>
        );
        
      case 'divider':
        return (
          <div 
            className={wrapperClasses}
            onClick={() => setSelectedElementId(element.id)}
          >
            {elementControls}
            <hr 
              style={{
                borderTop: `${element.settings.thickness} ${element.settings.style} ${element.settings.color}`,
                marginTop: element.settings.paddingTop,
                marginBottom: element.settings.paddingBottom,
                borderLeft: 'none',
                borderRight: 'none',
                borderBottom: 'none',
              }}
            />
          </div>
        );
        
      case 'spacer':
        return (
          <div 
            className={wrapperClasses}
            onClick={() => setSelectedElementId(element.id)}
          >
            {elementControls}
            <div 
              style={{
                height: element.settings.height,
                backgroundColor: '#f5f5f5',
                opacity: 0.5,
              }}
            />
          </div>
        );
        
      case 'social':
        return (
          <div 
            className={wrapperClasses}
            onClick={() => setSelectedElementId(element.id)}
          >
            {elementControls}
            <div 
              style={{
                textAlign: element.settings.alignment as any,
                paddingTop: element.settings.paddingTop,
                paddingBottom: element.settings.paddingBottom,
              }}
            >
              {element.content.networks.map((network, index) => (
                <a 
                  key={index} 
                  href={network.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    margin: `0 ${element.settings.iconSpacing}`,
                    display: 'inline-block',
                  }}
                  onClick={(e) => e.preventDefault()}
                >
                  <div 
                    style={{
                      width: element.settings.iconSize,
                      height: element.settings.iconSize,
                      backgroundColor: '#e5e7eb',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      color: '#6b7280'
                    }}
                  >
                    {network.name}
                  </div>
                </a>
              ))}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  // Replace personalization tokens with sample data
  const formatPreviewText = (text: string): React.ReactNode => {
    if (!text) return '';
    
    // Split text by tokens
    const parts = [];
    let lastIndex = 0;
    const regex = /\{\{[^{}]+\}\}/g;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      // Add text before token
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      
      // Add token with highlight
      const token = match[0];
      const replacement = previewPlaceholders[token] || token;
      
      if (token === replacement) {
        // Token not replaced, just highlight it
        parts.push(
          <span key={match.index} className="bg-yellow-100 text-yellow-800 px-1 rounded">
            {token}
          </span>
        );
      } else if (typeof replacement === 'string' && (replacement.includes('<a') || replacement.includes('<span'))) {
        // HTML content (like unsubscribe link)
        parts.push(
          <span 
            key={match.index} 
            className="text-blue-600 underline"
            dangerouslySetInnerHTML={{ __html: replacement }}
          />
        );
      } else {
        // Normal replacement
        parts.push(
          <span key={match.index} className="bg-blue-100 text-blue-800 px-1 rounded">
            {replacement}
          </span>
        );
      }
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return parts.length > 0 ? parts : text;
  };

  // Render element settings panel based on type
  const renderElementSettings = () => {
    if (!selectedElement) return null;

    // Common settings for most elements
    const commonSettings = (
      <>
        <div className="space-y-2">
          <Label>Padding</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs mb-1 block">Top</Label>
              <Input 
                value={selectedElement.settings?.paddingTop || '0'} 
                onChange={(e) => updateElement(
                  selectedElement.id, 
                  { settings: { paddingTop: e.target.value } }
                )}
                size="sm"
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Bottom</Label>
              <Input 
                value={selectedElement.settings?.paddingBottom || '0'} 
                onChange={(e) => updateElement(
                  selectedElement.id, 
                  { settings: { paddingBottom: e.target.value } }
                )}
                size="sm"
              />
            </div>
          </div>
        </div>
      </>
    );

    switch (selectedElement.type) {
      case 'header':
      case 'text':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea 
                ref={textAreaRef}
                value={selectedElement.content?.text || ''}
                onChange={(e) => updateElement(
                  selectedElement.id, 
                  { content: { text: e.target.value } }
                )}
                rows={5}
              />
            </div>
            
            {/* Text formatting */}
            <div className="space-y-2">
              <Label>Text Formatting</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs mb-1 block">Font Size</Label>
                  <Input 
                    value={selectedElement.settings?.fontSize || '16px'} 
                    onChange={(e) => updateElement(
                      selectedElement.id, 
                      { settings: { fontSize: e.target.value } }
                    )}
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Color</Label>
                  <div className="flex">
                    <input 
                      type="color" 
                      value={selectedElement.settings?.color || '#000000'} 
                      onChange={(e) => updateElement(
                        selectedElement.id, 
                        { settings: { color: e.target.value } }
                      )}
                      className="h-9 p-0 w-10 border rounded-l-md"
                    />
                    <Input 
                      value={selectedElement.settings?.color || '#000000'} 
                      onChange={(e) => updateElement(
                        selectedElement.id, 
                        { settings: { color: e.target.value } }
                      )}
                      className="rounded-l-none"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Text alignment */}
            <div className="space-y-2">
              <Label>Text Alignment</Label>
              <div className="flex border rounded-md p-1">
                <Button 
                  variant={selectedElement.settings?.textAlign === 'left' ? 'default' : 'ghost'} 
                  size="sm" 
                  className="flex-1"
                  onClick={() => updateElement(
                    selectedElement.id, 
                    { settings: { textAlign: 'left' } }
                  )}
                >
                  <AlignLeft className="h-4 w-4 mr-2" />
                  Left
                </Button>
                <Button 
                  variant={selectedElement.settings?.textAlign === 'center' ? 'default' : 'ghost'} 
                  size="sm" 
                  className="flex-1"
                  onClick={() => updateElement(
                    selectedElement.id, 
                    { settings: { textAlign: 'center' } }
                  )}
                >
                  <AlignCenter className="h-4 w-4 mr-2" />
                  Center
                </Button>
                <Button 
                  variant={selectedElement.settings?.textAlign === 'right' ? 'default' : 'ghost'} 
                  size="sm" 
                  className="flex-1"
                  onClick={() => updateElement(
                    selectedElement.id, 
                    { settings: { textAlign: 'right' } }
                  )}
                >
                  <AlignRight className="h-4 w-4 mr-2" />
                  Right
                </Button>
              </div>
            </div>
            
            {selectedElement.type === 'text' && (
              <div className="space-y-2">
                <Label>Line Height</Label>
                <Input 
                  value={selectedElement.settings?.lineHeight || '1.5'} 
                  onChange={(e) => updateElement(
                    selectedElement.id, 
                    { settings: { lineHeight: e.target.value } }
                  )}
                />
              </div>
            )}
            
            {commonSettings}
          </div>
        );
      
      case 'image':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input 
                value={selectedElement.content?.src || ''} 
                onChange={(e) => updateElement(
                  selectedElement.id, 
                  { content: { src: e.target.value } }
                )}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Alt Text</Label>
              <Input 
                value={selectedElement.content?.alt || ''} 
                onChange={(e) => updateElement(
                  selectedElement.id, 
                  { content: { alt: e.target.value } }
                )}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Link (optional)</Label>
              <Input 
                value={selectedElement.content?.link || ''} 
                onChange={(e) => updateElement(
                  selectedElement.id, 
                  { content: { link: e.target.value } }
                )}
                placeholder="https://"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Width</Label>
              <Input 
                value={selectedElement.settings?.width || '100%'} 
                onChange={(e) => updateElement(
                  selectedElement.id, 
                  { settings: { width: e.target.value } }
                )}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Alignment</Label>
              <Select 
                value={selectedElement.settings?.alignment || 'center'} 
                onValueChange={(value) => updateElement(
                  selectedElement.id, 
                  { settings: { alignment: value } }
                )}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {commonSettings}
          </div>
        );
      
      case 'button':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Button Text</Label>
              <Input 
                value={selectedElement.content?.text || ''} 
                onChange={(e) => updateElement(
                  selectedElement.id, 
                  { content: { text: e.target.value } }
                )}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Link URL</Label>
              <Input 
                value={selectedElement.content?.link || ''} 
                onChange={(e) => updateElement(
                  selectedElement.id, 
                  { content: { link: e.target.value } }
                )}
                placeholder="https://"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Colors</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs mb-1 block">Background</Label>
                  <div className="flex">
                    <input 
                      type="color" 
                      value={selectedElement.settings?.backgroundColor || '#4F46E5'} 
                      onChange={(e) => updateElement(
                        selectedElement.id, 
                        { settings: { backgroundColor: e.target.value } }
                      )}
                      className="h-9 p-0 w-10 border rounded-l-md"
                    />
                    <Input 
                      value={selectedElement.settings?.backgroundColor || '#4F46E5'} 
                      onChange={(e) => updateElement(
                        selectedElement.id, 
                        { settings: { backgroundColor: e.target.value } }
                      )}
                      className="rounded-l-none"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Text</Label>
                  <div className="flex">
                    <input 
                      type="color" 
                      value={selectedElement.settings?.color || '#FFFFFF'} 
                      onChange={(e) => updateElement(
                        selectedElement.id, 
                        { settings: { color: e.target.value } }
                      )}
                      className="h-9 p-0 w-10 border rounded-l-md"
                    />
                    <Input 
                      value={selectedElement.settings?.color || '#FFFFFF'} 
                      onChange={(e) => updateElement(
                        selectedElement.id, 
                        { settings: { color: e.target.value } }
                      )}
                      className="rounded-l-none"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Button Size & Style</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs mb-1 block">Font Size</Label>
                  <Input 
                    value={selectedElement.settings?.fontSize || '16px'} 
                    onChange={(e) => updateElement(
                      selectedElement.id, 
                      { settings: { fontSize: e.target.value } }
                    )}
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Border Radius</Label>
                  <Input 
                    value={selectedElement.settings?.borderRadius || '4px'} 
                    onChange={(e) => updateElement(
                      selectedElement.id, 
                      { settings: { borderRadius: e.target.value } }
                    )}
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Button Padding</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs mb-1 block">Top</Label>
                  <Input 
                    value={selectedElement.settings?.paddingTop || '12px'} 
                    onChange={(e) => updateElement(
                      selectedElement.id, 
                      { settings: { paddingTop: e.target.value } }
                    )}
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Bottom</Label>
                  <Input 
                    value={selectedElement.settings?.paddingBottom || '12px'} 
                    onChange={(e) => updateElement(
                      selectedElement.id, 
                      { settings: { paddingBottom: e.target.value } }
                    )}
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Left</Label>
                  <Input 
                    value={selectedElement.settings?.paddingLeft || '24px'} 
                    onChange={(e) => updateElement(
                      selectedElement.id, 
                      { settings: { paddingLeft: e.target.value } }
                    )}
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Right</Label>
                  <Input 
                    value={selectedElement.settings?.paddingRight || '24px'} 
                    onChange={(e) => updateElement(
                      selectedElement.id, 
                      { settings: { paddingRight: e.target.value } }
                    )}
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Alignment</Label>
              <Select 
                value={selectedElement.settings?.alignment || 'center'} 
                onValueChange={(value) => updateElement(
                  selectedElement.id, 
                  { settings: { alignment: value } }
                )}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      
      case 'divider':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Style</Label>
              <Select 
                value={selectedElement.settings?.style || 'solid'} 
                onValueChange={(value) => updateElement(
                  selectedElement.id, 
                  { settings: { style: value } }
                )}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solid">Solid</SelectItem>
                  <SelectItem value="dashed">Dashed</SelectItem>
                  <SelectItem value="dotted">Dotted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex">
                <input 
                  type="color" 
                  value={selectedElement.settings?.color || '#EEEEEE'} 
                  onChange={(e) => updateElement(
                    selectedElement.id, 
                    { settings: { color: e.target.value } }
                  )}
                  className="h-9 p-0 w-10 border rounded-l-md"
                />
                <Input 
                  value={selectedElement.settings?.color || '#EEEEEE'} 
                  onChange={(e) => updateElement(
                    selectedElement.id, 
                    { settings: { color: e.target.value } }
                  )}
                  className="rounded-l-none"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Thickness</Label>
              <Input 
                value={selectedElement.settings?.thickness || '1px'} 
                onChange={(e) => updateElement(
                  selectedElement.id, 
                  { settings: { thickness: e.target.value } }
                )}
              />
            </div>
            
            {commonSettings}
          </div>
        );
      
      case 'spacer':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Height</Label>
              <Input 
                value={selectedElement.settings?.height || '20px'} 
                onChange={(e) => updateElement(
                  selectedElement.id, 
                  { settings: { height: e.target.value } }
                )}
              />
            </div>
          </div>
        );
      
      case 'social':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Social Networks</Label>
              {selectedElement.content?.networks.map((network, index) => (
                <div key={index} className="flex items-center gap-2 mt-2">
                  <Input 
                    value={network.name}
                    onChange={(e) => {
                      const updatedNetworks = [...selectedElement.content?.networks];
                      updatedNetworks[index] = { ...updatedNetworks[index], name: e.target.value };
                      updateElement(
                        selectedElement.id, 
                        { content: { networks: updatedNetworks } }
                      );
                    }}
                    placeholder="Network name"
                    className="flex-1"
                  />
                  <Input 
                    value={network.url}
                    onChange={(e) => {
                      const updatedNetworks = [...selectedElement.content?.networks];
                      updatedNetworks[index] = { ...updatedNetworks[index], url: e.target.value };
                      updateElement(
                        selectedElement.id, 
                        { content: { networks: updatedNetworks } }
                      );
                    }}
                    placeholder="URL"
                    className="flex-1"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => {
                      const updatedNetworks = [...selectedElement.content?.networks];
                      updatedNetworks.splice(index, 1);
                      updateElement(
                        selectedElement.id, 
                        { content: { networks: updatedNetworks } }
                      );
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => {
                  const updatedNetworks = [...(selectedElement.content?.networks || [])];
                  updatedNetworks.push({ name: 'network', url: 'https://' });
                  updateElement(
                    selectedElement.id, 
                    { content: { networks: updatedNetworks } }
                  );
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Network
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label>Icon Size</Label>
              <Input 
                value={selectedElement.settings?.iconSize || '32px'} 
                onChange={(e) => updateElement(
                  selectedElement.id, 
                  { settings: { iconSize: e.target.value } }
                )}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Icon Spacing</Label>
              <Input 
                value={selectedElement.settings?.iconSpacing || '10px'} 
                onChange={(e) => updateElement(
                  selectedElement.id, 
                  { settings: { iconSpacing: e.target.value } }
                )}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Alignment</Label>
              <Select 
                value={selectedElement.settings?.alignment || 'center'} 
                onValueChange={(value) => updateElement(
                  selectedElement.id, 
                  { settings: { alignment: value } }
                )}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {commonSettings}
          </div>
        );
      
      default:
        return commonSettings;
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" className="mr-2" onClick={() => setLocation("/marketing")}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Email Template Editor</h1>
            <p className="text-muted-foreground">Create and edit email templates for your campaigns</p>
          </div>
        </div>

        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={() => setMode(mode === 'visual' ? 'code' : 'visual')}>
                  {mode === 'visual' ? <Code className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                  {mode === 'visual' ? 'Code Editor' : 'Visual Editor'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Switch between visual and code editor
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Email Preview</DialogTitle>
                <DialogDescription>
                  Preview how your email will appear to recipients
                </DialogDescription>
              </DialogHeader>
              
              <div className="mt-4 flex justify-center border-b pb-2">
                <div className="flex border rounded-md">
                  <Button 
                    variant={viewMode === 'desktop' ? 'default' : 'ghost'} 
                    className="flex items-center gap-2"
                    onClick={() => setViewMode('desktop')}
                  >
                    <Monitor className="h-4 w-4" />
                    Desktop
                  </Button>
                  <Button 
                    variant={viewMode === 'mobile' ? 'default' : 'ghost'} 
                    className="flex items-center gap-2"
                    onClick={() => setViewMode('mobile')}
                  >
                    <Smartphone className="h-4 w-4" />
                    Mobile
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-center">
                <div 
                  className={`bg-white border shadow rounded-md ${
                    viewMode === 'desktop' ? 'w-[600px]' : 'w-[320px]'
                  }`}
                >
                  <div className="p-2 border-b bg-slate-50 text-sm">
                    <div className="font-medium">{template.subject}</div>
                    <div className="text-slate-500 text-xs">{template.previewText}</div>
                  </div>
                  <div className="p-6">
                    {template.elements.map(element => {
                      // Similar rendering as in the editor, but without controls
                      switch (element.type) {
                        case 'header':
                          return (
                            <h1 
                              key={element.id}
                              style={{
                                fontSize: element.settings.fontSize,
                                textAlign: element.settings.textAlign as any,
                                color: element.settings.color,
                                backgroundColor: element.settings.backgroundColor || 'transparent',
                                paddingTop: element.settings.paddingTop,
                                paddingBottom: element.settings.paddingBottom,
                              }}
                            >
                              {formatPreviewText(element.content.text)}
                            </h1>
                          );
                        
                        case 'text':
                          return (
                            <p 
                              key={element.id}
                              style={{
                                fontSize: element.settings.fontSize,
                                lineHeight: element.settings.lineHeight,
                                color: element.settings.color,
                                paddingTop: element.settings.paddingTop,
                                paddingBottom: element.settings.paddingBottom,
                                fontWeight: element.settings.fontWeight || 'normal',
                                textAlign: (element.settings.textAlign as any) || 'left',
                              }}
                            >
                              {formatPreviewText(element.content.text)}
                            </p>
                          );
                        
                        case 'image':
                          return (
                            <div 
                              key={element.id}
                              style={{
                                textAlign: element.settings.alignment as any,
                                paddingTop: element.settings.paddingTop,
                                paddingBottom: element.settings.paddingBottom,
                              }}
                            >
                              <img 
                                src={element.content.src} 
                                alt={element.content.alt} 
                                style={{
                                  width: element.settings.width,
                                  maxWidth: '100%',
                                }}
                              />
                            </div>
                          );
                        
                        // Other elements...
                        default:
                          return null;
                      }
                    })}
                  </div>
                </div>
              </div>
              
              <DialogFooter className="mt-4">
                <Button variant="outline" type="button">
                  <Send className="h-4 w-4 mr-2" />
                  Send Test Email
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button onClick={() => setLocation("/marketing")}>
            <Save className="h-4 w-4 mr-2" />
            Save Template
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Template details form */}
        <div className="col-span-12">
          <Card className="mb-6">
            <CardContent className="pt-6 pb-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="template-name">Template Name</Label>
                  <Input 
                    id="template-name"
                    value={template.name}
                    onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="template-subject">Email Subject</Label>
                  <Input 
                    id="template-subject"
                    value={template.subject}
                    onChange={(e) => setTemplate({ ...template, subject: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="template-preview">Preview Text</Label>
                  <Input 
                    id="template-preview"
                    value={template.previewText}
                    onChange={(e) => setTemplate({ ...template, previewText: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Template builder or code view */}
        <div className="col-span-12 md:col-span-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Email Content</CardTitle>
                <CardDescription>
                  {mode === 'visual' 
                    ? 'Design your email by adding and arranging content blocks' 
                    : 'Edit the HTML code of your email template'}
                </CardDescription>
              </div>
              
              {mode === 'visual' && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setShowPersonalization(!showPersonalization)}>
                    <Database className="h-4 w-4 mr-2" />
                    {showPersonalization ? 'Hide Tokens' : 'Personalization'}
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Element
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Content Elements</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => addElement('header')}>
                        <Type className="h-4 w-4 mr-2" />
                        Header
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => addElement('text')}>
                        <FileText className="h-4 w-4 mr-2" />
                        Text
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => addElement('image')}>
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Image
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => addElement('button')}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Button
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => addElement('divider')}>
                        <Separator className="h-4 w-4 mr-2" />
                        Divider
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => addElement('spacer')}>
                        <LayoutGrid className="h-4 w-4 mr-2" />
                        Spacer
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => addElement('social')}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Social Links
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
              
              {mode === 'code' && (
                <Button variant="outline" onClick={() => setMode('visual')}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Update Visual Builder
                </Button>
              )}
            </CardHeader>
            
            <CardContent>
              {mode === 'visual' ? (
                <div className="relative">
                  {/* Personalization sidebar */}
                  {showPersonalization && (
                    <div className="absolute right-0 top-0 w-64 h-full bg-white border-l shadow-lg z-10">
                      <div className="p-4 border-b">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">Personalization</h3>
                          <Button variant="ghost" size="icon" onClick={() => setShowPersonalization(false)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Insert dynamic content that will be personalized for each recipient
                        </p>
                      </div>
                      
                      <ScrollArea className="h-[calc(100vh-20rem)]">
                        <div className="p-4">
                          <Accordion type="single" collapsible>
                            {personalizationTokens.map((category, index) => (
                              <AccordionItem key={index} value={`item-${index}`}>
                                <AccordionTrigger className="text-sm">{category.name}</AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-2 pl-2">
                                    {category.tokens.map((token, tokenIndex) => (
                                      <Button 
                                        key={tokenIndex} 
                                        variant="ghost" 
                                        size="sm" 
                                        className="w-full justify-start text-xs font-normal"
                                        onClick={() => insertToken(token.value)}
                                      >
                                        <span className="truncate">{token.label}</span>
                                        <span className="ml-2 text-xs text-slate-500">{token.value}</span>
                                      </Button>
                                    ))}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                  
                  {/* Main editor area */}
                  <div 
                    ref={editorRef}
                    className={`p-6 border rounded-md bg-slate-50 min-h-[600px] ${showPersonalization ? 'mr-64' : ''}`}
                  >
                    <div className="max-w-[600px] mx-auto bg-white border shadow rounded-md p-6">
                      {template.elements.map(element => renderElement(element))}
                      
                      <Button 
                        variant="ghost" 
                        className="w-full mt-4 border border-dashed" 
                        onClick={() => addElement('text')}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Element
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border rounded-md">
                  <Textarea 
                    value={htmlCode} 
                    onChange={(e) => setHtmlCode(e.target.value)} 
                    className="font-mono text-sm p-4 min-h-[600px]"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Settings panel */}
        <div className="col-span-12 md:col-span-4">
          <Card>
            {mode === 'visual' && selectedElement ? (
              <>
                <CardHeader className="pb-2">
                  <CardTitle>Element Settings</CardTitle>
                  <CardDescription>
                    Configure the selected {selectedElement.type} element
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[calc(100vh-22rem)]">
                    <div className="pr-4">
                      {renderElementSettings()}
                    </div>
                  </ScrollArea>
                </CardContent>
              </>
            ) : (
              <>
                <CardHeader className="pb-3">
                  <CardTitle>Templates</CardTitle>
                  <CardDescription>
                    Start with a predefined template or create your own
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border rounded-md overflow-hidden">
                      <div className="aspect-video bg-slate-100 overflow-hidden flex items-center justify-center">
                        <FileText className="h-8 w-8 text-slate-400" />
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-sm">Connect Email Platform</h3>
                        <p className="text-xs text-slate-500 mt-1">Connect your email service to load templates</p>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full mt-2"
                          disabled
                        >
                          No Templates Available
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="font-medium mb-4">Email Settings</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="cursor-pointer">Track Opens</Label>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label className="cursor-pointer">Track Clicks</Label>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label className="cursor-pointer">Inline CSS</Label>
                        <Switch defaultChecked />
                      </div>
                      
                      <div>
                        <Label>Sender Name</Label>
                        <Input className="mt-1" defaultValue="AVEROX Team" />
                      </div>
                      
                      <div>
                        <Label>Reply-to Email</Label>
                        <Input className="mt-1" defaultValue="support@averox.com" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}