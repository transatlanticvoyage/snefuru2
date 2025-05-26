import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';

interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  profile_image?: string;
  created_at: string;
  last_login?: string;
}

export default function ProfilePage() {
  useDocumentTitle("Profile");
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  
  // Load user data from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    
    try {
      const userData = JSON.parse(storedUser);
      setUser(userData);
    } catch (error) {
      console.error('Failed to parse user data:', error);
      navigate('/login');
    }
  }, [navigate]);
  
  // Function to get user initials for avatar
  const getUserInitials = () => {
    if (!user) return '';
    
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`;
    }
    
    return user.username.substring(0, 2).toUpperCase();
  };
  
  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-neutral-50">
        <p>Loading profile...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-neutral-50">
      <Header pageTitle="Your Profile" />
      
      <div className="container mx-auto px-4 max-w-4xl py-8">
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            className="mr-2"
            onClick={() => navigate('/')}
          >
            &larr; Back to Home
          </Button>
          <h1 className="text-2xl font-bold">Your Profile</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="col-span-1">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={user.profile_image} alt={user.username} />
                  <AvatarFallback className="text-lg">{getUserInitials()}</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-semibold">{user.username}</h2>
                <p className="text-muted-foreground">{user.email}</p>
                <div className="mt-4 text-sm text-center text-muted-foreground">
                  <p>Member since {new Date(user.created_at).toLocaleDateString()}</p>
                  {user.last_login && (
                    <p>Last login: {new Date(user.last_login).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* User Information */}
          <Card className="col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>View your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Username</h3>
                <p className="p-2 bg-neutral-100 rounded-md">{user.username}</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Email</h3>
                <p className="p-2 bg-neutral-100 rounded-md">{user.email}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">First Name</h3>
                  <p className="p-2 bg-neutral-100 rounded-md">{user.first_name || '—'}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Last Name</h3>
                  <p className="p-2 bg-neutral-100 rounded-md">{user.last_name || '—'}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => navigate('/settings')}
                className="w-full"
              >
                Edit Profile
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}