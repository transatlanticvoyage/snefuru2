import React, { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

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
            <Select value={selectedDomain} onValueChange={setSelectedDomain}>
              <SelectTrigger className={`w-[200px] h-[32px] ${selectedDomain ? 'bg-[#a5cbfa]' : 'bg-white'}`}>
                <SelectValue placeholder="Select domain" />
              </SelectTrigger>
              <SelectContent>
                {domains.map((domain) => (
                  <SelectItem key={domain.id} value={domain.id.toString()}>
                    {domain.domain_base || 'Unknown Domain'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <button className="bg-navy hover:bg-navy/90 text-white font-bold py-3 px-4 rounded transition-colors">Save Table Content</button>
            <div className="text-sm text-neutral-400">
              <p>Paste your Excel data directly into the table above. Make sure it includes the <span className="font-medium">actual_prompt_for_image_generating_ai_tool</span> and <span className="font-medium">file_name</span> columns.</p>
              <p className="mt-2">Click "Save Table Content" to ensure your data persists if you close your browser or shut down your computer.</p>
            </div>
          </div>
        </section>

        {/* Welcome Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <p className="text-gray-600 mb-4">
            Welcome to the Image Handler page. This is where you can manage your
            images.
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Get Started
          </Button>
        </div>

        {/* Image Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border border-gray-700 w-10 bg-white align-middle">
                  <Checkbox />
                </th>
                <th className="p-2 border border-gray-700 bg-white align-middle">
                  Actions
                </th>
                <th className="p-2 border border-gray-700 w-10 bg-gray-200 align-middle">
                  global_id
                </th>
                <th className="p-2 border border-gray-700 bg-yellow-100 align-middle">
                  rel_images2_batch_id
                </th>
                <th className="p-2 border border-gray-700 bg-yellow-100 align-middle">
                  batch date created
                </th>
                <th className="p-2 border border-gray-700 bg-yellow-100 align-middle">
                  batch name
                </th>
                <th className="p-2 border border-gray-700 bg-gray-200 align-middle">
                  batch total images (dynamic pull field qty)
                </th>
                <th className="p-2 border border-gray-700 bg-gray-200 align-middle">
                  image preview
                </th>
                <th className="p-2 border border-gray-700 bg-gray-200 align-middle">
                  img_url1
                </th>
                <th className="p-2 border border-gray-700 bg-gray-200 align-middle">
                  image extension
                </th>
                <th className="p-2 border border-gray-700 bg-gray-200 align-middle">
                  img_file_size
                </th>
                <th className="p-2 border border-gray-700 bg-gray-200 align-middle">
                  width5
                </th>
                <th className="p-2 border border-gray-700 bg-gray-200 align-middle">
                  height5
                </th>
                <th className="p-2 border border-gray-700 bg-gray-200 align-middle">
                  folder
                </th>
                <th className="p-2 border border-gray-700 bg-pink-200 align-middle">
                  img_zpf_code
                </th>
                <th className="p-2 border border-gray-700 bg-pink-200 align-middle">
                  width1
                </th>
                <th className="p-2 border border-gray-700 bg-pink-200 align-middle">
                  height1
                </th>
                <th className="p-2 border border-gray-700 bg-pink-200 align-middle">
                  associated_text_content_on_page1
                </th>
                <th className="p-2 border border-gray-700 bg-pink-200 align-middle">
                  file_name1
                </th>
                <th className="p-2 border border-gray-700 bg-pink-200 align-middle">
                  more_instructions1
                </th>
                <th className="p-2 border border-gray-700 bg-pink-200 align-middle">
                  prompt1
                </th>
                <th className="p-2 border border-gray-700 bg-pink-200 align-middle">
                  ai_tool1
                </th>
                <th className="bg-black w-[5px] border border-gray-700 align-middle" />
                <th className="p-2 border border-gray-700 bg-blue-100 align-middle">
                  meta_data_wiped1
                </th>
                <th className="p-2 border border-gray-700 bg-blue-100 align-middle">
                  screenshotted1
                </th>
                <th className="bg-black w-[5px] border border-gray-700 align-middle" />
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
  );
};

export default ImageHandlerScreen1;
