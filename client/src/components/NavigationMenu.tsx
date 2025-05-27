import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useLocation } from "wouter";

export default function MainNavigationMenu() {
  const [, navigate] = useLocation();
  
  const handleNavigate = (path: string) => {
    navigate(path);
  };

  // Priority focus pages
  const priorityPages = [
    { name: "Image Handler - Screen 1", path: "/image_handler/screen1" },
    { name: "Image Handler - Screen 2", path: "/image_handler/screen2" },
    { name: "Image Handler - IMH2", path: "/image_handler/imh2" },
    { name: "Image Handler - IMH3", path: "/image_handler/imh3" },
    { name: "Reddit Scraper - Screen 1", path: "/reddit_scraper/screen1" },
  ];

  // List of all pages and their paths
  const pages = [
    { name: "Home", path: "/" },
    { name: "Prompt Tube", path: "/image_handler/prompt_tube1" },
    { name: "Reddit Scraper - Screen 1", path: "/reddit_scraper/screen1" },
    { name: "Affiliate Programs", path: "/reddit_scraper/affiliate_programs1" },
    { name: "Calendar", path: "/calendar/calendar1" },
    { name: "Airtable", path: "/calendar/airtable1" },
    { name: "Email Manager", path: "/calendar/email1" },
    { name: "Notion Notes", path: "/calendar/notion1" },
    { name: "RankTracker", path: "/rank_tracker/screen1" },
    { name: "Chat", path: "/chat/chatscreen1" },
    { name: "Domains Main", path: "/image_handler/domains1" },
    { name: "Hosting Cascade", path: "/image_handler/hosting_cascade" },
    { name: "Image Handler - Screen 1", path: "/image_handler/screen1" },
    { name: "Image Handler - Screen 2", path: "/image_handler/screen2" },
    { name: "Image Handler - IMH2", path: "/image_handler/imh2" },
  ];

  return (
    <div className="flex items-center space-x-2">
      {/* Priority Focus Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="px-4 flex items-center gap-1">
            Priority Focus <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[220px]">
          {priorityPages.map((page) => (
            <DropdownMenuItem asChild key={page.path}>
              <a
                href={page.path}
                className="w-full cursor-pointer"
                onClick={(e) => {
                  if (e.button === 0 && !e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    handleNavigate(page.path);
                  }
                }}
              >
                {page.name}
              </a>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Pages Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="px-4 flex items-center gap-1">
            Pages <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[250px]">
          {pages.map((page) => (
            <DropdownMenuItem asChild key={page.path}>
              <a
                href={page.path}
                className="w-full cursor-pointer"
                onClick={(e) => {
                  if (e.button === 0 && !e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    handleNavigate(page.path);
                  }
                }}
              >
                {page.name}
              </a>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}