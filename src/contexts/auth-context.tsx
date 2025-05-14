"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { useSession } from "next-auth/react";

// Types for user and permissions
export interface UserRole {
  id: string;
  name: string;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface RoleAction {
  actions: string[];
  node_id: string | null;
}

export interface RoleData {
  id: string;
  name: string;
  description: string;
  sms_enabled: boolean;
  email_enabled: boolean;
  ms_teams_enabled: boolean;
  has_root_access: boolean;
  role_actions: RoleAction[];
}

interface AuthContextProps {
  user: UserData | null;
  isLoadingUser: boolean;
  userPermissions: string[];
  hasPermission: (action: string) => boolean;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  isLoadingUser: true,
  userPermissions: [],
  hasPermission: () => false,
  refreshUserData: async () => Promise.resolve(),
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status, update } = useSession();
  const [user, setUser] = useState<UserData | null>(null);
  const [roleData, setRoleData] = useState<RoleData | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);

  // Use a ref to track if we've already updated the session with the user ID
  const hasUpdatedSessionRef = useRef<boolean>(false);

  // Derive permissions from role data
  const userPermissions =
    roleData?.role_actions.flatMap((ra) => ra.actions) ?? [];

  // Function to check if the user has a specific permission
  const hasPermission = (action: string): boolean => {
    if (!userPermissions.length) return false;

    // If user has root access, they have all permissions
    if (roleData?.has_root_access) return true;

    return userPermissions.includes(action);
  };

  // Fetch user data by email
  const fetchUserByEmail = async (email: string): Promise<UserData> => {
    const response = await fetch(`/api/users/email/${email}`);

    if (!response.ok) {
      throw new Error("Failed to fetch user data");
    }

    const responseData = (await response.json()) as {
      status: string;
      message: string;
      data: UserData;
    };
    return responseData.data;
  };

  // Fetch role data by ID
  const fetchRoleById = async (roleId: string): Promise<RoleData> => {
    const response = await fetch(`/api/roles/${roleId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch role data");
    }

    const responseData = (await response.json()) as {
      status: string;
      message: string;
      role: RoleData;
    };
    return responseData.role;
  };

  // Function to refresh user data and permissions
  const refreshUserData = async (): Promise<void> => {
    console.log("Refreshing user data");
    if (!session?.user?.email) return Promise.resolve();

    setIsLoadingUser(true);

    try {
      // Fetch user data by email
      const userData = await fetchUserByEmail(session.user.email);
      setUser(userData);

      // Only update session with user ID if we haven't done it already
      if (!hasUpdatedSessionRef.current && !session.user?.id) {
        hasUpdatedSessionRef.current = true;

        console.log("Updating session with user ID:", userData.id);
        await update({
          ...session,
          user: {
            ...session.user,
            id: userData.id,
          },
        });
      }

      // Fetch role data using the role ID from user data
      if (userData.role?.id) {
        const roleData = await fetchRoleById(userData.role.id);
        setRoleData(roleData);
      }
    } catch (error) {
      console.error("Error fetching user permissions:", error);
    } finally {
      setIsLoadingUser(false);
    }
  };

  // Reset the ref when session changes completely (like on logout/login)
  useEffect(() => {
    // Reset our tracking ref when session user email changes (new login)
    if (session?.user?.email) {
      // Only reset if the email has changed
      if (!user || user.email !== session.user.email) {
        hasUpdatedSessionRef.current = false;
      }
    } else {
      hasUpdatedSessionRef.current = false;
    }
  }, [session?.user?.email, user]);

  // Load user data when session changes
  useEffect(() => {
    if (status === "loading") return;

    if (session?.user?.email) {
      void refreshUserData();
    } else {
      setUser(null);
      setRoleData(null);
      setIsLoadingUser(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoadingUser,
        userPermissions,
        hasPermission,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
