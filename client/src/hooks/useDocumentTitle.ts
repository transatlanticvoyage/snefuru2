
import { useEffect } from 'react';

export function useDocumentTitle(title: string) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${title} - Snefuru`;
    
    // Cleanup function to restore previous title if needed
    return () => {
      document.title = previousTitle;
    };
  }, [title]);
}
