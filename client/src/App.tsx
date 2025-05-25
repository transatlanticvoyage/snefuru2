import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Screen1 from "@/pages/reddit_scraper/screen1";
import Screen2 from "@/pages/reddit_scraper/screen2";
import Screen3 from "@/pages/reddit_scraper/screen3";
import Screen4 from "@/pages/reddit_scraper/screen4";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/reddit_scraper/screen1" component={Screen1} />
      <Route path="/reddit_scraper/screen2" component={Screen2} />
      <Route path="/reddit_scraper/screen3" component={Screen3} />
      <Route path="/reddit_scraper/screen4" component={Screen4} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
