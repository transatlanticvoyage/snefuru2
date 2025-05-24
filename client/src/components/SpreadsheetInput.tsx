import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { parseSpreadsheetData } from "@/lib/utils/spreadsheet";
import { z } from "zod";
import { spreadsheetRowSchema } from "@shared/schema";

interface SpreadsheetInputProps {
  onDataUpdate: (data: z.infer<typeof spreadsheetRowSchema>[]) => void;
}

const SpreadsheetInput = ({ onDataUpdate }: SpreadsheetInputProps) => {
  const [cells, setCells] = useState<string[][]>(Array(6).fill(Array(15).fill("")));
  const tableRef = useRef<HTMLTableElement>(null);
  const { toast } = useToast();

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
      
      toast({
        title: "Data pasted successfully",
        description: `Found ${extractedData.length} image entries with valid data`,
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
    // Find header row indices
    const headers = cellData[0] || [];
    const promptColumnIndex = headers.findIndex(
      (header) => header.toLowerCase().includes("prompt") || header.toLowerCase() === "actual_prompt_for_image_generating_ai_tool"
    );
    const filenameColumnIndex = headers.findIndex(
      (header) => header.toLowerCase().includes("file") || header.toLowerCase() === "file_name"
    );

    if (promptColumnIndex === -1 || filenameColumnIndex === -1) {
      throw new Error("Missing required columns: 'actual_prompt_for_image_generating_ai_tool' and 'file_name'");
    }

    // Extract data rows
    const dataRows = cellData.slice(1);
    const structuredData = dataRows
      .filter(row => row[promptColumnIndex] && row[filenameColumnIndex])
      .map(row => ({
        actual_prompt_for_image_generating_ai_tool: row[promptColumnIndex],
        file_name: row[filenameColumnIndex],
      }));

    // Validate with zod schema
    const validatedData = structuredData.map(row => {
      try {
        return spreadsheetRowSchema.parse(row);
      } catch (error) {
        throw new Error(`Invalid row data: ${JSON.stringify(row)}`);
      }
    });

    return validatedData;
  };

  // Make cells editable
  useEffect(() => {
    if (!tableRef.current) return;
    
    const cells = tableRef.current.querySelectorAll('td[data-editable="true"]');
    cells.forEach((cell) => {
      cell.setAttribute('contenteditable', 'true');
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
              <th className="border border-neutral-200 bg-neutral-100 p-2 text-left" style={{ maxWidth: "250px", minWidth: "150px" }}>A</th>
              <th className="border border-neutral-200 bg-neutral-100 p-2 text-left" style={{ maxWidth: "250px", minWidth: "150px" }}>B</th>
              <th className="border border-neutral-200 bg-neutral-100 p-2 text-left" style={{ maxWidth: "250px", minWidth: "150px" }}>C</th>
              <th className="border border-neutral-200 bg-neutral-100 p-2 text-left" style={{ maxWidth: "250px", minWidth: "150px" }}>D</th>
              <th className="border border-neutral-200 bg-neutral-100 p-2 text-left" style={{ maxWidth: "250px", minWidth: "150px" }}>E</th>
              <th className="border border-neutral-200 bg-neutral-100 p-2 text-left" style={{ maxWidth: "250px", minWidth: "150px" }}>F</th>
              <th className="border border-neutral-200 bg-neutral-100 p-2 text-left" style={{ maxWidth: "250px", minWidth: "150px" }}>G</th>
              <th className="border border-neutral-200 bg-neutral-100 p-2 text-left" style={{ maxWidth: "250px", minWidth: "150px" }}>H</th>
              <th className="border border-neutral-200 bg-neutral-100 p-2 text-left" style={{ maxWidth: "250px", minWidth: "150px" }}>I</th>
              <th className="border border-neutral-200 bg-neutral-100 p-2 text-left" style={{ maxWidth: "250px", minWidth: "150px" }}>J</th>
              <th className="border border-neutral-200 bg-neutral-100 p-2 text-left" style={{ maxWidth: "250px", minWidth: "150px" }}>K</th>
              <th className="border border-neutral-200 bg-neutral-100 p-2 text-left" style={{ maxWidth: "250px", minWidth: "150px" }}>L</th>
              <th className="border border-neutral-200 bg-neutral-100 p-2 text-left" style={{ maxWidth: "250px", minWidth: "150px" }}>M</th>
              <th className="border border-neutral-200 bg-neutral-100 p-2 text-left" style={{ maxWidth: "250px", minWidth: "150px" }}>N</th>
              <th className="border border-neutral-200 bg-neutral-100 p-2 text-left" style={{ maxWidth: "250px", minWidth: "150px" }}>O</th>
            </tr>
          </thead>
          <tbody>
            {Array(6).fill(0).map((_, rowIndex) => (
              <tr key={`row-${rowIndex}`}>
                <td className="border border-neutral-200 bg-neutral-50 p-2 text-center font-medium w-12">
                  {rowIndex + 1}
                </td>
                {Array(15).fill(0).map((_, colIndex) => (
                  <td 
                    key={`cell-${rowIndex}-${colIndex}`}
                    className="border border-neutral-200 p-2 focus:bg-primary-50 transition-colors"
                    data-editable="true"
                    style={{ 
                      maxWidth: "250px",
                      minWidth: "150px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
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
      <div className="mt-3 text-sm text-neutral-400">
        <p>Paste your Excel data directly into the table above. Make sure it includes the <span className="font-medium">actual_prompt_for_image_generating_ai_tool</span> and <span className="font-medium">file_name</span> columns.</p>
      </div>
    </section>
  );
};

export default SpreadsheetInput;
