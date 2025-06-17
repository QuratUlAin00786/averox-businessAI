import { useState, useRef } from "react";
import { useLocation } from "wouter";
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
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<number>(1);
  const [campaignType, setCampaignType] = useState<string>("email");
  const [editorContent, setEditorContent] = useState<string>("");
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const proceedToStep = (nextStep: number) => {
    setStep(nextStep);
  };

  const insertFormatting = (command: string) => {
    const editor = editorRef.current;
    if (editor) {
      editor.focus();
      
      // Ensure there's a selection or cursor position
      const selection = window.getSelection();
      if (selection && selection.rangeCount === 0) {
        const range = document.createRange();
        range.selectNodeContents(editor);
        range.collapse(false);
        selection.addRange(range);
      }
      
      document.execCommand(command, false, '');
      setEditorContent(editor.innerHTML);
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
    alert('Numbering button clicked - function is being called');
    
    const editor = editorRef.current;
    if (!editor) {
      alert('Editor not found');
      return;
    }
    
    editor.focus();
    
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      
      // If there's selected text, replace it with numbered format
      if (!range.collapsed) {
        // Get the selected content including HTML structure
        const container = document.createElement('div');
        container.appendChild(range.cloneContents());
        
        // Get plain text but preserve line structure
        const selectedHTML = container.innerHTML;
        const selectedText = container.textContent || container.innerText || '';
        
        // Enhanced text processing for reliable numbering
        let lines: string[] = [];
        
        if (!selectedText || selectedText.trim() === '') {
          lines = ['New numbered item'];
        } else {
          // Enhanced HTML parsing to handle div elements properly
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = selectedHTML;
          
          // Extract text from div, p, li elements
          const blockElements = tempDiv.querySelectorAll('div, p, li');
          
          if (blockElements.length > 0) {
            // Extract text from each block element
            lines = Array.from(blockElements)
              .map(el => el.textContent?.trim() || '')
              .filter(text => text !== '');
            
          } else if (selectedHTML.includes('<br>')) {
            // Handle br tags
            lines = selectedHTML.split(/<br\s*\/?>/i)
              .map(line => line.replace(/<[^>]*>/g, '').trim())
              .filter(line => line !== '');
              
          } else {
            // Fallback: split by common delimiters
            const cleanText = selectedText.trim();
            
            if (cleanText.includes('\n')) {
              lines = cleanText.split('\n')
                .map(line => line.trim())
                .filter(line => line !== '');
            } else if (cleanText.includes('.') && cleanText.length > 50) {
              lines = cleanText.split(/\.\s+/)
                .map(line => line.trim())
                .filter(line => line !== '');
            } else if (cleanText.includes(',') && cleanText.length > 20) {
              lines = cleanText.split(',')
                .map(line => line.trim())
                .filter(line => line !== '');
            } else if (cleanText.includes(';')) {
              lines = cleanText.split(';')
                .map(line => line.trim())
                .filter(line => line !== '');
            } else {
              lines = [cleanText];
            }
          }
          
          // Ensure we have at least one item
          if (lines.length === 0) {
            lines = ['New numbered item'];
          }
        }
        
        // Create proper HTML ordered list structure
        const listItems = lines
          .filter(line => line.trim() !== '')
          .map(line => `<li style="margin-bottom: 4px;">${line.trim()}</li>`)
          .join('');
        
        const numberedHTML = `<ol style="margin: 8px 0; padding-left: 20px;">${listItems}</ol>`;
        
        // Replace the selected content
        range.deleteContents();
        
        // Insert the new numbered content as HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = numberedHTML;
        
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
        // Insert a new numbered list item at cursor position
        const listHTML = `<ol style="margin: 8px 0; padding-left: 20px;"><li style="margin-bottom: 4px;">New numbered item</li></ol>`;
        
        try {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = listHTML;
          
          const listElement = tempDiv.firstChild as HTMLElement;
          if (listElement) {
            range.insertNode(listElement);
            
            // Add a line break after the list for better editing
            const br = document.createElement('br');
            range.insertNode(br);
            
            // Position cursor inside the new list item
            const listItem = listElement.querySelector('li');
            if (listItem) {
              const newRange = document.createRange();
              newRange.selectNodeContents(listItem);
              newRange.collapse(false);
              selection.removeAllRanges();
              selection.addRange(newRange);
            }
          }
        } catch (error) {
          // Fallback: append to end
          editor.innerHTML = editor.innerHTML + '<br>' + listHTML;
        }
      }
    } else {
      // Fallback: add at the end if no selection
      const listHTML = `<ol style="margin: 8px 0; padding-left: 20px;"><li style="margin-bottom: 4px;">New numbered item</li></ol>`;
      
      if (!editor.innerHTML || editor.innerHTML.trim() === '' || editor.innerHTML === '<br>') {
        editor.innerHTML = listHTML;
      } else {
        editor.innerHTML = editor.innerHTML + '<br>' + listHTML;
      }
      
      // Position cursor at the end
      try {
        const range = document.createRange();
        range.selectNodeContents(editor);
        range.collapse(false);
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
      } catch (error) {
        // Silent fail for cursor positioning
      }
    }
    
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

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      
      if (!range.collapsed) {
        // Text is selected - wrap it in a div with alignment
        const selectedContent = range.extractContents();
        const alignDiv = document.createElement('div');
        alignDiv.style.textAlign = alignment;
        alignDiv.appendChild(selectedContent);
        
        range.insertNode(alignDiv);
        
        // Select the aligned content
        const newRange = document.createRange();
        newRange.selectNodeContents(alignDiv);
        selection.removeAllRanges();
        selection.addRange(newRange);
      } else {
        // No selection - find current block element and align it
        let currentElement: Node | null = range.startContainer;
        
        // Find the parent block element
        while (currentElement && currentElement !== editor) {
          if (currentElement.nodeType === Node.ELEMENT_NODE) {
            const element = currentElement as HTMLElement;
            if (element.tagName && ['DIV', 'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(element.tagName)) {
              element.style.textAlign = alignment;
              break;
            }
          }
          currentElement = currentElement.parentNode as Node | null;
        }
        
        // If no block element found, create one
        if (currentElement === editor) {
          const alignDiv = document.createElement('div');
          alignDiv.style.textAlign = alignment;
          alignDiv.innerHTML = 'Aligned text';
          
          range.insertNode(alignDiv);
          
          // Position cursor inside the div
          const newRange = document.createRange();
          newRange.selectNodeContents(alignDiv);
          newRange.collapse(false);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      }
    }
    
    setEditorContent(editor.innerHTML);
  };

  const handleCancel = () => {
    // Navigate back to marketing page
    setLocation("/marketing");
  };

  return (
    <div className="p-6">
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
                            <Button variant="outline" size="icon">
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