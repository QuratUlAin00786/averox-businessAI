import { ProposalElement } from '@shared/schema';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface TableElementEditorProps {
  element: ProposalElement;
  onChange: (updatedElement: ProposalElement) => void;
  disabled?: boolean;
}

export function TableElementEditor({ element, onChange, disabled = false }: TableElementEditorProps) {
  // Safely parse content with proper typing
  const content = typeof element.content === 'string' 
    ? JSON.parse(element.content) 
    : element.content || {};
  
  const headers = content.headers || ['Column 1', 'Column 2', 'Column 3'];
  const rows = content.rows || [
    ['Cell 1-1', 'Cell 1-2', 'Cell 1-3'],
    ['Cell 2-1', 'Cell 2-2', 'Cell 2-3'],
  ];

  const updateTable = (newHeaders: string[], newRows: string[][]) => {
    const updatedContent = {
      ...content,
      headers: newHeaders,
      rows: newRows
    };
    
    onChange({
      ...element,
      content: updatedContent
    });
  };

  const handleHeaderChange = (index: number, value: string) => {
    const newHeaders = [...headers];
    newHeaders[index] = value;
    updateTable(newHeaders, rows);
  };

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = [...rows];
    newRows[rowIndex][colIndex] = value;
    updateTable(headers, newRows);
  };

  const handleAddColumn = () => {
    const newHeaders = [...headers, `Column ${headers.length + 1}`];
    const newRows = rows.map(row => [...row, `Cell`]);
    updateTable(newHeaders, newRows);
  };

  const handleRemoveColumn = (colIndex: number) => {
    if (headers.length <= 1) return;
    
    const newHeaders = [...headers];
    newHeaders.splice(colIndex, 1);
    
    const newRows = rows.map(row => {
      const newRow = [...row];
      newRow.splice(colIndex, 1);
      return newRow;
    });
    
    updateTable(newHeaders, newRows);
  };

  const handleAddRow = () => {
    const newRow = headers.map((_, index) => `Cell ${rows.length + 1}-${index + 1}`);
    const newRows = [...rows, newRow];
    updateTable(headers, newRows);
  };

  const handleRemoveRow = (rowIndex: number) => {
    if (rows.length <= 1) return;
    
    const newRows = [...rows];
    newRows.splice(rowIndex, 1);
    updateTable(headers, newRows);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Table Content</Label>
        <div className="border rounded p-2 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-1 w-10"></th>
                {headers.map((header, colIndex) => (
                  <th key={colIndex} className="p-1">
                    <div className="flex gap-1">
                      <Input
                        value={header}
                        onChange={(e) => handleHeaderChange(colIndex, e.target.value)}
                        placeholder={`Column ${colIndex + 1}`}
                        disabled={disabled}
                        className="h-8"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 flex-shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleRemoveColumn(colIndex)}
                        disabled={disabled || headers.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </th>
                ))}
                <th className="p-1 w-12">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleAddColumn}
                    disabled={disabled || headers.length >= 8}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td className="p-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleRemoveRow(rowIndex)}
                      disabled={disabled || rows.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                  {row.map((cell, colIndex) => (
                    <td key={colIndex} className="p-1">
                      <Input
                        value={cell}
                        onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                        placeholder={`Cell ${rowIndex + 1}-${colIndex + 1}`}
                        disabled={disabled}
                        className="h-8"
                      />
                    </td>
                  ))}
                  <td></td>
                </tr>
              ))}
              <tr>
                <td colSpan={headers.length + 2} className="p-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddRow}
                    disabled={disabled || rows.length >= 10}
                    className="w-full h-8"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Row
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}