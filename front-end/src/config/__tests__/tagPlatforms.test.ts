// src/config/__tests__/tagPlatforms.test.ts
import { TAG_PLATFORMS } from '../tagPlatforms';
import { describe, test, expect } from 'vitest';

describe('TAG_PLATFORMS', () => {
  const expectedPlatforms = ['google', 'meta', 'microsoft', 'linkedin', 'tiktok', 'twitter'];

  test('contains all expected platforms', () => {
    const actualPlatforms = Object.keys(TAG_PLATFORMS);
    expect(actualPlatforms).toEqual(expect.arrayContaining(expectedPlatforms));
    expect(actualPlatforms).toHaveLength(expectedPlatforms.length);
  });

  test('each platform has required properties', () => {
    Object.entries(TAG_PLATFORMS).forEach(([platformKey, platform]) => {
      expect(platform).toHaveProperty('label');
      expect(platform).toHaveProperty('fields');
      expect(typeof platform.label).toBe('string');
      expect(Array.isArray(platform.fields)).toBe(true);
      expect(platform.fields.length).toBeGreaterThan(0);
    });
  });

  test('each field has required properties', () => {
    Object.entries(TAG_PLATFORMS).forEach(([platformKey, platform]) => {
      platform.fields.forEach((field, index) => {
        // Check properties exist
        expect(field).toHaveProperty('id');
        expect(field).toHaveProperty('label');
        expect(field).toHaveProperty('placeholder');

        // Check types are correct
        expect(typeof field.id).toBe('string');
        expect(typeof field.label).toBe('string');
        expect(typeof field.placeholder).toBe('string');

        // Check values are not empty
        expect(field.id.length).toBeGreaterThan(0);
        expect(field.label.length).toBeGreaterThan(0);
        expect(field.placeholder.length).toBeGreaterThan(0);
      });
    });
  });

  test('all platforms use consistent field structure', () => {
    Object.values(TAG_PLATFORMS).forEach(platform => {
      platform.fields.forEach(field => {
        // All current platforms use 'tagId' as the field ID
        expect(field.id).toBe('tagId');
      });
    });
  });

  test('platform labels are user-friendly', () => {
    const expectedLabels = {
      google: 'Google Ads',
      meta: 'Meta Business',
      microsoft: 'Microsoft Ads',
      linkedin: 'LinkedIn Business',
      tiktok: 'TikTok Business',
      twitter: 'Twitter'
    };

    Object.entries(expectedLabels).forEach(([key, expectedLabel]) => {
      expect(TAG_PLATFORMS[key as keyof typeof TAG_PLATFORMS].label).toBe(expectedLabel);
    });
  });

  test('placeholders match platform-specific formats', () => {
    // Google Ads supports both G- and AW- prefixes
    expect(TAG_PLATFORMS.google.fields[0].placeholder).toContain('G-');
    expect(TAG_PLATFORMS.google.fields[0].placeholder).toContain('AW-');

    // Meta uses numeric Pixel ID format
    expect(TAG_PLATFORMS.meta.fields[0].placeholder).toMatch(/^\d+$/);

    // Microsoft uses numeric UET Tag format
    expect(TAG_PLATFORMS.microsoft.fields[0].placeholder).toMatch(/^\d+$/);

    // LinkedIn, TikTok, Twitter use numeric Partner/Tag ID formats
    expect(TAG_PLATFORMS.linkedin.fields[0].placeholder).toMatch(/^\d+$/);
    expect(TAG_PLATFORMS.tiktok.fields[0].placeholder).toMatch(/^\d+$/);
    expect(TAG_PLATFORMS.twitter.fields[0].placeholder).toMatch(/^\d+$/);
  });

  test('field labels are descriptive for each platform', () => {
    expect(TAG_PLATFORMS.google.fields[0].label).toBe('Tag ID');
    expect(TAG_PLATFORMS.meta.fields[0].label).toBe('Pixel ID');
    expect(TAG_PLATFORMS.microsoft.fields[0].label).toBe('UET Tag ID');
    expect(TAG_PLATFORMS.linkedin.fields[0].label).toBe('Partner ID');
    expect(TAG_PLATFORMS.tiktok.fields[0].label).toBe('Partner ID');
    expect(TAG_PLATFORMS.twitter.fields[0].label).toBe('Tag ID');
  });

  test('supports object iteration', () => {
    const platformKeys: string[] = [];
    const platformLabels: string[] = [];

    for (const [key, platform] of Object.entries(TAG_PLATFORMS)) {
      platformKeys.push(key);
      platformLabels.push(platform.label);
    }

    expect(platformKeys).toHaveLength(6);
    expect(platformLabels).toHaveLength(6);
    expect(platformKeys).toContain('google');
    expect(platformLabels).toContain('Google Ads');
  });

  test('supports key-based access', () => {
    // Test direct key access works
    expect(TAG_PLATFORMS.google).toBeDefined();
    expect(TAG_PLATFORMS.meta).toBeDefined();
    expect(TAG_PLATFORMS.microsoft).toBeDefined();

    // Test nested property access
    expect(TAG_PLATFORMS.google.label).toBe('Google Ads');
    expect(TAG_PLATFORMS.meta.fields[0].id).toBe('tagId');
  });

  test('is immutable due to const assertion', () => {
    // TypeScript const assertion should make this readonly
    // We can't directly test TypeScript types, but we can verify the structure
    expect(typeof TAG_PLATFORMS).toBe('object');
    expect(TAG_PLATFORMS).not.toBeNull();

    // Verify it's not accidentally modified (basic check)
    const originalLength = Object.keys(TAG_PLATFORMS).length;
    expect(originalLength).toBe(6);
  });

  test('all platforms have exactly one field', () => {
    // Current implementation shows all platforms have single tagId field
    Object.values(TAG_PLATFORMS).forEach(platform => {
      expect(platform.fields).toHaveLength(1);
    });
  });

  test('no empty or undefined values', () => {
    Object.entries(TAG_PLATFORMS).forEach(([platformKey, platform]) => {
      expect(platform.label).toBeTruthy();

      platform.fields.forEach(field => {
        expect(field.id).toBeTruthy();
        expect(field.label).toBeTruthy();
        expect(field.placeholder).toBeTruthy();
      });
    });
  });

  test('platform keys are lowercase and valid identifiers', () => {
    Object.keys(TAG_PLATFORMS).forEach(key => {
      expect(key).toMatch(/^[a-z]+$/); // lowercase letters only
      expect(key.length).toBeGreaterThan(0);
    });
  });

  test('can be used for form generation patterns', () => {
    // Test common usage patterns that components might use
    const platformOptions = Object.entries(TAG_PLATFORMS).map(([key, platform]) => ({
      value: key,
      label: platform.label
    }));

    expect(platformOptions).toHaveLength(6);
    expect(platformOptions[0]).toHaveProperty('value');
    expect(platformOptions[0]).toHaveProperty('label');

    // Test field extraction pattern
    const googleFields = TAG_PLATFORMS.google.fields.map(field => ({
      id: field.id,
      label: field.label,
      placeholder: field.placeholder
    }));

    expect(googleFields).toHaveLength(1);
    expect(googleFields[0].id).toBe('tagId');
  });

  test('platform-specific validation helpers', () => {
    // Test that we can create validation logic based on the config
    const getPlatformById = (id: string) => {
      const entry = Object.entries(TAG_PLATFORMS).find(([key]) => key === id);
      return entry ? entry[1] : null;
    };

    const googlePlatform = getPlatformById('google');
    const invalidPlatform = getPlatformById('nonexistent');

    expect(googlePlatform).not.toBeNull();
    expect(googlePlatform?.label).toBe('Google Ads');
    expect(invalidPlatform).toBeNull();
  });
});