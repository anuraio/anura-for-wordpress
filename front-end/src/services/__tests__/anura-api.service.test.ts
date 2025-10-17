import { getSettings, saveSettings } from '../anura-api.service';
import { getDefaultUISettings } from '../../schemas/settings.schema';
import { describe, test, expect, vi, beforeEach } from 'vitest';

describe('anura-api.service', () => {
  let mockApiFetch: any;

  beforeEach(() => {
    mockApiFetch = vi.fn();
  });

  describe('getSettings', () => {
    test('fetches and transforms settings successfully', async () => {
      const mockApiResponse = {
        script: {
          instanceId: 123,
          sourceMethod: 'get',
          sourceValue: 'test-source',
          campaignMethod: 'post', 
          campaignValue: 'test-campaign',
          callbackFunction: 'testCallback',
          additionalData: [{ method: 'hardCoded', value: 'test-data' }]
        },
        realTimeActions: {
          redirectAction: {
            resultCondition: 'onBad',
            redirectURL: 'https://example.com',
            webCrawlersAllowed: false
          },
          actions: [
            { name: 'disableForms', resultCondition: 'onWarning' }
          ],
          retryDurationSeconds: 30,
          stopAfterFirstElement: true
        },
        bots: { enabled: true, whitelist: [] },
        social: { exclusionAudiences: [], retargetingProtection: [] },
        advanced: {
          fallbacks: { sources: ['src1', 'src2'], campaigns: ['camp1', 'camp2'] },
          serverActions: { addHeaders: true, headerPriority: 'high' },
          contentDeployment: { enabled: true, javascript: 'console.log("test");' },
          requestTriggers: { enabled: false, triggers: [] }
        }
      };

      mockApiFetch.mockResolvedValueOnce(mockApiResponse);

      const result = await getSettings(mockApiFetch);

      expect(mockApiFetch).toHaveBeenCalledWith({
        path: '/?rest_route=/anura/v1/anura-settings',
        method: 'GET'
      });

      expect(result.instanceId).toBe('123');
      expect(result.retryDurationSeconds).toBe('30');
    });

    test('returns defaults when 404 error occurs', async () => {
      const error = new Error('Not found');
      error.message = 'Error 404';
      mockApiFetch.mockRejectedValueOnce(error);

      const result = await getSettings(mockApiFetch);
      const defaults = getDefaultUISettings();

      expect(result).toStrictEqual(defaults);
    });

    test('throws non-404 errors', async () => {
      const error = new Error('Server error');
      mockApiFetch.mockRejectedValueOnce(error);

      await expect(getSettings(mockApiFetch)).rejects.toThrow('Server error');
    });
  });

  describe('saveSettings', () => {
    test('transforms and saves settings successfully', async () => {
      const uiSettings = getDefaultUISettings();
      uiSettings.instanceId = '456';

      mockApiFetch.mockResolvedValueOnce({});

      await saveSettings(uiSettings, mockApiFetch);

      expect(mockApiFetch).toHaveBeenCalledWith({
        path: '/?rest_route=/anura/v1/anura-settings',
        method: 'POST',
        data: expect.objectContaining({
          script: expect.objectContaining({
            instanceId: 456
          })
        })
      });
    });

    test('throws error when API call fails', async () => {
      const uiSettings = getDefaultUISettings();
      const error = new Error('API Error');
      mockApiFetch.mockRejectedValueOnce(error);

      await expect(saveSettings(uiSettings, mockApiFetch)).rejects.toThrow('API Error');
    });
  });
});