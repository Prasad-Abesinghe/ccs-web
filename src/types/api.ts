// Common API response format
export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

// Error response
export interface ApiErrorResponse {
  error: string;
  status?: number;
  message?: string;
}

// Success response with message only
export interface ApiSuccessResponse {
  status: 'success';
  message: string;
}

// Pagination metadata
export interface PaginationMeta {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number;
  to: number;
}

// Paginated response
export interface PaginatedResponse<T> {
  status: string;
  message: string;
  data: T[];
  meta: PaginationMeta;
} 
