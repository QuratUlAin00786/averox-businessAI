import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useExactRoute } from "@/hooks/use-exact-route";
import { 
  Mail,
  ChevronLeft,
  Image,
  Link2,
  Bold,
  Italic,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Clock,
  Calendar,
  CircleCheck,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function CreateCampaignPage() {
  const [location, setLocation] = useLocation();
  const [step, setStep] = useState<number>(1);
  const [campaignType, setCampaignType] = useState<string>("email");
  const [editorContent, setEditorContent] = useState<string>("");
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ensure this component renders correctly for refresh navigation
  useEffect(() => {
    // Set distinctive page identifier
    document.body.setAttribute('data-page', 'marketing-create');
    document.title = 'Create New Campaign - Averox Business AI';
    
    return () => {
      document.body.removeAttribute('data-page');
    };
  }, []);

  // Handle link clicks within contentEditable
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Check if clicked element is a link or inside a link
      let linkElement = target;
      while (linkElement && linkElement !== editor) {
        if (linkElement.tagName === 'A') {
          e.preventDefault();
          e.stopPropagation();
          const link = linkElement as HTMLAnchorElement;
          if (link.href && link.href !== window.location.href) {
            window.open(link.href, '_blank', 'noopener,noreferrer');
          }
          return;
        }
        linkElement = linkElement.parentElement as HTMLElement;
      }
    };

    // Add event listener with capture to intercept before contentEditable handling
    editor.addEventListener('click', handleClick, true);
    
    return () => {
      editor.removeEventListener('click', handleClick, true);
    };
  }, []);

  const proceedToStep = (nextStep: number) => {
    setStep(nextStep);
  };

  const insertFormatting = (command: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    
    editor.focus();
    
    try {
      // Primary method: execCommand (works in most environments)
      const selection = window.getSelection();
      if (!selection) return;
      
      if (selection.rangeCount === 0) {
        const range = document.createRange();
        range.selectNodeContents(editor);
        range.collapse(false);
        selection.addRange(range);
      }
      
      // Try execCommand first
      if (document.execCommand && typeof document.execCommand === 'function') {
        const success = document.execCommand(command, false, '');
        if (success) {
          setEditorContent(editor.innerHTML);
          return;
        }
      }
      
      // Fallback for deployment environments where execCommand might be deprecated
      const range = selection.getRangeAt(0);
      const selectedText = range.toString();
      
      if (selectedText) {
        let element: HTMLElement;
        if (command === 'bold') {
          element = document.createElement('strong');
        } else if (command === 'italic') {
          element = document.createElement('em');
        } else {
          return; // Unsupported command
        }
        
        element.textContent = selectedText;
        range.deleteContents();
        range.insertNode(element);
        
        // Move cursor after the inserted element
        range.setStartAfter(element);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        
        setEditorContent(editor.innerHTML);
      }
    } catch (error) {
      console.warn(`Formatting command ${command} failed:`, error);
      // Final fallback: direct DOM manipulation
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const selectedText = range.toString();
        if (selectedText) {
          const tagName = command === 'bold' ? 'b' : command === 'italic' ? 'i' : 'span';
          const wrapper = document.createElement(tagName);
          wrapper.textContent = selectedText;
          range.deleteContents();
          range.insertNode(wrapper);
          setEditorContent(editor.innerHTML);
        }
      }
    }
  };

  const handleBold = () => {
    insertFormatting('bold');
  };

  const handleItalic = () => {
    insertFormatting('italic');
  };

  const handleBulletList = () => {
    const editor = editorRef.current;
    if (!editor) return;
    
    editor.focus();
    
    const selection = window.getSelection();
    
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      
      // If there's selected text, replace it with bullet format
      if (!range.collapsed) {
        // Get the selected content including HTML structure
        const container = document.createElement('div');
        container.appendChild(range.cloneContents());
        
        // Get plain text but preserve line structure
        const selectedHTML = container.innerHTML;
        const selectedText = container.textContent || container.innerText || '';
        
        // Split by actual line breaks or <br> tags
        let lines = [];
        if (selectedHTML.includes('<br>') || selectedHTML.includes('<div>')) {
          // Handle HTML line breaks
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = selectedHTML;
          const textNodes = tempDiv.childNodes;
          
          let currentLine = '';
          for (let i = 0; i < textNodes.length; i++) {
            const node = textNodes[i];
            if (node.nodeType === Node.TEXT_NODE) {
              currentLine += node.textContent;
            } else if (node.nodeName === 'BR' || node.nodeName === 'DIV') {
              lines.push(currentLine);
              currentLine = '';
              if (node.nodeName === 'DIV' && node.textContent) {
                currentLine = node.textContent;
              }
            }
          }
          if (currentLine) {
            lines.push(currentLine);
          }
        } else {
          // Handle plain text line breaks
          lines = selectedText.split(/\r?\n/);
        }
        
        // Create proper HTML list structure for bullet points
        const listItems = lines
          .filter(line => line.trim() !== '')
          .map(line => `<li style="margin-bottom: 4px;">${line.trim()}</li>`)
          .join('');
        
        const bulletHTML = `<ul style="margin: 8px 0; padding-left: 20px; list-style-type: disc;">${listItems}</ul>`;
        
        // Replace the selected content
        range.deleteContents();
        
        // Insert the new bullet content as HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = bulletHTML;
        
        // Insert the HTML list
        const listElement = tempDiv.firstChild;
        if (listElement) {
          range.insertNode(listElement);
          
          // Position cursor at the end of the list
          const newRange = document.createRange();
          newRange.setStartAfter(listElement);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      } else {
        // Insert a new list item at cursor position
        const listHTML = `<ul style="margin: 8px 0; padding-left: 20px; list-style-type: disc;"><li style="margin-bottom: 4px;">New bullet point</li></ul>`;
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = listHTML;
        
        const listElement = tempDiv.firstChild;
        if (listElement) {
          range.insertNode(listElement);
          
          // Position cursor inside the new list item
          const listItem = (listElement as Element).querySelector('li');
          if (listItem) {
            const newRange = document.createRange();
            newRange.selectNodeContents(listItem);
            newRange.collapse(false);
            selection.removeAllRanges();
            selection.addRange(newRange);
          }
        }
      }
    } else {
      // Fallback: add at the end if no selection
      const listHTML = `<ul style="margin: 8px 0; padding-left: 20px; list-style-type: disc;"><li style="margin-bottom: 4px;">New bullet point</li></ul>`;
      
      if (!editor.innerHTML || editor.innerHTML.trim() === '' || editor.innerHTML === '<br>') {
        editor.innerHTML = listHTML;
      } else {
        editor.innerHTML = editor.innerHTML + '<br>' + listHTML;
      }
      
      // Position cursor at the end
      if (selection) {
        const range = document.createRange();
        range.selectNodeContents(editor);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
    
    setEditorContent(editor.innerHTML);
  };

  const handleNumberedList = () => {
    const editor = editorRef.current;
    if (!editor) return;
    
    editor.focus();
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const selectedText = range.toString().trim();
    
    if (selectedText && selectedText.length > 0) {
      // We have selected text - convert it to numbered list
      console.log('Selected text:', selectedText);
      
      // For numbering, we need to capture ALL content including text nodes and elements
      const clonedFragment = range.cloneContents();
      const analyzeDiv = document.createElement('div');
      analyzeDiv.appendChild(clonedFragment);
      
      let textLines: string[] = [];
      
      // Get all child nodes (including text nodes and elements)
      const childNodes = Array.from(analyzeDiv.childNodes);
      
      if (childNodes.length > 1) {
        // Multiple nodes - extract text from each one
        childNodes.forEach(node => {
          let text = '';
          if (node.nodeType === Node.TEXT_NODE) {
            text = node.textContent?.trim() || '';
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            text = (node as Element).textContent?.trim() || '';
          }
          
          if (text && text.length > 0) {
            textLines.push(text);
          }
        });
      } else if (childNodes.length === 1) {
        // Single node - check if it contains divs or other elements
        const singleNode = childNodes[0];
        if (singleNode.nodeType === Node.ELEMENT_NODE) {
          const element = singleNode as Element;
          const innerDivs = element.querySelectorAll('div');
          
          if (innerDivs.length > 0) {
            // Has internal divs - extract from each
            innerDivs.forEach(div => {
              const text = div.textContent?.trim();
              if (text && text.length > 0) {
                textLines.push(text);
              }
            });
          } else {
            // No internal structure - use the whole text
            const text = element.textContent?.trim();
            if (text && text.length > 0) {
              textLines.push(text);
            }
          }
        } else {
          // Text node - use as single item
          const text = singleNode.textContent?.trim();
          if (text && text.length > 0) {
            textLines.push(text);
          }
        }
      }
      
      // Fallback - if no lines extracted, use the original selected text
      if (textLines.length === 0) {
        textLines = [selectedText];
      }
      
      console.log('Text lines:', textLines);
      
      // Create the numbered list HTML
      const listItems = textLines.map(line => `<li>${line}</li>`).join('');
      const numberedListHTML = `<ol style="margin: 8px 0; padding-left: 20px; list-style-type: decimal;">${listItems}</ol>`;
      
      console.log('Generated HTML:', numberedListHTML);
      
      // Replace the selected text with the numbered list
      range.deleteContents();
      
      const listDiv = document.createElement('div');
      listDiv.innerHTML = numberedListHTML;
      const insertFragment = document.createDocumentFragment();
      while (listDiv.firstChild) {
        insertFragment.appendChild(listDiv.firstChild);
      }
      
      range.insertNode(insertFragment);
      
      // Position cursor after the inserted list
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
      
    } else {
      // No text selected - insert a new numbered list item
      const numberedListHTML = `<ol style="margin: 8px 0; padding-left: 20px; list-style-type: decimal;"><li>New item</li></ol>`;
      
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = numberedListHTML;
      const fragment = document.createDocumentFragment();
      while (tempDiv.firstChild) {
        fragment.appendChild(tempDiv.firstChild);
      }
      
      range.insertNode(fragment);
      
      // Position cursor inside the new list item
      const newListItem = fragment.querySelector ? fragment.querySelector('li') : 
                          editor.querySelector('ol:last-of-type li:last-child');
      
      if (newListItem) {
        const newRange = document.createRange();
        newRange.selectNodeContents(newListItem);
        newRange.collapse(false);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    }
    
    // Update the editor content state
    setEditorContent(editor.innerHTML);
  };

  const handleImageInsert = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if it's an image file with multiple validation methods for deployment compatibility
    const isImageByType = file.type.startsWith('image/');
    const isImageByExtension = /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(file.name);
    
    if (!isImageByType && !isImageByExtension) {
      alert('Please select an image file (jpg, png, gif, etc.).');
      return;
    }

    // Check file size (max 10MB for deployment compatibility)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert('Image file is too large. Please select an image under 10MB.');
      return;
    }

    try {
      // Create a FileReader to convert image to base64
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imageDataUrl = e.target?.result as string;
          if (imageDataUrl) {
            insertImageIntoEditor(imageDataUrl, file.name);
          }
        } catch (error) {
          console.error('Error processing image:', error);
          alert('Failed to process the image. Please try a different image.');
        }
      };
      reader.onerror = () => {
        alert('Failed to read the image file. Please try again.');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload the image. Please try again.');
    }

    // Clear the input value to allow re-selecting the same file
    event.target.value = '';
  };

  const insertImageIntoEditor = (src: string, altText: string) => {
    const editor = editorRef.current;
    if (!editor) return;

    try {
      // Ensure editor is focused for consistent behavior across browsers
      editor.focus();

      // Create image element with deployment-safe attributes
      const img = document.createElement('img');
      img.src = src;
      img.alt = altText || 'Uploaded image';
      
      // Set styles for consistent rendering across environments
      img.style.cssText = `
        max-width: 100%;
        height: auto;
        margin: 8px 0;
        display: block;
        border-radius: 4px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      `;

      // Add loading and error handling for deployment reliability
      img.onload = () => {
        console.log('Image loaded successfully in editor');
      };
      img.onerror = () => {
        console.error('Failed to load image in editor');
        img.alt = 'Failed to load image';
        img.style.cssText += 'background-color: #f3f4f6; padding: 20px; text-align: center;';
      };

      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        try {
          const range = selection.getRangeAt(0);
          
          // Clear any selected content
          range.deleteContents();
          
          // Insert image at cursor position
          range.insertNode(img);
          
          // Add a line break after the image for better editing
          const br = document.createElement('br');
          range.insertNode(br);
          
          // Move cursor after the image and line break
          const newRange = document.createRange();
          newRange.setStartAfter(br);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        } catch (rangeError) {
          console.warn('Range insertion failed, appending to end:', rangeError);
          // Fallback to appending at end
          editor.appendChild(img);
          editor.appendChild(document.createElement('br'));
        }
      } else {
        // No selection - append to end with line break
        editor.appendChild(img);
        editor.appendChild(document.createElement('br'));
      }
      
      // Update editor content state
      setEditorContent(editor.innerHTML);
      
      console.log('Image inserted successfully into editor');
    } catch (error) {
      console.error('Error inserting image into editor:', error);
      alert('Failed to insert image into editor. Please try again.');
    }
  };

  const handleTextAlign = (alignment: 'left' | 'center' | 'right') => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.focus();

    try {
      // Primary method: try execCommand for alignment (widely supported)
      const commandMap = {
        'left': 'justifyLeft',
        'center': 'justifyCenter',
        'right': 'justifyRight'
      };
      
      const command = commandMap[alignment];
      if (document.execCommand && typeof document.execCommand === 'function') {
        const success = document.execCommand(command, false, '');
        if (success) {
          setEditorContent(editor.innerHTML);
          return;
        }
      }

      // Fallback method: direct DOM manipulation for deployment reliability
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        // No selection - create one at cursor position
        const range = document.createRange();
        range.selectNodeContents(editor);
        range.collapse(false);
        selection?.addRange(range);
      }

      const range = selection?.getRangeAt(0);
      if (!range) return;
      
      if (!range.collapsed) {
        // Text is selected - wrap it in a div with alignment
        const selectedContent = range.extractContents();
        const alignDiv = document.createElement('div');
        alignDiv.setAttribute('style', `text-align: ${alignment}; margin: 4px 0;`);
        alignDiv.appendChild(selectedContent);
        
        range.insertNode(alignDiv);
        
        // Select the aligned content
        const newRange = document.createRange();
        newRange.selectNodeContents(alignDiv);
        selection?.removeAllRanges();
        selection?.addRange(newRange);
      } else {
        // No selection - find current block element and align it
        let currentElement: Node | null = range.startContainer;
        
        // Find the parent block element
        while (currentElement && currentElement !== editor) {
          if (currentElement.nodeType === Node.ELEMENT_NODE) {
            const element = currentElement as HTMLElement;
            if (element.tagName && ['DIV', 'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'OL', 'UL', 'LI'].includes(element.tagName)) {
              element.setAttribute('style', (element.getAttribute('style') || '') + `; text-align: ${alignment};`);
              break;
            }
          }
          currentElement = currentElement.parentNode as Node | null;
        }
        
        // If no block element found, create one
        if (currentElement === editor) {
          const alignDiv = document.createElement('div');
          alignDiv.setAttribute('style', `text-align: ${alignment}; margin: 4px 0;`);
          alignDiv.innerHTML = 'Aligned text';
          
          range.insertNode(alignDiv);
          
          // Position cursor inside the div
          const newRange = document.createRange();
          newRange.selectNodeContents(alignDiv);
          newRange.collapse(false);
          selection?.removeAllRanges();
          selection?.addRange(newRange);
        }
      }
      
      setEditorContent(editor.innerHTML);
    } catch (error) {
      console.warn(`Text alignment ${alignment} failed:`, error);
      // Final fallback: apply style directly to editor
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const wrapper = document.createElement('div');
        wrapper.setAttribute('style', `text-align: ${alignment}; margin: 4px 0;`);
        wrapper.innerHTML = range.toString() || 'Aligned content';
        range.deleteContents();
        range.insertNode(wrapper);
        setEditorContent(editor.innerHTML);
      }
    }
  };

  const handleLink = () => {
    const editor = editorRef.current;
    if (!editor) return;
    
    const selection = window.getSelection();
    if (!selection) return;
    
    // Get current selection
    let selectedText = '';
    let range: Range | null = null;
    
    if (selection.rangeCount > 0) {
      range = selection.getRangeAt(0);
      selectedText = range.toString().trim();
    }
    
    if (selectedText) {
      // Convert selected text to link
      const url = prompt('Enter the URL:', 'https://');
      if (!url || url.trim() === '' || url === 'https://') return;
      
      // Validate URL format
      let finalUrl = url.trim();
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = 'https://' + finalUrl;
      }
      
      // Use execCommand for more reliable link creation
      document.execCommand('createLink', false, finalUrl);
      
      // Apply link styling after creation
      setTimeout(() => {
        const links = editor.querySelectorAll('a[href="' + finalUrl + '"]');
        links.forEach(link => {
          link.style.color = '#3b82f6';
          link.style.textDecoration = 'underline';
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer');
        });
        setEditorContent(editor.innerHTML);
      }, 10);
      
    } else {
      // No selection - create new link
      const url = prompt('Enter the URL:', 'https://');
      const linkText = prompt('Enter the link text:', 'Click here');
      
      if (!url || !linkText || url.trim() === '' || url === 'https://' || linkText.trim() === '') return;
      
      // Validate URL format
      let finalUrl = url.trim();
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = 'https://' + finalUrl;
      }
      
      // Create link HTML and insert
      const linkHtml = `<a href="${finalUrl}" target="_blank" rel="noopener noreferrer" style="color: #3b82f6; text-decoration: underline;">${linkText.trim()}</a>&nbsp;`;
      
      // Use execCommand for reliable insertion
      document.execCommand('insertHTML', false, linkHtml);
      setEditorContent(editor.innerHTML);
    }
    
    // Keep focus on editor
    editor.focus();
  };

  const handleCancel = () => {
    // Explicitly navigate to marketing page, replacing current history entry
    setLocation("/marketing", { replace: true });
  };

  // Prevent rendering wrong component - explicit route validation
  if (window.location.pathname !== '/marketing/create') {
    console.log('Route mismatch detected, forcing correct route');
    window.history.replaceState(null, '', '/marketing/create');
    return null; // Don't render anything until route is correct
  }

  return (
    <div className="p-6" data-page="create-campaign">
      <div className="flex items-center mb-6">
        <Button variant="ghost" className="mr-2" onClick={handleCancel}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-slate-900">Create New Campaign</h1>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left sidebar - Progress */}
        <div className="col-span-12 md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Campaign Setup</CardTitle>
              <CardDescription>Complete all steps</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-primary text-white" : "bg-slate-100 text-slate-500"}`}>
                    1
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium ${step >= 1 ? "text-primary" : "text-slate-700"}`}>Campaign Details</div>
                    <div className="text-xs text-slate-500">Name, type, and settings</div>
                  </div>
                  {step > 1 && <CircleCheck className="h-5 w-5 text-primary" />}
                </div>

                <div className="flex items-center space-x-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-primary text-white" : "bg-slate-100 text-slate-500"}`}>
                    2
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium ${step >= 2 ? "text-primary" : "text-slate-700"}`}>Content Creation</div>
                    <div className="text-xs text-slate-500">Design your message</div>
                  </div>
                  {step > 2 && <CircleCheck className="h-5 w-5 text-primary" />}
                </div>

                <div className="flex items-center space-x-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= 3 ? "bg-primary text-white" : "bg-slate-100 text-slate-500"}`}>
                    3
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium ${step >= 3 ? "text-primary" : "text-slate-700"}`}>Recipients</div>
                    <div className="text-xs text-slate-500">Choose your audience</div>
                  </div>
                  {step > 3 && <CircleCheck className="h-5 w-5 text-primary" />}
                </div>

                <div className="flex items-center space-x-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= 4 ? "bg-primary text-white" : "bg-slate-100 text-slate-500"}`}>
                    4
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium ${step >= 4 ? "text-primary" : "text-slate-700"}`}>Review & Schedule</div>
                    <div className="text-xs text-slate-500">Final checks and timing</div>
                  </div>
                  {step > 4 && <CircleCheck className="h-5 w-5 text-primary" />}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main content area */}
        <div className="col-span-12 md:col-span-9">
          <Card>
            {/* Step 1: Campaign Details */}
            {step === 1 && (
              <>
                <CardHeader>
                  <CardTitle>Campaign Details</CardTitle>
                  <CardDescription>Define the basics of your campaign</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="campaign-name">Campaign Name</Label>
                    <Input id="campaign-name" placeholder="E.g., Spring Sale Announcement" />
                  </div>

                  <div className="space-y-2">
                    <Label>Campaign Type</Label>
                    <RadioGroup value={campaignType} onValueChange={setCampaignType} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className={`border rounded-lg p-4 cursor-pointer ${campaignType === "email" ? "border-primary bg-primary/5" : ""}`}>
                        <RadioGroupItem value="email" id="email" className="sr-only" />
                        <Label htmlFor="email" className="flex flex-col items-center cursor-pointer gap-2">
                          <Mail className="h-8 w-8 text-primary" />
                          <span className="font-medium">Email Campaign</span>
                          <span className="text-xs text-center text-slate-500">Standard email to your audience</span>
                        </Label>
                      </div>

                      <div className={`border rounded-lg p-4 cursor-pointer ${campaignType === "automated" ? "border-primary bg-primary/5" : ""}`}>
                        <RadioGroupItem value="automated" id="automated" className="sr-only" />
                        <Label htmlFor="automated" className="flex flex-col items-center cursor-pointer gap-2">
                          <Clock className="h-8 w-8 text-primary" />
                          <span className="font-medium">Automated Sequence</span>
                          <span className="text-xs text-center text-slate-500">Multi-step automated workflow</span>
                        </Label>
                      </div>

                      <div className={`border rounded-lg p-4 cursor-pointer ${campaignType === "ab" ? "border-primary bg-primary/5" : ""}`}>
                        <RadioGroupItem value="ab" id="ab" className="sr-only" />
                        <Label htmlFor="ab" className="flex flex-col items-center cursor-pointer gap-2">
                          <Image className="h-8 w-8 text-primary" />
                          <span className="font-medium">A/B Test</span>
                          <span className="text-xs text-center text-slate-500">Test different versions</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Campaign Description (optional)</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Enter a brief description of this campaign's purpose" 
                      className="min-h-24" 
                    />
                  </div>
                  
                  <div className="pt-4 flex justify-end">
                    <Button onClick={() => proceedToStep(2)}>
                      Continue to Content
                    </Button>
                  </div>
                </CardContent>
              </>
            )}

            {/* Step 2: Content Creation */}
            {step === 2 && (
              <>
                <CardHeader>
                  <CardTitle>Content Creation</CardTitle>
                  <CardDescription>Design the content for your campaign</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Email Subject Line</Label>
                    <Input id="subject" placeholder="Enter an attention-grabbing subject line" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preview">Preview Text</Label>
                    <Input 
                      id="preview" 
                      placeholder="Brief text that appears after the subject line in most email clients" 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Email Content</Label>
                    <Tabs defaultValue="design" className="w-full">
                      <TabsList className="w-full grid grid-cols-2">
                        <TabsTrigger value="design">Visual Design</TabsTrigger>
                        <TabsTrigger value="code">HTML Code</TabsTrigger>
                      </TabsList>

                      <TabsContent value="design" className="space-y-2">
                        <div className="border rounded-md p-4">
                          <div className="text-xs text-slate-500 mb-2 px-2 bg-green-50 p-2 rounded">
                            <strong>Visual Editor:</strong> Select text and use Bold/Italic buttons to apply formatting. The text will appear styled in this editor.
                          </div>
                          <div className="flex items-center gap-2 mb-4 p-2 border-b">
                            <Button variant="outline" size="icon" onClick={handleBold}>
                              <Bold className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={handleItalic}>
                              <Italic className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={handleLink}>
                              <Link2 className="h-4 w-4" />
                            </Button>
                            <Separator orientation="vertical" className="h-6" />
                            <Button variant="outline" size="icon" onClick={handleBulletList}>
                              <List className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={handleNumberedList}>
                              <ListOrdered className="h-4 w-4" />
                            </Button>
                            <Separator orientation="vertical" className="h-6" />
                            <Button variant="outline" size="icon" onClick={() => handleTextAlign('left')}>
                              <AlignLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => handleTextAlign('center')}>
                              <AlignCenter className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => handleTextAlign('right')}>
                              <AlignRight className="h-4 w-4" />
                            </Button>
                            <Separator orientation="vertical" className="h-6" />
                            <Button variant="outline" size="icon" onClick={handleImageInsert}>
                              <Image className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="min-h-96 border rounded-md p-4">
                            <div
                              ref={editorRef}
                              className="min-h-80 border-none resize-none outline-none p-2 relative"
                              contentEditable
                              suppressContentEditableWarning={true}
                              onInput={(e) => {
                                const target = e.target as HTMLDivElement;
                                setEditorContent(target.innerHTML);
                              }}
                              onBlur={(e) => {
                                const target = e.target as HTMLDivElement;
                                if (!target.textContent?.trim()) {
                                  target.classList.add('empty');
                                } else {
                                  target.classList.remove('empty');
                                }
                              }}
                              onFocus={(e) => {
                                const target = e.target as HTMLDivElement;
                                target.classList.remove('empty');
                              }}
                              onMouseDown={(e) => {
                                const target = e.target as HTMLElement;
                                if (target.tagName === 'A' && !e.ctrlKey && !e.metaKey) {
                                  // For regular clicks on links, prevent default editing behavior
                                  e.preventDefault();
                                  const link = target as HTMLAnchorElement;
                                  if (link.href) {
                                    window.open(link.href, '_blank', 'noopener,noreferrer');
                                  }
                                }
                              }}
                              style={{ 
                                minHeight: '320px',
                                position: 'relative'
                              }}
                              data-placeholder="Start typing your email content here..."
                            />
                          </div>
                          
                          {/* Hidden file input for image uploads */}
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{ display: 'none' }}
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="code">
                        <Textarea 
                          className="min-h-96 font-mono"
                          placeholder="<!DOCTYPE html><html><head><title>My Email</title></head><body><h1>My Email Content</h1></body></html>"
                          value={editorContent}
                          onChange={(e) => setEditorContent(e.target.value)}
                        />
                      </TabsContent>
                    </Tabs>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <Button variant="outline" onClick={() => proceedToStep(1)}>
                      Back
                    </Button>
                    <Button onClick={() => proceedToStep(3)}>
                      Continue to Recipients
                    </Button>
                  </div>
                </CardContent>
              </>
            )}

            {/* Step 3: Recipients */}
            {step === 3 && (
              <>
                <CardHeader>
                  <CardTitle>Select Recipients</CardTitle>
                  <CardDescription>Choose who will receive your campaign</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Label>Audience Selection</Label>
                    <RadioGroup defaultValue="all-contacts" className="space-y-4">
                      <div className="flex items-center space-x-2 border p-4 rounded-md">
                        <RadioGroupItem value="all-contacts" id="all-contacts" />
                        <Label htmlFor="all-contacts" className="flex-1 cursor-pointer">
                          <div className="font-medium">All Contacts</div>
                          <div className="text-sm text-slate-500">5,421 recipients</div>
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2 border p-4 rounded-md">
                        <RadioGroupItem value="list" id="list" />
                        <Label htmlFor="list" className="flex-1 cursor-pointer">
                          <div className="font-medium">Specific List</div>
                          <div className="text-sm text-slate-500">Select one or more contact lists</div>
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2 border p-4 rounded-md">
                        <RadioGroupItem value="segment" id="segment" />
                        <Label htmlFor="segment" className="flex-1 cursor-pointer">
                          <div className="font-medium">Segment</div>
                          <div className="text-sm text-slate-500">Define criteria to target specific contacts</div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Available Lists</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-60">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="list-1" className="rounded" />
                            <Label htmlFor="list-1" className="flex-1 cursor-pointer">
                              <div className="font-medium">Newsletter Subscribers</div>
                              <div className="text-xs text-slate-500">3,842 contacts</div>
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="list-2" className="rounded" />
                            <Label htmlFor="list-2" className="flex-1 cursor-pointer">
                              <div className="font-medium">Product Updates</div>
                              <div className="text-xs text-slate-500">2,156 contacts</div>
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="list-3" className="rounded" />
                            <Label htmlFor="list-3" className="flex-1 cursor-pointer">
                              <div className="font-medium">Recent Customers</div>
                              <div className="text-xs text-slate-500">1,893 contacts</div>
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="list-4" className="rounded" />
                            <Label htmlFor="list-4" className="flex-1 cursor-pointer">
                              <div className="font-medium">Enterprise Clients</div>
                              <div className="text-xs text-slate-500">127 contacts</div>
                            </Label>
                          </div>
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  <div className="pt-4 flex justify-between">
                    <Button variant="outline" onClick={() => proceedToStep(2)}>
                      Back
                    </Button>
                    <Button onClick={() => proceedToStep(4)}>
                      Continue to Review
                    </Button>
                  </div>
                </CardContent>
              </>
            )}

            {/* Step 4: Review & Schedule */}
            {step === 4 && (
              <>
                <CardHeader>
                  <CardTitle>Review & Schedule</CardTitle>
                  <CardDescription>Review your campaign and set the delivery schedule</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Campaign Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-slate-500">Campaign Name</div>
                            <div className="font-medium">Spring Sale Announcement</div>
                          </div>
                          
                          <div>
                            <div className="text-sm text-slate-500">Campaign Type</div>
                            <div className="font-medium">Email Campaign</div>
                          </div>
                          
                          <div>
                            <div className="text-sm text-slate-500">Recipients</div>
                            <div className="font-medium">3,842 contacts</div>
                          </div>
                          
                          <div>
                            <div className="text-sm text-slate-500">Subject Line</div>
                            <div className="font-medium">Spring Sale: 25% Off Everything</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-2">
                    <Label>Delivery Schedule</Label>
                    <RadioGroup defaultValue="send-now" className="space-y-4">
                      <div className="flex items-center space-x-2 border p-4 rounded-md">
                        <RadioGroupItem value="send-now" id="send-now" />
                        <Label htmlFor="send-now" className="flex-1 cursor-pointer">
                          <div className="font-medium">Send Immediately</div>
                          <div className="text-sm text-slate-500">Your campaign will be sent as soon as you click "Launch Campaign"</div>
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2 border p-4 rounded-md">
                        <RadioGroupItem value="schedule" id="schedule" />
                        <Label htmlFor="schedule" className="flex-1 cursor-pointer flex-grow">
                          <div className="font-medium">Schedule for Later</div>
                          <div className="text-sm text-slate-500 mb-2">Select a date and time to send your campaign</div>
                          
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-5 w-5 text-slate-500" />
                              <Input type="date" className="max-w-[180px]" />
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-5 w-5 text-slate-500" />
                              <Input type="time" className="max-w-[180px]" />
                            </div>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <Button variant="outline" onClick={() => proceedToStep(3)}>
                      Back
                    </Button>
                    <div className="space-x-2">
                      <Button variant="outline">Save as Draft</Button>
                      <Button onClick={() => setLocation("/marketing")}>Launch Campaign</Button>
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