"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useEffect,
} from "react";

// Types for our user
type User = {
  email: string;
  name: string;
  role: "admin" | "user";
};

// Demo credentials type
export type DemoCredential = {
  email: string;
  password: string;
  name: string;
  role: "admin" | "user";
};

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

// TEMPORARY HACK: Hardcoded users for demo purposes
// TODO: Replace this with proper user management and role-based access control
export const DEMO_CREDENTIALS: Record<string, DemoCredential> = {
  "john@mail.com": {
    email: "john@mail.com",
    password: "abcd1234",
    name: "John Doe",
    role: "admin", // Admin can see all levels
  },
  "steven@mail.com": {
    email: "steven@mail.com",
    password: "abcd1234",
    name: "Steven Mav",
    role: "user", // Regular user can only see top level
  },
};

// Type guard to validate User object
function isValidUser(user: unknown): user is User {
  if (!user || typeof user !== "object") return false;
  const u = user as Record<string, unknown>;
  return (
    typeof u.email === "string" &&
    typeof u.name === "string" &&
    (u.role === "admin" || u.role === "user")
  );
}

// Initialize user from localStorage synchronously to prevent flashing
function initializeUser(): User | null {
  if (typeof window === "undefined") return null;

  // Clear any potentially corrupted data first
  try {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) return null;

    // Attempt to parse the data
    let parsedUser: unknown;
    try {
      parsedUser = JSON.parse(savedUser);
    } catch (parseError) {
      console.error("Failed to parse user data from localStorage:", parseError);
      localStorage.removeItem("user");
      return null;
    }

    // Validate the parsed data
    if (isValidUser(parsedUser)) {
      return parsedUser;
    }

    // If we get here, the data was parsed but is invalid
    console.error("Invalid user data structure in localStorage");
    localStorage.removeItem("user");
    return null;
  } catch (error) {
    // Catch any other unexpected errors
    console.error("Unexpected error while initializing user:", error);
    localStorage.removeItem("user");
    return null;
  }
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(initializeUser);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mark loading as complete after initial render
    setIsLoading(false);
  }, []);

  // Save user to localStorage whenever it changes
  const handleSetUser = (newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem("user", JSON.stringify(newUser));
    } else {
      localStorage.removeItem("user");
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser: handleSetUser, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
