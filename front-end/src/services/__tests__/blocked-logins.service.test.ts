import { describe, test, expect, vi, beforeEach, type Mock } from 'vitest';
import { getBlockedLogins } from '../blocked-logins.service';
import { BlockedLoginsResponse, BlockedLoginsFilters } from '../../types/blocked-logins';

describe('blocked-logins.service', () => {
  let mockApiFetch: Mock;

  beforeEach(() => {
    mockApiFetch = vi.fn();
  });

  describe('getBlockedLogins', () => {
    const mockSuccessResponse: BlockedLoginsResponse = {
      logs: [
        {
          id: 1,
          username: 'testuser',
          visitor_id: 'visitor123',
          result: 'blocked',
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0',
          blocked_at: '2025-10-14T10:00:00Z',
        },
        {
          id: 2,
          username: 'anotheruser',
          visitor_id: 'visitor456',
          result: 'suspicious',
          ip_address: '192.168.1.2',
          user_agent: 'Chrome/120.0',
          blocked_at: '2025-10-14T11:00:00Z',
        },
      ],
      total: 50,
      page: 1,
      per_page: 50,
      total_pages: 3,
    };

    test('fetches blocked logins with default parameters', async () => {
      mockApiFetch.mockResolvedValueOnce(mockSuccessResponse);

      const result: BlockedLoginsResponse = await getBlockedLogins(1, 20, undefined, mockApiFetch as any);

      expect(mockApiFetch).toHaveBeenCalledWith({
        path: '/?rest_route=/anura/v1/blocked-logins&page=1&per_page=20',
        method: 'GET',
      });
      expect(result).toEqual(mockSuccessResponse);
    });

    test('includes multiple filters in query parameters', async () => {
      mockApiFetch.mockResolvedValueOnce(mockSuccessResponse);

      const filters: BlockedLoginsFilters = {
        username: 'testuser',
        result: 'blocked',
        ip: '127.0.0.1',
        start_date: '2025-10-01',
        end_date: '2025-10-14',
      };

      await getBlockedLogins(2, 50, filters, mockApiFetch as any);

      const call = mockApiFetch.mock.calls[0][0];
      expect(call.path).toContain('page=2');
      expect(call.path).toContain('per_page=50');
      expect(call.path).toContain('username=testuser');
      expect(call.path).toContain('result=blocked');
      expect(call.path).toContain('ip=127.0.0.1');
      expect(call.path).toContain('start_date=2025-10-01');
      expect(call.path).toContain('end_date=2025-10-14');
      expect(call.method).toBe('GET');
    });

    test('omits empty filter values from query parameters', async () => {
      mockApiFetch.mockResolvedValueOnce(mockSuccessResponse);

      const filters: BlockedLoginsFilters = {
        username: 'testuser',
        result: '',
        ip: '',
        start_date: '',
        end_date: '',
      };

      await getBlockedLogins(1, 20, filters, mockApiFetch as any);

      const call = mockApiFetch.mock.calls[0][0];
      expect(call.path).toContain('username=testuser');
      expect(call.path).not.toContain('result=');
      expect(call.path).not.toContain('ip=');
      expect(call.path).not.toContain('start_date=');
      expect(call.path).not.toContain('end_date=');
    });

    test('handles database error response (500 error)', async () => {
      const databaseError = {
        data: {
          error: 'database_error',
          message: 'Table does not exist',
        },
      };

      mockApiFetch.mockRejectedValueOnce(databaseError);

      await expect(getBlockedLogins(1, 20, undefined, mockApiFetch as any)).rejects.toThrow(
        'database_error: Table does not exist'
      );
    });

    test('handles generic error without specific structure', async () => {
      const genericError = {};

      mockApiFetch.mockRejectedValueOnce(genericError);

      await expect(getBlockedLogins(1, 20, undefined, mockApiFetch as any)).rejects.toThrow(
        'Failed to fetch blocked login logs. Please try again later.'
      );
    });

    test('uses default parameter values when not provided', async () => {
      mockApiFetch.mockResolvedValueOnce(mockSuccessResponse);

      await getBlockedLogins(undefined, undefined, undefined, mockApiFetch as any);

      expect(mockApiFetch).toHaveBeenCalledWith({
        path: '/?rest_route=/anura/v1/blocked-logins&page=1&per_page=50',
        method: 'GET',
      });
    });

    test('handles pagination correctly', async () => {
      mockApiFetch.mockResolvedValueOnce({
        ...mockSuccessResponse,
        page: 3,
      });

      await getBlockedLogins(3, 10, undefined, mockApiFetch as any);

      expect(mockApiFetch).toHaveBeenCalledWith({
        path: '/?rest_route=/anura/v1/blocked-logins&page=3&per_page=10',
        method: 'GET',
      });
    });

    test('properly encodes special characters in filter values', async () => {
      mockApiFetch.mockResolvedValueOnce(mockSuccessResponse);

      const filters: BlockedLoginsFilters = {
        username: 'user@example.com',
        result: '',
        ip: '',
        start_date: '',
        end_date: '',
      };

      await getBlockedLogins(1, 20, filters, mockApiFetch as any);

      const call = mockApiFetch.mock.calls[0][0];
      // URLSearchParams automatically encodes @ as %40
      expect(call.path).toContain('username=user%40example.com');
    });
  });
});
