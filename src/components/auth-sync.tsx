'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useRef } from 'react';
import { useToast } from '~/components/ui/use-toast';
import { useAuth } from '~/contexts/auth-context';

/**
 * AuthSync component that runs in the background to synchronize
 * user data with the backend when a user is authenticated
 */
export function AuthSync() {
  const { data: session, status } = useSession();
  const [hasSynced, setHasSynced] = useState(false);
  const { toast } = useToast();
  const { refreshUserData } = useAuth();
  
  // Use ref to track if synchronization is in progress
  const isSyncingRef = useRef(false);

  useEffect(() => {
    // Only run once when the user becomes authenticated
    if (status === 'authenticated' && session && !hasSynced && !isSyncingRef.current) {
      const syncUser = async () => {
        if (isSyncingRef.current) return;
        
        isSyncingRef.current = true;
        
        try {
          // Check if the user exists in the backend and fetch role data
          await refreshUserData();
          
          // Mark that we've synced so we don't do it again
          setHasSynced(true);
          
          console.log('User permissions synchronized with backend');
        } catch (error) {
          console.error('Failed to sync user permissions:', error);
          
          // Show an error message, but don't show it to the user in production
          if (process.env.NODE_ENV !== 'production') {
            toast({
              variant: 'destructive',
              title: 'Permissions sync error',
              description: error instanceof Error 
                ? error.message 
                : 'Failed to synchronize your permissions with the system.',
            });
          }
        } finally {
          isSyncingRef.current = false;
        }
      };

      // Use setTimeout to ensure this runs after the current render cycle
      const timeoutId = setTimeout(() => {
        void syncUser();
      }, 0);
      
      return () => clearTimeout(timeoutId);
    }
    
    // Reset the sync flag when the session changes or the user logs out
    if (status !== 'authenticated') {
      setHasSynced(false);
    }
  }, [session, status, hasSynced, toast, refreshUserData]);

  // This component doesn't render anything visible
  return null;
} 
