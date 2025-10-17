import apiFetch from '@wordpress/api-fetch';
import {
  UISettings,
  transformToAPIPayload,
  transformFromAPIPayload,
  getDefaultUISettings,
  AnuraSettings
} from '../schemas/settings.schema';

const SETTINGS_ENDPOINT = '/?rest_route=/anura/v1/anura-settings';

export const getSettings = async (apiClient = apiFetch): Promise<UISettings> => {
  try {
    const response = await apiClient<AnuraSettings>({
      path: SETTINGS_ENDPOINT,
      method: 'GET',
    });

    return transformFromAPIPayload(response);
  } catch (error) {
    // If no settings exist, return defaults
    if (error instanceof Error && error.message.includes('404')) {
      return getDefaultUISettings();
    }
    throw error;
  }
};

export const saveSettings = async (
  uiSettings: UISettings, 
  apiClient = apiFetch
): Promise<void> => {
  const apiPayload = transformToAPIPayload(uiSettings);
  await apiClient({
    path: SETTINGS_ENDPOINT,
    method: 'POST',
    data: apiPayload,
  });
};
