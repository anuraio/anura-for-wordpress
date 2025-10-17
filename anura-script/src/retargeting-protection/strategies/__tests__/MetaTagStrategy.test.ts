import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MetaTagStrategy } from '../MetaTagStrategy';
import { TagConfig } from '../../../types';

describe('MetaTagStrategy', () => {
  let strategy: MetaTagStrategy;

  beforeEach(() => {
    strategy = new MetaTagStrategy();
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    (window as any).fbq = undefined;
    (window as any)._fbq = undefined;
  });

  describe('getPlatform', () => {
    it('should return meta as platform', () => {
      expect(strategy.getPlatform()).toBe('meta');
    });
  });

  describe('deploy', () => {
    it('should not deploy if no Meta tags are enabled', () => {
      const tagConfigs: TagConfig[] = [
        { id: '1', platform: 'google', tagId: 'G-123', enabled: true },
        { id: '2', platform: 'meta', tagId: '123456789', enabled: false },
      ];

      strategy.deploy(tagConfigs);

      expect(document.head.children.length).toBe(0);
    });

    it('should not deploy if no tags match platform', () => {
      const tagConfigs: TagConfig[] = [
        { id: '1', platform: 'google', tagId: 'G-123', enabled: true },
      ];

      strategy.deploy(tagConfigs);

      expect(document.head.children.length).toBe(0);
    });

    it('should load Meta Pixel script when fbq is not already loaded', () => {
      const tagConfigs: TagConfig[] = [
        { id: '1', platform: 'meta', tagId: '123456789', enabled: true },
      ];

      // Add a script element for the strategy to use
      const mockScript = document.createElement('script');
      document.head.appendChild(mockScript);

      strategy.deploy(tagConfigs);

      const scripts = document.head.querySelectorAll('script');
      const fbScript = Array.from(scripts).find(s =>
        s.src === 'https://connect.facebook.net/en_US/fbevents.js'
      );

      expect(fbScript).toBeTruthy();
      expect((window as any).fbq).toBeDefined();
    });

    it('should fire events when fbq is already loaded', () => {
      const mockFbq = vi.fn();
      (window as any).fbq = mockFbq;
      const tagConfigs: TagConfig[] = [
        { id: '1', platform: 'meta', tagId: '123456789', enabled: true },
        { id: '2', platform: 'meta', tagId: '987654321', enabled: true },
      ];

      strategy.deploy(tagConfigs);

      expect(mockFbq).toHaveBeenCalledWith('init', '123456789');
      expect(mockFbq).toHaveBeenCalledWith('track', 'PageView');
      expect(mockFbq).toHaveBeenCalledWith('init', '987654321');
      expect(mockFbq).toHaveBeenCalledTimes(4); // 2 init + 2 track
    });

    it('should filter out disabled Meta tags', () => {
      const mockFbq = vi.fn();
      (window as any).fbq = mockFbq;
      const tagConfigs: TagConfig[] = [
        { id: '1', platform: 'meta', tagId: '123456789', enabled: true },
        { id: '2', platform: 'meta', tagId: '987654321', enabled: false },
      ];

      strategy.deploy(tagConfigs);

      expect(mockFbq).toHaveBeenCalledWith('init', '123456789');
      expect(mockFbq).not.toHaveBeenCalledWith('init', '987654321');
    });

    it('should handle multiple enabled Meta tags', () => {
      const mockFbq = vi.fn();
      (window as any).fbq = mockFbq;
      const tagConfigs: TagConfig[] = [
        { id: '1', platform: 'meta', tagId: '111111111', enabled: true },
        { id: '2', platform: 'meta', tagId: '222222222', enabled: true },
        { id: '3', platform: 'meta', tagId: '333333333', enabled: true },
      ];

      strategy.deploy(tagConfigs);

      expect(mockFbq).toHaveBeenCalledTimes(6); // 3 init + 3 track
      expect(mockFbq).toHaveBeenCalledWith('init', '111111111');
      expect(mockFbq).toHaveBeenCalledWith('init', '222222222');
      expect(mockFbq).toHaveBeenCalledWith('init', '333333333');
    });

    it('should create noscript fallback when fbq is not loaded', () => {
      const tagConfigs: TagConfig[] = [
        { id: '1', platform: 'meta', tagId: '123456789', enabled: true },
      ];

      const mockScript = document.createElement('script');
      document.head.appendChild(mockScript);

      strategy.deploy(tagConfigs);

      const noscript = document.querySelector('noscript#fb-ns');
      expect(noscript).toBeTruthy();

      const img = noscript?.querySelector('img');
      expect(img?.src).toBe('https://www.facebook.com/tr?id=123456789&ev=PageView&noscript=1');
    });
  });
});
