import { useLocation } from 'wouter';
import MainNavigationMenu from '@/components/NavigationMenu';
import UserLoginStatus from '@/components/UserLoginStatus';
import { Logo } from '@/components/ui/logo';

interface HeaderProps {
  pageTitle?: string;
}

export default function Header({ pageTitle }: HeaderProps) {
  const [, navigate] = useLocation();
  
  return (
    <header className="w-full bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold text-neutral-600 flex items-center">
            <Logo />
            <span className="mr-2">Snefuru</span>
            {pageTitle && (
              <span className="text-base text-neutral-400 font-normal">{pageTitle}</span>
            )}
          </h1>
          
          <div className="flex items-center space-x-4">
            {/* Navigation Menu */}
            <MainNavigationMenu />
            
            {/* User Login Status */}
            <UserLoginStatus />
          </div>
        </div>
      </div>
    </header>
  );
}