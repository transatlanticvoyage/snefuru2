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
import Screen1 from "@/pages/reddit_scraper/screen1";
import Screen2 from "@/pages/reddit_scraper/screen2";
import Screen3 from "@/pages/reddit_scraper/screen3";
import Screen4 from "@/pages/reddit_scraper/screen4";
import ImageHandlerScreen1 from "@/pages/image_handler/screen1";

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
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* Main routes */}
      <Route path="/" component={Home} />
      
      {/* Protected routes */}
      <Route path="/reddit_scraper/screen1">
        {isAuthenticated ? <Screen1 /> : <Login />}
      </Route>
      <Route path="/reddit_scraper/screen2">
        {isAuthenticated ? <Screen2 /> : <Login />}
      </Route>
      <Route path="/reddit_scraper/screen3">
        {isAuthenticated ? <Screen3 /> : <Login />}
      </Route>
      <Route path="/reddit_scraper/screen4">
        {isAuthenticated ? <Screen4 /> : <Login />}
      </Route>
      <Route path="/image_handler/screen1">
        {isAuthenticated ? <ImageHandlerScreen1 /> : <Login />}
      </Route>
      
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
