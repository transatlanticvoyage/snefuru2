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
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="px-4 flex items-center gap-1">
          Pages <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px]">
        <DropdownMenuItem asChild>
          <a 
            href="/" 
            className="w-full cursor-pointer"
            onClick={(e) => {
              // Only handle left-click without modifier keys
              if (e.button === 0 && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                handleNavigate("/");
              }
              // Other clicks (middle, right, or with Ctrl/Cmd) will use default browser behavior
            }}
          >
            Home
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a 
            href="/image_handler/screen1" 
            className="w-full cursor-pointer"
            onClick={(e) => {
              if (e.button === 0 && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                handleNavigate("/image_handler/screen1");
              }
            }}
          >
            Image Handler - Screen 1
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a 
            href="/reddit_scraper/screen1" 
            className="w-full cursor-pointer"
            onClick={(e) => {
              if (e.button === 0 && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                handleNavigate("/reddit_scraper/screen1");
              }
            }}
          >
            Reddit Scraper - Screen 1
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}