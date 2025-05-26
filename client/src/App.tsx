import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import SimpleLogin from "@/pages/SimpleLogin";
import SimpleRegister from "@/pages/SimpleRegister";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import ApiKeys from "@/pages/ApiKeys";
import Screen1 from "@/pages/reddit_scraper/screen1";
import Screen2 from "@/pages/reddit_scraper/screen2";
import Screen3 from "@/pages/reddit_scraper/screen3";
import Screen4 from "@/pages/reddit_scraper/screen4";
import AffiliatePrograms from "@/pages/reddit_scraper/affiliate_programs1";
import ImageHandlerScreen1 from "@/pages/image_handler/screen1";
import ImageHandlerScreen2 from "@/pages/image_handler/screen2";
import PromptTube from "@/pages/image_handler/prompt_tube1";
import Domains1 from "@/pages/image_handler/domains1";
import HostingCascade from "@/pages/image_handler/hosting_cascade";
import CalendarPage from "@/pages/calendar/calendar1";
// import RankTrackerScreen1 from "@/pages/rank_tracker/screen1";
import ChatScreen1 from "@/pages/chat/chatscreen1";

// Protected route component that redirects to login if not authenticated
function ProtectedRoute({ component: Component, ...rest }: { component: React.ComponentType<any>, path: string }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    // Redirect to login page
    navigate('/login');
    return null;
  }
  
  return <Component {...rest} />;
}

function Router() {
  const { isAuthenticated } = useAuth();
  
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/login" component={SimpleLogin} />
      <Route path="/register" component={SimpleRegister} />
      <Route path="/simple-login" component={SimpleLogin} />
      <Route path="/simple-register" component={SimpleRegister} />
      
      {/* Main routes */}
      <Route path="/" component={Home} />
      
      {/* User account routes */}
      <Route path="/profile">
        {isAuthenticated ? <Profile /> : <SimpleLogin />}
      </Route>
      <Route path="/api_keys">
        {isAuthenticated ? <ApiKeys /> : <SimpleLogin />}
      </Route>
      <Route path="/settings">
        {isAuthenticated ? <Settings /> : <SimpleLogin />}
      </Route>
      
      {/* Protected routes */}
      <Route path="/reddit_scraper/screen1">
        {isAuthenticated ? <Screen1 /> : <SimpleLogin />}
      </Route>
      <Route path="/reddit_scraper/screen2">
        {isAuthenticated ? <Screen2 /> : <SimpleLogin />}
      </Route>
      <Route path="/reddit_scraper/screen3">
        {isAuthenticated ? <Screen3 /> : <SimpleLogin />}
      </Route>
      <Route path="/reddit_scraper/screen4">
        {isAuthenticated ? <Screen4 /> : <SimpleLogin />}
      </Route>
      <Route path="/reddit_scraper/affiliate_programs1">
        {isAuthenticated ? <AffiliatePrograms /> : <SimpleLogin />}
      </Route>
      <Route path="/image_handler/screen1">
        {isAuthenticated ? <ImageHandlerScreen1 /> : <SimpleLogin />}
      </Route>
      <Route path="/image_handler/screen2">
        {isAuthenticated ? <ImageHandlerScreen2 /> : <SimpleLogin />}
      </Route>
      <Route path="/image_handler/prompt_tube1">
        {isAuthenticated ? <PromptTube /> : <SimpleLogin />}
      </Route>
      <Route path="/image_handler/domains1">
        {isAuthenticated ? <Domains1 /> : <SimpleLogin />}
      </Route>
      <Route path="/image_handler/hosting_cascade">
        {isAuthenticated ? <HostingCascade /> : <SimpleLogin />}
      </Route>
      <Route path="/calendar/calendar1">
        {isAuthenticated ? <CalendarPage /> : <SimpleLogin />}
      </Route>
      {/* <Route path="/rank_tracker/screen1">
        {isAuthenticated ? <RankTrackerScreen1 /> : <SimpleLogin />}
      </Route> */}
      <Route path="/chat/chatscreen1" component={ChatScreen1} />
      
      {/* Fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
