import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ProposalElement } from '@shared/schema';

// Default content templates for when elements are missing data
export const getDefaultContent = (type: string) => {
  switch (type) {
    case 'Header':
      return { text: 'New Header', level: 1 };
    case 'Text':
      return { text: 'Enter text content here' };
    case 'Image':
      return { url: '', alt: 'Image', caption: '' };
    case 'Table':
      return { 
        headers: ['Column 1', 'Column 2', 'Column 3'], 
        rows: [
          ['Cell 1-1', 'Cell 1-2', 'Cell 1-3'],
          ['Cell 2-1', 'Cell 2-2', 'Cell 2-3'],
        ] 
      };
    case 'List':
      return { 
        items: ['Item 1', 'Item 2', 'Item 3'],
        ordered: false 
      };
    case 'Quote':
      return { 
        text: 'Enter a quotation here',
        author: 'Author Name' 
      };
    case 'ProductList':
      return { 
        products: [
          { name: 'Product 1', quantity: 1, price: 100 },
          { name: 'Product 2', quantity: 2, price: 200 }
        ],
        subtotal: 500,
        tax: 50,
        discount: 0,
        total: 550 
      };
    case 'Signature':
      return { 
        label: 'Signature',
        name: 'Name',
        role: 'Title',
        date: true 
      };
    case 'PageBreak':
      return {};
    case 'Custom':
      return { html: '<div>Custom HTML content</div>' };
    default:
      return {};
  }
};

interface ElementPreviewProps {
  element: ProposalElement;
  isSelected?: boolean;
}

export function ElementPreview({ element, isSelected }: ElementPreviewProps) {
  try {
    // Safely parse content
    let content;
    try {
      content = typeof element.content === 'string'
        ? JSON.parse(element.content)
        : element.content || {};
    } catch (error) {
      console.error("Error parsing element content in preview:", error, element);
      content = getDefaultContent(element.elementType);
    }
    
    // Ensure we have default values if content is missing properties
    const defaultContent = getDefaultContent(element.elementType);
    content = { ...defaultContent, ...content };
    
    return (
      <div className={cn(
        "border rounded p-3 my-2",
        isSelected ? "border-primary bg-primary/5" : "border-muted"
      )}>
        <h3 className="font-medium mb-2 text-sm flex items-center gap-2">
          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">{element.elementType}</span>
          {element.name}
        </h3>
        <div className="bg-white rounded border p-3 text-sm">
          {renderElementContent(element.elementType, content)}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error rendering element preview:", error);
    return (
      <div className="border border-red-200 bg-red-50 p-3 my-2 rounded">
        <h3 className="font-medium text-red-500">Error rendering element</h3>
        <p className="text-xs text-red-400">
          Type: {element.elementType}, ID: {element.id}
        </p>
      </div>
    );
  }
}

// Full element renderer for the proposal preview mode
export function ElementRenderer({ element }: { element: ProposalElement }) {
  try {
    // Safely parse content with fallback
    let content;
    try {
      content = typeof element.content === 'string'
        ? JSON.parse(element.content)
        : element.content || {};
    } catch (error) {
      console.error("Error parsing element content:", error, element);
      return (
        <Card className="mb-4 border-red-200">
          <CardContent className="p-4">
            <div className="text-red-500">Error parsing element content</div>
            <div className="text-sm text-red-400">Element ID: {element.id}, Type: {element.elementType}</div>
          </CardContent>
        </Card>
      );
    }
    
    // Ensure we have default values if content is missing properties
    const defaultContent = getDefaultContent(element.elementType);
    content = { ...defaultContent, ...content };
    
    return (
      <Card className="mb-6 shadow-sm">
        <CardContent className="p-4">
          {renderElementContent(element.elementType, content, true)}
        </CardContent>
      </Card>
    );
  } catch (error) {
    console.error("Error rendering full element:", error);
    return (
      <Card className="mb-4 border-red-200">
        <CardContent className="p-4">
          <div className="text-red-500">Error rendering element</div>
          <div className="text-sm text-red-400">Element ID: {element.id}, Type: {element.elementType}</div>
        </CardContent>
      </Card>
    );
  }
}

// Core rendering function that handles all element types
function renderElementContent(type: string, content: any, fullView: boolean = false) {
  switch (type) {
    case 'Header':
      const fontSize = fullView 
        ? { 1: 'text-4xl', 2: 'text-3xl', 3: 'text-2xl', 4: 'text-xl' }
        : { 1: 'text-lg', 2: 'text-md', 3: 'text-sm', 4: 'text-xs' };
      
      const level = content.level || 1;
      return (
        <div className={cn(
          fontSize[level as 1|2|3|4], 
          "font-bold"
        )}>
          {content.text || 'Header Text'}
        </div>
      );
    
    case 'Text':
      return (
        <div className={cn(
          fullView ? "text-base" : "text-sm line-clamp-3",
        )}>
          {content.text || 'Text content...'}
        </div>
      );
    
    case 'Image':
      return fullView ? (
        <div className="text-center">
          {content.url ? (
            <>
              <img 
                src={content.url} 
                alt={content.alt || 'Image'} 
                className="max-w-full h-auto mx-auto rounded"
              />
              {content.caption && (
                <div className="text-sm text-gray-500 mt-2">{content.caption}</div>
              )}
            </>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded p-8 text-gray-400">
              Image Placeholder
            </div>
          )}
        </div>
      ) : (
        <div className="text-center text-sm text-gray-500">
          {content.url ? (
            <div className="flex flex-col items-center">
              <div className="w-16 h-12 border rounded bg-gray-50 flex items-center justify-center">
                <span>IMG</span>
              </div>
              <span className="mt-1 text-xs">Image</span>
            </div>
          ) : (
            <span>[Image placeholder]</span>
          )}
        </div>
      );
    
    case 'Table':
      return fullView ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-50">
              <tr>
                {content.headers?.map((header: string, i: number) => (
                  <th key={i} className="border border-gray-300 p-2 text-left">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {content.rows?.map((row: string[], i: number) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                  {row.map((cell: string, j: number) => (
                    <td key={j} className="border border-gray-300 p-2">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center text-sm text-gray-500">
          <div className="border border-gray-200 rounded w-full h-8 flex items-center justify-center text-xs">
            Table: {content.headers?.length || 0} × {content.rows?.length || 0}
          </div>
        </div>
      );
    
    case 'List':
      const items = content.items || ['List item'];
      const previewItems = fullView ? items : items.slice(0, 3);
      
      return content.ordered ? (
        <ol className={cn(
          "list-decimal",
          fullView ? "pl-6 space-y-1" : "list-inside"
        )}>
          {previewItems.map((item: string, i: number) => (
            <li key={i}>{item}</li>
          ))}
          {!fullView && items.length > 3 && <li>...</li>}
        </ol>
      ) : (
        <ul className={cn(
          "list-disc",
          fullView ? "pl-6 space-y-1" : "list-inside"
        )}>
          {previewItems.map((item: string, i: number) => (
            <li key={i}>{item}</li>
          ))}
          {!fullView && items.length > 3 && <li>...</li>}
        </ul>
      );
    
    case 'Quote':
      return (
        <blockquote className={cn(
          "border-l-4 border-gray-300 pl-4 italic",
          fullView && "py-2 bg-gray-50 rounded-r"
        )}>
          <p>{content.text || 'Quote text'}</p>
          {content.author && (
            <footer className="text-right text-sm text-gray-600 mt-2">
              — {content.author}
            </footer>
          )}
        </blockquote>
      );
    
    case 'ProductList':
      if (!fullView) {
        return (
          <div className="text-center text-sm text-gray-500">
            <div className="border border-gray-200 rounded w-full h-8 flex items-center justify-center text-xs">
              Products: {content.products?.length || 0} items
            </div>
          </div>
        );
      }
      
      const products = content.products || [];
      const subtotal = content.subtotal !== undefined 
        ? parseFloat(content.subtotal) 
        : products.reduce((sum: number, product: any) => 
            sum + ((parseFloat(product.price) || 0) * (parseInt(product.quantity) || 0)), 0);
      
      const tax = parseFloat(content.tax || 0);
      const discount = parseFloat(content.discount || 0);
      const total = content.total !== undefined 
        ? parseFloat(content.total) 
        : subtotal + tax - discount;
      
      return (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="border border-gray-300 p-2 text-left">Product</th>
                <th className="border border-gray-300 p-2 text-right">Qty</th>
                <th className="border border-gray-300 p-2 text-right">Price</th>
                <th className="border border-gray-300 p-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((product: any, i: number) => {
                  const price = parseFloat(product.price) || 0;
                  const quantity = parseInt(product.quantity) || 0;
                  const itemTotal = price * quantity;
                  
                  return (
                    <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                      <td className="border border-gray-300 p-2">{product.name || `Product ${i+1}`}</td>
                      <td className="border border-gray-300 p-2 text-right">{quantity}</td>
                      <td className="border border-gray-300 p-2 text-right">${price.toFixed(2)}</td>
                      <td className="border border-gray-300 p-2 text-right">${itemTotal.toFixed(2)}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="border border-gray-300 p-2 text-center text-gray-500">
                    No products
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="font-semibold bg-gray-50">
              <tr>
                <td colSpan={3} className="border border-gray-300 p-2 text-right">
                  Subtotal:
                </td>
                <td className="border border-gray-300 p-2 text-right">${subtotal.toFixed(2)}</td>
              </tr>
              {tax > 0 && (
                <tr>
                  <td colSpan={3} className="border border-gray-300 p-2 text-right">
                    Tax:
                  </td>
                  <td className="border border-gray-300 p-2 text-right">${tax.toFixed(2)}</td>
                </tr>
              )}
              {discount > 0 && (
                <tr>
                  <td colSpan={3} className="border border-gray-300 p-2 text-right">
                    Discount:
                  </td>
                  <td className="border border-gray-300 p-2 text-right">-${discount.toFixed(2)}</td>
                </tr>
              )}
              <tr className="bg-blue-50">
                <td colSpan={3} className="border border-gray-300 p-2 text-right font-bold">
                  Total:
                </td>
                <td className="border border-gray-300 p-2 text-right font-bold">${total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      );
    
    case 'Signature':
      return fullView ? (
        <div className="mt-6">
          <div className="border-t border-gray-300 pt-3">
            <p className="font-semibold">{content.label || 'Signature'}</p>
            {content.signedBy ? (
              <div className="italic text-gray-600 mt-2">
                Signed by {content.signedBy} on {new Date(content.signedAt).toLocaleDateString()}
              </div>
            ) : (
              <div className="mt-2 border-b border-gray-400 py-6">
                {/* Empty space for signature */}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-sm">
          <div className="border-b mt-2 mb-1 w-20"></div>
          <div>{content.name || 'Signature'}</div>
          <div className="text-gray-500 text-xs">{content.role || 'Title'}</div>
        </div>
      );
    
    case 'PageBreak':
      return (
        <div className={cn(
          "border-t-2 border-dashed border-gray-300 my-2 text-center",
          !fullView && "text-xs text-gray-400"
        )}>
          {!fullView && "Page Break"}
        </div>
      );
    
    case 'Custom':
      return fullView ? (
        <div dangerouslySetInnerHTML={{ __html: content.html || '<p>Custom HTML content</p>' }} />
      ) : (
        <div className="text-sm text-gray-500">
          Custom HTML content
        </div>
      );
    
    default:
      return (
        <div className="text-sm text-gray-500">
          Unknown element type: {type}
        </div>
      );
  }
}