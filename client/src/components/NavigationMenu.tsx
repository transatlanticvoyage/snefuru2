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
        <DropdownMenuItem onClick={() => handleNavigate("/")}>
          Home
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleNavigate("/image_handler/screen1")}>
          Screen1
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleNavigate("/reddit_scraper/screen1")}>
          Screen2
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}