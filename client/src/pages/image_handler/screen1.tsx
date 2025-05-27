import React, { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Star } from 'lucide-react';

// Define interfaces
interface Domain {
  id: number;
  domain_base: string | null;
  rel_user_id: number | null;
  created_at: string | null;
}

// Define the image data interface
interface ImageData {
  id: number;
  selected: boolean;
  thumbnail: string;
  filename: string;
  filesize: string;
  filesize_raw: number;
  path: string;
  img_url1: string;
  img_url2: string;
  img_url3: string;
  img_url4: string;
  img_url5: string;
  presented_1: string;
  nice_name_actual: string;
  for_page_1: string;
  nice_name_2: string;
  alt_text: string;
  detail: string;
}

const ImageHandlerScreen1: React.FC = () => {
  useDocumentTitle("Image Handler - Screen 1 - Snefuru");
  
  // State for domains and selections
  const [domains, setDomains] = useState<Domain[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>("");
  const [selectedPageType, setSelectedPageType] = useState<string>("home");

  // Spreadsheet-like table state
  const [sheetCells, setSheetCells] = useState<string[][]>(Array(11).fill(null).map(() => Array(15).fill("")));
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  // Additional state for adding a new domain
  const [showAddDomain, setShowAddDomain] = useState(false);
  const [newDomainValue, setNewDomainValue] = useState("");
  const [isSavingDomain, setIsSavingDomain] = useState(false);

  // Add at the top of the component:
  const [templates, setTemplates] = useState(() => {
    // Try to load from localStorage
    try {
      const saved = localStorage.getItem('column_templates');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [columns, setColumns] = useState<{ label: string; type: string }[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // Save templates to localStorage
  useEffect(() => {
    localStorage.setItem('column_templates', JSON.stringify(templates));
  }, [templates]);

  // Fetch domains on component mount
  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const response = await fetch('/api/domains');
        const data = await response.json();
        // Fix: Extract domains array from the response
        if (data && data.domains && Array.isArray(data.domains)) {
          setDomains(data.domains);
        } else {
          setDomains([]);
        }
      } catch (error) {
        console.error('Error fetching domains:', error);
        setDomains([]);
      }
    };
    fetchDomains();
  }, []);

  // Dummy data based on the screenshot
  const imageData: ImageData[] = [
    {
      id: 16,
      selected: false,
      thumbnail: "thumbnail.jpg",
      filename: "img_01234.jpg",
      filesize: "1.54 MB",
      filesize_raw: 1540,
      path: "2023_05_25-1. thisiscontracting.com. 3671. img#root1",
      img_url1: "Feng feng1",
      img_url2: "550",
      img_url3: "460",
      img_url4: "The Roofing Co roofing contractor",
      img_url5: "centr.",
      presented_1:
        "Professional roofing team working on a shingle roof replacement",
      nice_name_actual: "close up of a roofer installing a metal roof panel",
      for_page_1: "",
      nice_name_2: "",
      alt_text: "",
      detail: "",
    },
    {
      id: 17,
      selected: false,
      thumbnail: "thumbnail.jpg",
      filename: "img_02345.jpg",
      filesize: "2.32 MB",
      filesize_raw: 2320,
      path: "2023_05_25-1. thisiscontracting.com. 3672. img#root1",
      img_url1: "Feng feng1",
      img_url2: "550",
      img_url3: "460",
      img_url4: "Roof Repairs - patching up leaks in the roof",
      img_url5: "centr.",
      presented_1:
        "Roofer removing old shingles from a home roof and preparing surface for installation of the new roof sheeting",
      nice_name_actual: "",
      for_page_1: "",
      nice_name_2: "",
      alt_text: "",
      detail: "",
    },
    {
      id: 18,
      selected: false,
      thumbnail: "thumbnail.jpg",
      filename: "img_03456.jpg",
      filesize: "1.98 MB",
      filesize_raw: 1980,
      path: "2023_05_25-1. thisiscontracting.com. 3673. img#pnv2",
      img_url1: "Feng feng2",
      img_url2: "550",
      img_url3: "460",
      img_url4: "Roof Replacement roofing leak repair",
      img_url5: "centr.",
      presented_1: "",
      nice_name_actual: "",
      for_page_1: "",
      nice_name_2: "",
      alt_text: "",
      detail: "",
    },
    {
      id: 19,
      selected: false,
      thumbnail: "thumbnail.jpg",
      filename: "img_04567.jpg",
      filesize: "2.12 MB",
      filesize_raw: 2120,
      path: "2023_05_25-1. thisiscontracting.com. 3674. img#pnv3",
      img_url1: "Feng feng3",
      img_url2: "550",
      img_url3: "460",
      img_url4: "New Roof roof roofing leak repair",
      img_url5: "centr.",
      presented_1:
        "Close up of professional roof replacement crew installing new shingles on a building roof",
      nice_name_actual: "",
      for_page_1: "",
      nice_name_2: "",
      alt_text: "",
      detail: "",
    },
    {
      id: 20,
      selected: false,
      thumbnail: "thumbnail.jpg",
      filename: "img_05678.webp",
      filesize: "1.86 MB",
      filesize_raw: 1860,
      path: "2023_05_25-1. thisiscontracting.com. 3675. img#pnv4",
      img_url1: "Feng feng4",
      img_url2: "550",
      img_url3: "460",
      img_url4: "Storm Damage Major roof repairs",
      img_url5: "centr.",
      presented_1:
        "Residential roof wearing visible water staining from a leak through a damaged area of a house",
      nice_name_actual: "",
      for_page_1: "",
      nice_name_2: "",
      alt_text: "",
      detail: "",
    },
    {
      id: 21,
      selected: false,
      thumbnail: "thumbnail.jpg",
      filename: "img_06789.gif",
      filesize: "2.32 MB",
      filesize_raw: 2320,
      path: "2023_05_25-1. thisiscontracting.com. 3676. img#pnm2",
      img_url1: "Feng feng2",
      img_url2: "550",
      img_url3: "460",
      img_url4: "Conserve energy improve home comfort",
      img_url5: "centr.",
      presented_1: "",
      nice_name_actual: "",
      for_page_1: "",
      nice_name_2: "",
      alt_text: "",
      detail: "",
    },
  ];

  // Handle cell click to enable editing
  const handleCellClick = (row: number, col: number) => {
    setEditingCell({ row, col });
  };

  // Handle cell value change
  const handleCellChange = (row: number, col: number, value: string) => {
    setSheetCells(prev => {
      const updated = prev.map(rowArr => [...rowArr]);
      updated[row][col] = value;
      return updated;
    });
  };

  // Handle blur to exit editing
  const handleCellBlur = () => {
    setEditingCell(null);
  };

  // Handle paste event for multi-cell paste
  const handleTablePaste = (e: React.ClipboardEvent<HTMLTableElement>) => {
    if (!editingCell) return;
    e.preventDefault();
    const clipboardData = e.clipboardData.getData("text");
    const rows = clipboardData.split(/\r?\n/).filter(Boolean);
    const parsed = rows.map(row => row.split(/\t/));
    setSheetCells(prev => {
      const updated = prev.map(rowArr => [...rowArr]);
      for (let i = 0; i < parsed.length; i++) {
        for (let j = 0; j < parsed[i].length; j++) {
          const r = editingCell.row + i;
          const c = editingCell.col + j;
          if (r < updated.length && c < updated[0].length) {
            updated[r][c] = parsed[i][j];
          }
        }
      }
      return updated;
    });
  };

  const handleAddDomain = async () => {
    if (!newDomainValue.trim()) return;
    setIsSavingDomain(true);
    try {
      const response = await fetch("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain_base: newDomainValue })
      });
      const data = await response.json();
      if (data && data.domain) {
        setDomains(prev => [...prev, data.domain]);
        setSelectedDomain(data.domain.id.toString());
        setShowAddDomain(false);
        setNewDomainValue("");
      }
    } finally {
      setIsSavingDomain(false);
    }
  };

  const handleSelectTemplate = (id: string) => {
    setSelectedTemplateId(id);
    const t = templates.find((tpl: any) => tpl.id === id);
    if (t) {
      setTemplateName(t.name);
      setColumns(t.columns);
      setIsEditing(true);
    }
  };

  const handleNewTemplate = () => {
    setSelectedTemplateId(null);
    setTemplateName("");
    setColumns([]);
    setIsEditing(true);
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) return;
    if (selectedTemplateId) {
      setTemplates((prev: any) => prev.map((tpl: any) => tpl.id === selectedTemplateId ? { ...tpl, name: templateName, columns } : tpl));
    } else {
      const id = Date.now().toString();
      setTemplates((prev: any) => [...prev, { id, name: templateName, columns }]);
      setSelectedTemplateId(id);
    }
    setIsEditing(false);
  };

  const handleDeleteTemplate = () => {
    if (!selectedTemplateId) return;
    setTemplates((prev: any) => prev.filter((tpl: any) => tpl.id !== selectedTemplateId));
    setSelectedTemplateId(null);
    setTemplateName("");
    setColumns([]);
    setIsEditing(false);
  };

  const handleAddColumn = () => {
    setColumns(cols => [...cols, { label: "", type: "text" }]);
  };

  const handleColumnChange = (idx: number, field: string, value: string) => {
    setColumns(cols => cols.map((col, i) => i === idx ? { ...col, [field]: value } : col));
  };

  const handleRemoveColumn = (idx: number) => {
    setColumns(cols => cols.filter((_, i) => i !== idx));
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header pageTitle="Image Handler" />

      {/* Sticky Bar */}
      <div className="sticky top-0 z-50 w-full h-[40px] bg-black m-0 p-0 flex items-center justify-center">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-white text-base">rel_images_batch_id</span>
            <input 
              type="text" 
              className="w-[150px] h-[32px] bg-gray-200 text-black px-2 rounded border border-gray-300"
              readOnly
              value=""
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-white text-base">Select a Domain:</span>
            <Select value={selectedDomain} onValueChange={val => {
              if (val === "__add_new__") {
                setShowAddDomain(true);
              } else {
                setSelectedDomain(val);
                setShowAddDomain(false);
              }
            }}>
              <SelectTrigger className={`w-[200px] h-[32px] ${selectedDomain ? 'bg-[#a5cbfa]' : 'bg-white'}`}>
                <SelectValue placeholder="Select domain" />
              </SelectTrigger>
              <SelectContent>
                {domains.map((domain) => (
                  <SelectItem key={domain.id} value={domain.id.toString()}>
                    {domain.domain_base || 'Unknown Domain'}
                  </SelectItem>
                ))}
                <SelectItem value="__add_new__" className="text-blue-600 font-bold">+ Add New Domain</SelectItem>
              </SelectContent>
            </Select>
            {showAddDomain && (
              <div className="flex items-center space-x-2 ml-2">
                <input
                  type="text"
                  className="border border-gray-300 rounded px-2 h-[32px]"
                  placeholder="Enter new domain"
                  value={newDomainValue}
                  onChange={e => setNewDomainValue(e.target.value)}
                  disabled={isSavingDomain}
                />
                <Button size="sm" className="h-[32px]" onClick={handleAddDomain} disabled={isSavingDomain || !newDomainValue.trim()}>
                  {isSavingDomain ? "Saving..." : "Save"}
                </Button>
                <Button size="sm" className="h-[32px]" variant="outline" onClick={() => { setShowAddDomain(false); setNewDomainValue(""); }}>
                  Cancel
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-white text-base">Select a Page:</span>
            <div className="flex space-x-1">
              <Button 
                variant={selectedPageType === "home" ? "default" : "outline"}
                size="sm"
                className={`h-[32px] ${selectedPageType === "home" ? 'bg-[#a5cbfa] hover:bg-[#8bb8f9]' : 'bg-white'} text-black hover:bg-gray-100`}
                onClick={() => setSelectedPageType("home")}
              >
                Home
              </Button>
              <Button 
                variant={selectedPageType === "services_hub" ? "default" : "outline"}
                size="sm"
                className={`h-[32px] ${selectedPageType === "services_hub" ? 'bg-[#a5cbfa] hover:bg-[#8bb8f9]' : 'bg-white'} text-black hover:bg-gray-100`}
                onClick={() => setSelectedPageType("services_hub")}
              >
                Services Hub
              </Button>
              <Button 
                variant={selectedPageType === "individual_service" ? "default" : "outline"}
                size="sm"
                className={`h-[32px] ${selectedPageType === "individual_service" ? 'bg-[#a5cbfa] hover:bg-[#8bb8f9]' : 'bg-white'} text-black hover:bg-gray-100`}
                onClick={() => setSelectedPageType("individual_service")}
              >
                Individual Service
              </Button>
              <Button 
                variant={selectedPageType === "individual_location" ? "default" : "outline"}
                size="sm"
                className={`h-[32px] ${selectedPageType === "individual_location" ? 'bg-[#a5cbfa] hover:bg-[#8bb8f9]' : 'bg-white'} text-black hover:bg-gray-100`}
                onClick={() => setSelectedPageType("individual_location")}
              >
                Individual Location
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {/* SpreadsheetInput UI pasted from homepage */}
        <section className="bg-white rounded-lg shadow-md p-6 w-full max-w-none mb-6">
          <h2 className="text-xl font-semibold text-neutral-600 mb-4">Step 1 - Paste Your Excel Information</h2>
          <div style={{ fontSize: '10px', marginBottom: '4px', color: '#888' }}>kzuitable1</div>
          <div className="overflow-auto w-full max-w-none" style={{ maxHeight: "500px" }}>
            <table
              id="spreadsheet"
              className="w-full border-collapse table-fixed"
              ref={tableRef}
              onPaste={handleTablePaste}
            >
              <thead>
                <tr>
                  <th className="border border-neutral-200 bg-neutral-100 p-2 text-center w-12">#</th>
                  {Array(15).fill(0).map((_, colIndex) => (
                    <th key={colIndex} className="border border-neutral-200 bg-neutral-100 p-2 text-left" style={{ minWidth: colIndex < 3 ? "150px" : "300px", width: colIndex < 3 ? "150px" : "500px" }}>{String.fromCharCode(65 + colIndex)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sheetCells.map((rowArr, rowIndex) => (
                  <tr key={`row-${rowIndex}`} data-row-index={rowIndex}>
                    <td className="border border-neutral-200 bg-neutral-50 p-2 text-center font-medium w-12">{rowIndex + 1}</td>
                    {rowArr.map((cell, colIndex) => (
                      <td
                        key={`cell-${rowIndex}-${colIndex}`}
                        className="border border-neutral-200 p-2 focus:bg-primary-50 transition-colors cursor-pointer"
                        style={{ minWidth: colIndex < 3 ? "150px" : "300px", width: colIndex < 3 ? "150px" : "500px" }}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                      >
                        {editingCell && editingCell.row === rowIndex && editingCell.col === colIndex ? (
                          <input
                            type="text"
                            className="w-full h-full bg-white border-none outline-none"
                            value={cell}
                            autoFocus
                            onChange={e => handleCellChange(rowIndex, colIndex, e.target.value)}
                            onBlur={handleCellBlur}
                            onPaste={handleTablePaste}
                          />
                        ) : (
                          cell
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex flex-col space-y-4">
            {/* Save Table Content Button */}
            <button className="bg-navy hover:bg-navy/90 text-white font-bold py-3 px-4 rounded transition-colors flex items-center gap-2">
              <Star size={18} color="#FFA500" fill="#FFA500" className="inline-block" />
              Generate New Batch Of Images From These XLS Details
            </button>
            <div className="text-sm text-neutral-400">
              <p>Paste your Excel data directly into the table above. Make sure it includes the <span className="font-medium">actual_prompt_for_image_generating_ai_tool</span> and <span className="font-medium">file_name</span> columns.</p>
              <p className="mt-2">Click "Save Table Content" to ensure your data persists if you close your browser or shut down your computer.</p>
            </div>
          </div>
        </section>

        {/* Column Template System */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="font-bold text-black mb-4">kzuitable2 column template ui controls</div>
          <div className="flex items-center mb-4 gap-4">
            <select
              className="border rounded px-2 py-1"
              value={selectedTemplateId || ""}
              onChange={e => handleSelectTemplate(e.target.value)}
            >
              <option value="">Select a template...</option>
              {templates.map((tpl: any) => (
                <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
              ))}
            </select>
            <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={handleNewTemplate}>Create New Template</button>
            {selectedTemplateId && (
              <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={handleDeleteTemplate}>Delete Template</button>
            )}
          </div>
          {isEditing && (
            <div>
              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Template Name</label>
                <input
                  className="border rounded px-2 py-1 w-full"
                  value={templateName}
                  onChange={e => setTemplateName(e.target.value)}
                />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Columns</label>
                <div className="space-y-2">
                  {columns.map((col, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        className="border rounded px-2 py-1"
                        placeholder="Column Label"
                        value={col.label}
                        onChange={e => handleColumnChange(idx, "label", e.target.value)}
                      />
                      <select
                        className="border rounded px-2 py-1"
                        value={col.type}
                        onChange={e => handleColumnChange(idx, "type", e.target.value)}
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                      </select>
                      <button className="text-red-500" onClick={() => handleRemoveColumn(idx)}>Remove</button>
                    </div>
                  ))}
                </div>
                <button className="mt-2 bg-green-500 text-white px-3 py-1 rounded" onClick={handleAddColumn}>Add Column</button>
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleSaveTemplate}>Save Template</button>
            </div>
          )}
        </div>

        {/* kzuitable2 main controls UI element */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="font-bold text-black mb-4">kzuitable2 main controls</div>
          <div className="flex flex-wrap gap-4">
            {/* Pagination Controls */}
            <div className="flex items-center space-x-2">
              <span>Page:</span>
              <input type="number" min="1" className="border rounded px-2 py-1 w-16" />
              <span>of 10</span>
              <button className="bg-blue-500 text-white px-3 py-1 rounded">Next</button>
              <button className="bg-blue-500 text-white px-3 py-1 rounded">Previous</button>
            </div>
            {/* Search Control */}
            <div className="flex items-center space-x-2">
              <span>Search:</span>
              <input type="text" className="border rounded px-2 py-1" placeholder="Enter search term..." />
              <button className="bg-green-500 text-white px-3 py-1 rounded">Search</button>
            </div>
            {/* Filter Control */}
            <div className="flex items-center space-x-2">
              <span>Filter:</span>
              <select className="border rounded px-2 py-1">
                <option value="">Select filter...</option>
                <option value="option1">Option 1</option>
                <option value="option2">Option 2</option>
              </select>
              <button className="bg-yellow-500 text-white px-3 py-1 rounded">Apply Filter</button>
            </div>
            {/* Sort Control */}
            <div className="flex items-center space-x-2">
              <span>Sort:</span>
              <select className="border rounded px-2 py-1">
                <option value="">Select sort...</option>
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
              <button className="bg-purple-500 text-white px-3 py-1 rounded">Sort</button>
            </div>
            {/* Grouping Control */}
            <div className="flex items-center space-x-2">
              <span>Group:</span>
              <select className="border rounded px-2 py-1">
                <option value="">Select group...</option>
                <option value="group1">Group 1</option>
                <option value="group2">Group 2</option>
              </select>
              <button className="bg-red-500 text-white px-3 py-1 rounded">Group</button>
            </div>
            {/* Tagging Control */}
            <div className="flex items-center space-x-2">
              <span>Tag:</span>
              <input type="text" className="border rounded px-2 py-1" placeholder="Enter tag..." />
              <button className="bg-indigo-500 text-white px-3 py-1 rounded">Add Tag</button>
            </div>
          </div>
        </div>

        {/* kzuitable2 label before the large UI images table */}
        <div style={{ fontSize: '10px', marginBottom: '4px', color: '#888' }}>kzuitable2</div>
        {/* Image Table */}
        <div className="bg-white rounded-lg shadow-sm">
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border border-gray-700 w-10 bg-white align-middle sticky top-[40px] z-30">
                    <Checkbox />
                  </th>
                  <th className="p-2 border border-gray-700 bg-white align-middle sticky top-[40px] z-30">Actions</th>
                  <th className="p-2 border border-gray-700 w-10 bg-gray-200 align-middle sticky top-[40px] z-30">global_id</th>
                  <th className="p-2 border border-gray-700 bg-yellow-100 align-middle sticky top-[40px] z-30">rel_images2_batch_id</th>
                  <th className="p-2 border border-gray-700 bg-yellow-100 align-middle sticky top-[40px] z-30">batch date created</th>
                  <th className="p-2 border border-gray-700 bg-yellow-100 align-middle sticky top-[40px] z-30">batch name</th>
                  <th className="p-2 border border-gray-700 bg-gray-200 align-middle sticky top-[40px] z-30">batch total images (dynamic pull field qty)</th>
                  <th className="p-2 border border-gray-700 bg-gray-200 align-middle sticky top-[40px] z-30">image preview</th>
                  <th className="p-2 border border-gray-700 bg-gray-200 align-middle sticky top-[40px] z-30">img_url1</th>
                  <th className="p-2 border border-gray-700 bg-gray-200 align-middle sticky top-[40px] z-30">image extension</th>
                  <th className="p-2 border border-gray-700 bg-gray-200 align-middle sticky top-[40px] z-30">img_file_size</th>
                  <th className="p-2 border border-gray-700 bg-gray-200 align-middle sticky top-[40px] z-30">width5</th>
                  <th className="p-2 border border-gray-700 bg-gray-200 align-middle sticky top-[40px] z-30">height5</th>
                  <th className="p-2 border border-gray-700 bg-gray-200 align-middle sticky top-[40px] z-30">folder</th>
                  <th className="p-2 border border-gray-700 bg-pink-200 align-middle sticky top-[40px] z-30">img_zpf_code</th>
                  <th className="p-2 border border-gray-700 bg-pink-200 align-middle sticky top-[40px] z-30">width1</th>
                  <th className="p-2 border border-gray-700 bg-pink-200 align-middle sticky top-[40px] z-30">height1</th>
                  <th className="p-2 border border-gray-700 bg-pink-200 align-middle sticky top-[40px] z-30">associated_text_content_on_page1</th>
                  <th className="p-2 border border-gray-700 bg-pink-200 align-middle sticky top-[40px] z-30">file_name1</th>
                  <th className="p-2 border border-gray-700 bg-pink-200 align-middle sticky top-[40px] z-30">more_instructions1</th>
                  <th className="p-2 border border-gray-700 bg-pink-200 align-middle sticky top-[40px] z-30">prompt1</th>
                  <th className="p-2 border border-gray-700 bg-pink-200 align-middle sticky top-[40px] z-30">ai_tool1</th>
                  <th className="bg-black w-[5px] border border-gray-700 align-middle sticky top-[40px] z-30" />
                  <th className="p-2 border border-gray-700 bg-blue-100 align-middle sticky top-[40px] z-30">meta_data_wiped1</th>
                  <th className="p-2 border border-gray-700 bg-blue-100 align-middle sticky top-[40px] z-30">screenshotted1</th>
                  <th className="bg-black w-[5px] border border-gray-700 align-middle sticky top-[40px] z-30" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {imageData.map((image) => (
                  <tr key={image.id} className="hover:bg-gray-50">
                    <td className="p-2 border border-gray-700 align-middle">
                      <Checkbox />
                    </td>
                    <td className="p-2 border border-gray-700 align-middle">
                      <Button variant="outline" size="sm" className="mr-1">
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500"
                      >
                        Delete
                      </Button>
                    </td>
                    <td className="p-2 border border-gray-700 align-middle">
                      {image.id}
                    </td>
                    <td className="p-2 border border-gray-700 align-middle">
                      {image.img_url2}
                    </td>
                    <td className="p-2 border border-gray-700 align-middle">
                      {image.img_url3}
                    </td>
                    <td className="p-2 border border-gray-700 align-middle">
                      {image.img_url4}
                    </td>
                    <td className="p-2 border border-gray-700 align-middle">
                      {image.img_url5}
                    </td>
                    <td className="p-2 border border-gray-700 align-middle kz_td_img_thumbnail_1" style={{
                      padding: '0px'
                    }}>
                      <div className="w-24 h-full flex items-center justify-center">
                        <img
                          src={`https://picsum.photos/seed/${image.id}/100/100`}
                          alt="Thumbnail"
                          className="object-cover w-full h-full"
                          style={{
                            display: "block",
                            height: "100%"
                          }}
                        />
                      </div>
                    </td>
                    <td className="p-2 border border-gray-700 align-middle">
                      {image.filename}
                    </td>
                    <td className="p-2 border border-gray-700 align-middle">
                      {image.filesize}
                    </td>
                    <td className="p-2 border border-gray-700 align-middle max-w-xs truncate">
                      {image.path}
                    </td>
                    <td className="p-2 border border-gray-700 align-middle">
                      {image.img_url1}
                    </td>
                    <td className="p-2 border border-gray-700 align-middle">
                      {image.presented_1}
                    </td>
                    <td className="p-2 border border-gray-700 align-middle max-w-xs truncate">
                      {image.nice_name_actual}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageHandlerScreen1;
