import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { parseSpreadsheetData } from "@/lib/utils/spreadsheet";
import { z } from "zod";
import { spreadsheetRowSchema } from "@shared/schema";

interface SpreadsheetInputProps {
  onDataUpdate: (data: z.infer<typeof spreadsheetRowSchema>[]) => void;
}

const SpreadsheetInput = ({ onDataUpdate }: SpreadsheetInputProps) => {
  const [cells, setCells] = useState<string[][]>(() => {
    // Try to load saved cells from localStorage
    try {
      const savedCells = localStorage.getItem('spreadsheet_cells');
      if (savedCells) {
        return JSON.parse(savedCells);
      }
    } catch (error) {
      console.error("Error loading saved cells:", error);
    }
    // Default empty cells if nothing is saved
    return Array(6).fill(Array(15).fill(""));
  });
  const tableRef = useRef<HTMLTableElement>(null);
  const { toast } = useToast();

  // Load saved data on component mount
  useEffect(() => {
    try {
      // If we have saved cells, process them to update the parent component
      if (cells.length > 0 && cells[0].length > 0) {
        const extractedData = extractStructuredData(cells);
        onDataUpdate(extractedData);
      }
    } catch (error) {
      console.error("Error processing saved cells:", error);
    }
  }, []);

  // Save table data to localStorage
  const saveTableData = () => {
    try {
      localStorage.setItem('spreadsheet_cells', JSON.stringify(cells));
      
      // Process the data again to make sure parent component has latest
      const extractedData = extractStructuredData(cells);
      onDataUpdate(extractedData);
      
      if (extractedData.length > 0) {
        toast({
          title: "Table content saved",
          description: `Successfully saved ${extractedData.length} rows. Your data will persist even if you close the browser.`,
        });
      } else {
        // Still save the data but provide a more helpful message
        toast({
          title: "Table content saved",
          description: "Your spreadsheet data has been saved, but no valid image generation rows were found. Make sure your table has headers with 'prompt' and 'file_name' columns.",
        });
      }
    } catch (error) {
      console.error("Error saving data:", error);
      toast({
        title: "Error saving data",
        description: "Failed to save table content. Local storage may be full or disabled.",
        variant: "destructive",
      });
    }
  };

  // Function to handle spreadsheet data pasting
  const handlePaste = (e: React.ClipboardEvent<HTMLTableElement>) => {
    e.preventDefault();
    const clipboardData = e.clipboardData || (window as any).clipboardData;
    const pastedData = clipboardData.getData("text");
    
    try {
      // Parse the pasted data
      const parsedData = parseSpreadsheetData(pastedData);
      setCells(parsedData);
      
      // Attempt to extract required fields from the data
      const extractedData = extractStructuredData(parsedData);
      onDataUpdate(extractedData);
      
      // Automatically save to localStorage when pasting
      localStorage.setItem('spreadsheet_cells', JSON.stringify(parsedData));
      
      toast({
        title: "Data pasted successfully",
        description: `Found ${extractedData.length} image entries with valid data. Data has been automatically saved.`,
      });
    } catch (error) {
      toast({
        title: "Error parsing data",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  // Extract structured data from the cells
  const extractStructuredData = (cellData: string[][]) => {
    // Skip if no data
    if (!cellData || cellData.length === 0 || (cellData.length === 1 && cellData[0].every(cell => !cell))) {
      return [];
    }

    // Find header row indices
    const headers = cellData[0] || [];
    
    // Support various header formats - check for anything containing "prompt" or "file"
    const promptColumnIndex = headers.findIndex(
      (header) => header && 
      (header.toLowerCase().includes("prompt") || 
       header.toLowerCase() === "actual_prompt_for_image_generating_ai_tool")
    );
    
    const filenameColumnIndex = headers.findIndex(
      (header) => header && 
      (header.toLowerCase().includes("file") || 
       header.toLowerCase() === "file_name")
    );

    if (promptColumnIndex === -1 || filenameColumnIndex === -1) {
      return []; // Return empty array instead of throwing error
    }

    // Extract data rows
    const dataRows = cellData.slice(1);
    const structuredData = dataRows
      .filter(row => row && row.length > 0 && row[promptColumnIndex] && row[filenameColumnIndex])
      .map(row => ({
        actual_prompt_for_image_generating_ai_tool: row[promptColumnIndex] || "",
        file_name: row[filenameColumnIndex] || "",
      }));

    // Validate with zod schema, but skip invalid rows instead of throwing error
    const validatedData = [];
    for (const row of structuredData) {
      try {
        validatedData.push(spreadsheetRowSchema.parse(row));
      } catch (error) {
        console.warn("Skipping invalid row:", row, error);
        // Continue processing other rows
      }
    }

    return validatedData;
  };

  // Handle cell content change after editing
  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newCells = [...cells];
    
    // Make sure the row exists
    if (!newCells[rowIndex]) {
      newCells[rowIndex] = [];
    }
    
    // Update the cell value
    newCells[rowIndex][colIndex] = value;
    setCells(newCells);
  };
  
  // Make cells editable
  useEffect(() => {
    if (!tableRef.current) return;
    
    const cellElements = tableRef.current.querySelectorAll('td[data-editable="true"]');
    cellElements.forEach((cell) => {
      cell.setAttribute('contenteditable', 'true');
      
      // Add blur event to capture changes when user finishes editing
      cell.addEventListener('blur', (e) => {
        const target = e.target as HTMLTableCellElement;
        const rowIndex = parseInt(target.getAttribute('data-row-index') || '-1');
        const colIndex = parseInt(target.getAttribute('data-col-index') || '-1');
        
        if (rowIndex >= 0 && colIndex >= 0) {
          handleCellChange(rowIndex, colIndex, target.textContent || '');
        }
      });
    });
  }, []);

  return (
    <section className="bg-white rounded-lg shadow-md p-6 max-w-full">
      <h2 className="text-xl font-semibold text-neutral-600 mb-4">Step 1 - Paste Your Excel Information</h2>
      <div className="overflow-auto max-w-full" style={{ maxHeight: "500px" }}>
        <table 
          id="spreadsheet" 
          ref={tableRef}
          className="w-full border-collapse table-fixed" 
          onPaste={handlePaste}
        >
          <thead>
            <tr>
              <th className="border border-neutral-200 bg-neutral-100 p-2 text-center w-12">#</th>
              <th className="border border-neutral-200 bg-neutral-100 p-2 text-left" style={{ minWidth: "300px", width: "500px" }}>A</th>
              <th className="border border-neutral-200 bg-neutral-100 p-2 text-left" style={{ minWidth: "300px", width: "500px" }}>B</th>
              <th className="border border-neutral-200 bg-neutral-100 p-2 text-left" style={{ minWidth: "300px", width: "500px" }}>C</th>
              <th className="border border-neutral-200 bg-neutral-100 p-2 text-left" style={{ minWidth: "300px", width: "500px" }}>D</th>
              <th className="border border-neutral-200 bg-neutral-100 p-2 text-left" style={{ minWidth: "300px", width: "500px" }}>E</th>
              <th className="border border-neutral-200 bg-neutral-100 p-2 text-left" style={{ minWidth: "300px", width: "500px" }}>F</th>
              <th className="border border-neutral-200 bg-neutral-100 p-2 text-left" style={{ minWidth: "300px", width: "500px" }}>G</th>
              <th className="border border-neutral-200 bg-neutral-100 p-2 text-left" style={{ minWidth: "300px", width: "500px" }}>H</th>
              <th className="border border-neutral-200 bg-neutral-100 p-2 text-left" style={{ minWidth: "300px", width: "500px" }}>I</th>
              <th className="border border-neutral-200 bg-neutral-100 p-2 text-left" style={{ minWidth: "300px", width: "500px" }}>J</th>
              <th className="border border-neutral-200 bg-neutral-100 p-2 text-left" style={{ minWidth: "300px", width: "500px" }}>K</th>
              <th className="border border-neutral-200 bg-neutral-100 p-2 text-left" style={{ minWidth: "300px", width: "500px" }}>L</th>
              <th className="border border-neutral-200 bg-neutral-100 p-2 text-left" style={{ minWidth: "300px", width: "500px" }}>M</th>
              <th className="border border-neutral-200 bg-neutral-100 p-2 text-left" style={{ minWidth: "300px", width: "500px" }}>N</th>
              <th className="border border-neutral-200 bg-neutral-100 p-2 text-left" style={{ minWidth: "300px", width: "500px" }}>O</th>
            </tr>
          </thead>
          <tbody>
            {Array(6).fill(0).map((_, rowIndex) => (
              <tr key={`row-${rowIndex}`} data-row-index={rowIndex}>
                <td className="border border-neutral-200 bg-neutral-50 p-2 text-center font-medium w-12">
                  {rowIndex + 1}
                </td>
                {Array(15).fill(0).map((_, colIndex) => (
                  <td 
                    key={`cell-${rowIndex}-${colIndex}`}
                    className="border border-neutral-200 p-2 focus:bg-primary-50 transition-colors"
                    data-editable="true"
                    data-row-index={rowIndex}
                    data-col-index={colIndex}
                    style={{ 
                      minWidth: "300px",
                      width: "500px",
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                      overflow: "visible"
                    }}
                  >
                    {cells[rowIndex]?.[colIndex] || ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-col space-y-4">
        {/* Save Table Content Button */}
        <button
          className="bg-navy hover:bg-navy/90 text-white font-bold py-3 px-4 rounded transition-colors"
          onClick={saveTableData}
        >
          Save Table Content
        </button>
        
        <div className="text-sm text-neutral-400">
          <p>Paste your Excel data directly into the table above. Make sure it includes the <span className="font-medium">actual_prompt_for_image_generating_ai_tool</span> and <span className="font-medium">file_name</span> columns.</p>
          <p className="mt-2">Click "Save Table Content" to ensure your data persists if you close your browser or shut down your computer.</p>
        </div>
      </div>
    </section>
  );
};

export default SpreadsheetInput;
