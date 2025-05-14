"use client";

import { useSession, signOut } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

type ApiTestResult = {
  status: number;
  statusText: string;
  data: unknown;
  error?: string;
};

export default function DebugToolsPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [cookieData, setCookieData] = useState<string | null>(null);
  const [apiUrl, setApiUrl] = useState<string>('/api/users/me');
  const [apiResult, setApiResult] = useState<ApiTestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [jwtData, setJwtData] = useState<Record<string, unknown> | null>(null);
  
  // Session management functions
  const refreshSession = async () => {
    setRefreshing(true);
    try {
      await update(); // Force NextAuth to update the session
      router.refresh(); // Refresh the page to get latest session data
    } finally {
      setRefreshing(false);
    }
  };
  
  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };
  
  const handleForceRelogin = async () => {
    // Clear authentication state by signing out
    await signOut({ redirect: false });
    
    // Delete cookies manually as well (client-side)
    document.cookie.split(";").forEach(cookie => {
      const parts = cookie.trim().split("=");
      const name = parts[0];
      if (name?.includes("next-auth")) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      }
    });
    
    // Force redirect to login
    window.location.href = "/login";
  };
  
  // Cookie and token inspection
  const checkRawCookies = () => {
    // Get and format raw cookie data
    const rawCookies = document.cookie.split(";").map(cookie => cookie.trim());
    const authCookies = rawCookies.filter(cookie => cookie.startsWith("next-auth"));
    
    // Set the raw cookie data for display
    setCookieData(
      authCookies.length > 0 
        ? authCookies.join("\n") 
        : "No NextAuth cookies found"
    );
  };
  
  const fetchJwtData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/debug/jwt-token');
      if (!response.ok) {
        throw new Error(`Failed to fetch JWT data: ${response.status}`);
      }
      const data = await response.json() as Record<string, unknown>;
      setJwtData(data);
    } catch (error) {
      setJwtData({ 
        error: error instanceof Error ? error.message : String(error) 
      });
    } finally {
      setLoading(false);
    }
  };
  
  // API testing function
  const testApi = async () => {
    try {
      setLoading(true);
      const response = await fetch(apiUrl, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      let data: unknown;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
      
      setApiResult({
        status: response.status,
        statusText: response.statusText,
        data,
      });
    } catch (error) {
      setApiResult({
        status: 0,
        statusText: 'Error',
        data: null,
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Authentication & API Debug Tools</h1>
      
      <div className="flex flex-wrap gap-4 mb-6">
        <Button 
          onClick={refreshSession} 
          disabled={refreshing}
          variant="secondary"
        >
          {refreshing ? "Refreshing..." : "Refresh Session"}
        </Button>
        <Button 
          onClick={handleSignOut}
          variant="outline"
        >
          Sign Out
        </Button>
        <Button 
          onClick={handleForceRelogin}
          variant="destructive"
        >
          Force Complete Relogin
        </Button>
        <Button 
          onClick={checkRawCookies}
          variant="outline"
        >
          Check Raw Cookies
        </Button>
        <Button 
          onClick={fetchJwtData}
          variant="outline"
          disabled={loading}
        >
          Fetch JWT Data
        </Button>
      </div>
      
      {/* Session Data */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Session Status: {status}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <h2 className="font-semibold">Has Session: {!!session ? "Yes" : "No"}</h2>
              <h2 className="font-semibold">Has Access Token: {!!session?.accessToken ? "Yes" : "No"}</h2>
              <h2 className="font-semibold">User Role: {session?.user?.role ?? "Not set"}</h2>
              {session?.accessToken && (
                <div>
                  <h3 className="text-sm font-medium mt-2">Access Token Preview:</h3>
                  <p className="text-xs break-all bg-muted p-2 rounded">
                    {session.accessToken.substring(0, 50)}...
                  </p>
                </div>
              )}
            </div>
            
            <div>
              <h3 className="font-semibold">Session Data:</h3>
              <pre className="text-xs overflow-auto bg-muted p-2 rounded h-64">
                {JSON.stringify(session, null, 2)}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Cookies Data */}
      {cookieData && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Auth Cookies</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs overflow-auto bg-muted p-2 rounded h-64">
              {cookieData}
            </pre>
          </CardContent>
        </Card>
      )}
      
      {/* JWT Data */}
      {jwtData && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>JWT Token Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs overflow-auto bg-muted p-2 rounded h-64">
              {JSON.stringify(jwtData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
      
      {/* API Testing */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>API Request Testing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="api-url">API Endpoint URL</Label>
              <div className="flex gap-2">
                <Input 
                  id="api-url"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="/api/users/me"
                  className="flex-1"
                />
                <Button 
                  onClick={testApi}
                  disabled={loading || !apiUrl}
                >
                  {loading ? "Testing..." : "Test API"}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Test any API endpoint to see if your authentication tokens are being properly sent
              </p>
            </div>
            
            {apiResult && (
              <div className="grid gap-2">
                <div className="flex items-center gap-4">
                  <h3 className="font-semibold">Status: {apiResult.status} {apiResult.statusText}</h3>
                  {apiResult.error && (
                    <p className="text-destructive">{apiResult.error}</p>
                  )}
                </div>
                <h3 className="font-semibold">Response:</h3>
                <pre className="text-xs overflow-auto bg-muted p-2 rounded h-64">
                  {JSON.stringify(apiResult.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
