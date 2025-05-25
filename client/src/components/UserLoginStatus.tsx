import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

// Type for a simplified user object
interface User {
  id: number;
  username: string;
  email: string;
  profile_image?: string;
  first_name?: string;
  last_name?: string;
}

export default function UserLoginStatus() {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('auth_token');
    
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('auth_token');
      }
    }
    
    setIsLoading(false);
  }, []);
  
  // Handle logout
  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    
    // Update state
    setUser(null);
    
    // Show toast notification
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out',
    });
  };
  
  // Show login/register buttons if not logged in
  if (!user) {
    return (
      <div className="flex items-center space-x-2">
        <Link href="/login">
          <Button variant="outline" size="sm">
            Log In
          </Button>
        </Link>
        <Link href="/register">
          <Button size="sm">
            Register
          </Button>
        </Link>
      </div>
    );
  }
  
  // Show user dropdown if logged in
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.profile_image} alt={user.username} />
            <AvatarFallback>
              {user.first_name && user.last_name
                ? `${user.first_name[0]}${user.last_name[0]}`
                : user.username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.username}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <span className="w-full">Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <span className="w-full">Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}