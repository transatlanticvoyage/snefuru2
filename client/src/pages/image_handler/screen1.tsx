import React from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

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

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header pageTitle="Image Handler" />

      <div className="container mx-auto p-6">
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
