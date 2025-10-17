import apiFetch from '@wordpress/api-fetch';
import { BlockedLoginsResponse, BlockedLoginsFilters } from '../types/blocked-logins';

const BLOCKED_LOGINS_ENDPOINT = '/?rest_route=/anura/v1/blocked-logins';

/**
 * Error response from the API when database operations fail
 */
interface BlockedLoginsErrorResponse {
  error: string;
  message: string;
}

/**
 * WordPress API error structure
 */
interface WordPressAPIError {
  data?: {
    error?: string;
    message?: string;
  };
  message?: string;
}

export const getBlockedLogins = async (
  page: number = 1,
  perPage: number = 50,
  filters: BlockedLoginsFilters = { username: '', result: '', ip: '', start_date: '', end_date: '' },
  apiClient = apiFetch
): Promise<BlockedLoginsResponse> => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
  });

  if (filters.username) {
    queryParams.append('username', filters.username);
  }

  if (filters.result) {
    queryParams.append('result', filters.result);
  }

  if (filters.ip) {
    queryParams.append('ip', filters.ip);
  }

  if (filters.start_date) {
    queryParams.append('start_date', filters.start_date);
  }

  if (filters.end_date) {
    queryParams.append('end_date', filters.end_date);
  }

  try {
    const response = await apiClient<BlockedLoginsResponse>({
      path: `${BLOCKED_LOGINS_ENDPOINT}&${queryParams.toString()}`,
      method: 'GET',
    });

    return response;
  } catch (error: unknown) {
    const wpError = error as WordPressAPIError;

    // Check if this is a database error response (500 error)
    if (wpError.data?.error && wpError.data?.message) {
      const errorData = wpError.data as BlockedLoginsErrorResponse;
      throw new Error(`${errorData.error}: ${errorData.message}`);
    }

    // Handle other API errors
    if (wpError.message) {
      throw new Error(wpError.message);
    }

    // Generic fallback error
    throw new Error('Failed to fetch blocked login logs. Please try again later.');
  }
};
