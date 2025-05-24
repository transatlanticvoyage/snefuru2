/**
 * Parses clipboard data from a spreadsheet format into a 2D array of strings
 * @param pastedData The text data pasted from clipboard
 * @returns A 2D array of strings representing the spreadsheet data
 */
export function parseSpreadsheetData(pastedData: string): string[][] {
  // Split the pasted data by newlines to get rows
  const rows = pastedData.split(/\r?\n/).filter(row => row.trim() !== '');
  
  // Process each row into cells (split by tabs)
  const processedRows = rows.map(row => {
    return row.split('\t').map(cell => cell.trim());
  });
  
  // Ensure all rows have the same number of columns by finding the max columns
  const maxColumns = Math.max(...processedRows.map(row => row.length));
  
  // Pad shorter rows with empty strings
  const normalizedRows = processedRows.map(row => {
    const paddedRow = [...row];
    while (paddedRow.length < maxColumns) {
      paddedRow.push('');
    }
    return paddedRow;
  });
  
  return normalizedRows;
}

/**
 * Checks if the spreadsheet data contains the required columns
 * @param headers The array of header strings
 * @param requiredColumns Array of required column names
 * @returns True if all required columns are present
 */
export function hasRequiredColumns(
  headers: string[], 
  requiredColumns: string[]
): boolean {
  // Convert to lowercase for case-insensitive matching
  const lowerCaseHeaders = headers.map(h => h.toLowerCase());
  
  // Check each required column
  return requiredColumns.every(required => {
    const lowerCaseRequired = required.toLowerCase();
    return lowerCaseHeaders.some(header => 
      header === lowerCaseRequired || header.includes(lowerCaseRequired)
    );
  });
}
