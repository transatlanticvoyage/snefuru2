import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useLocation, Link } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';

// Define login schema locally to avoid import issues
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember_me: z.boolean().optional(),
});

type Login = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<Login>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember_me: false,
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: Login) => {
      try {
        // Use absolute URL to ensure we're hitting the API endpoint
        const apiUrl = window.location.origin + '/api/auth/login';
        console.log('Sending login request to:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Non-JSON response received:', await response.text());
          throw new Error('Server returned non-JSON response. Please try again later.');
        }
        
        const responseData = await response.json();
        
        if (!response.ok) {
          throw new Error(responseData.message || 'Login failed');
        }
        
        return responseData;
      } catch (error) {
        console.error('Login request error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Save token to localStorage
      localStorage.setItem('auth_token', data.token);
      
      // Save user info
      localStorage.setItem('user', JSON.stringify(data.user));
      
      toast({
        title: 'Login Successful',
        description: 'Welcome back!',
      });
      
      // Redirect to home page
      navigate('/');
    },
    onError: (error) => {
      console.error('Login error:', error);
      toast({
        title: 'Login Failed',
        description: error instanceof Error ? error.message : 'Invalid email or password',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsLoading(false);
    }
  });

  function onSubmit(data: Login) {
    setIsLoading(true);
    loginMutation.mutate(data);
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-neutral-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
          <CardDescription className="text-center">
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="email@example.com" 
                        type="email" 
                        disabled={isLoading} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="••••••••" 
                        type="password" 
                        disabled={isLoading} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="remember_me"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox 
                        checked={field.value} 
                        onCheckedChange={field.onChange}
                        disabled={isLoading} 
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">Remember me</FormLabel>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-neutral-600">
            Don't have an account?{' '}
            <span 
              className="text-primary-600 hover:underline cursor-pointer" 
              onClick={() => navigate('/register')}
            >
              Register
            </span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}