/**
 * Utility functions for handling user data and tokens
 */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/**
 * Utility functions for handling user data and tokens
 */

// Define TypeScript interfaces for token data
interface AzureADTokenData {
  oid?: string;
  sub?: string;
  name?: string;
  email?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  roles?: string[];
  wids?: string[];
  tid?: string;
  idp?: string;
  [key: string]: unknown;
}

interface UserInfo {
  azureOid: string;
  name: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  roles: string[];
  tenantId: string | null;
  identityProvider: string | null;
}

/**
 * Parses a JWT token and returns the payload as an object
 * @param token The JWT token to parse
 * @returns The decoded token payload
 */
export function parseJwt(token: string): AzureADTokenData {
  try {
    // Split the token
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT token format');
    }
    
    const base64Url = parts[1];
    // Replace characters that are URL-friendly with normal base64 characters
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    // Decode the base64 string and parse as JSON
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload) as AzureADTokenData;
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    return {};
  }
}

/**
 * Extract user information from an ID token
 * @param idToken The ID token from Azure AD
 * @returns Formatted user information
 */
export function extractUserInfoFromToken(idToken: string): UserInfo {
  const tokenData = parseJwt(idToken);
  
  return {
    // Primary identifier
    azureOid: tokenData.oid ?? tokenData.sub ?? '',
    
    // User profile
    name: tokenData.name ?? null,
    email: tokenData.email ?? tokenData.preferred_username ?? null,
    firstName: tokenData.given_name ?? null,
    lastName: tokenData.family_name ?? null,
    
    // Role-related info
    roles: Array.isArray(tokenData.roles) ? tokenData.roles : [],
    
    // Additional metadata
    tenantId: tokenData.tid ?? null,
    identityProvider: tokenData.idp ?? null,
  };
}

/**
 * Determine the user's role based on the token data
 * This is a simple implementation - customize based on your app's needs
 */
export function determineUserRole(tokenData: AzureADTokenData): string {
  // Check for explicit role assignments in token
  if (tokenData.roles && Array.isArray(tokenData.roles)) {
    if (tokenData.roles.includes('admin')) return 'admin';
    if (tokenData.roles.includes('user')) return 'user';
  }
  
  // Check for Windows Identity Directory Services (wids) claims
  // These are Azure AD role template IDs
  if (tokenData.wids && Array.isArray(tokenData.wids)) {
    // These are example role IDs - replace with your actual role IDs
    const adminRoleId = "62e90394-69f5-4237-9190-012177145e10";
    if (tokenData.wids.includes(adminRoleId)) return 'admin';
  }
  
  // Default role if no specific roles found
  return 'user';
} 
