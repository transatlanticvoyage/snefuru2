import { useState, useEffect } from 'react';

export default function HeaderLogo() {
  const [logoSrc, setLogoSrc] = useState<string>('');

  useEffect(() => {
    // Import the logo dynamically
    const loadLogo = async () => {
      try {
        // Use relative path to the logo
        const logoModule = await import('../assets/logo.png');
        setLogoSrc(logoModule.default);
      } catch (error) {
        console.error('Failed to load logo:', error);
      }
    };

    loadLogo();
  }, []);

  return (
    <div className="flex items-center">
      {logoSrc ? (
        <img 
          src={logoSrc} 
          alt="Snefuru Logo" 
          className="h-8 w-auto mr-2" 
        />
      ) : (
        <div className="h-8 w-8 bg-gradient-to-br from-purple-600 to-orange-500 rounded-md mr-2"></div>
      )}
    </div>
  );
}