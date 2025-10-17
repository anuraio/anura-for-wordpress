import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GoogleTagStrategy } from '../GoogleTagStrategy';
import { TagConfig } from '../../../types';

describe('GoogleTagStrategy', () => {
  let strategy: GoogleTagStrategy;

  beforeEach(() => {
    strategy = new GoogleTagStrategy();
    document.head.innerHTML = '';
    (window as any).gtag = undefined;
    (window as any).dataLayer = [];
  });

  describe('getPlatform', () => {
    it('should return google as platform', () => {
      expect(strategy.getPlatform()).toBe('google');
    });
  });

  describe('deploy', () => {
    it('should not deploy if no Google tags are enabled', () => {
      const tagConfigs: TagConfig[] = [
        { id: '1', platform: 'meta', tagId: 'FB-123', enabled: true },
        { id: '2', platform: 'google', tagId: 'G-456', enabled: false },
      ];

      strategy.deploy(tagConfigs);

      expect(document.head.children.length).toBe(0);
    });

    it('should not deploy if no tags match platform', () => {
      const tagConfigs: TagConfig[] = [
        { id: '1', platform: 'meta', tagId: 'FB-123', enabled: true },
      ];

      strategy.deploy(tagConfigs);

      expect(document.head.children.length).toBe(0);
    });

    it('should load gtag script when gtag is not already loaded', () => {
      const tagConfigs: TagConfig[] = [
        { id: '1', platform: 'google', tagId: 'G-123', enabled: true },
      ];

      strategy.deploy(tagConfigs);

      const scripts = document.head.querySelectorAll('script');
      expect(scripts.length).toBe(1);
      expect(scripts[0].src).toBe('https://www.googletagmanager.com/gtag/js');
    });

    it('should fire events when gtag is already loaded', () => {
      const mockGtag = vi.fn();
      (window as any).gtag = mockGtag;
      const tagConfigs: TagConfig[] = [
        { id: '1', platform: 'google', tagId: 'G-123', enabled: true },
        { id: '2', platform: 'google', tagId: 'G-456', enabled: true },
      ];

      strategy.deploy(tagConfigs);

      expect(mockGtag).toHaveBeenCalledWith('event', 'page_view', { send_to: 'G-123' });
      expect(mockGtag).toHaveBeenCalledWith('event', 'page_view', { send_to: 'G-456' });
    });

    it('should initialize gtag and fire events on script load', async () => {
      const tagConfigs: TagConfig[] = [
        { id: '1', platform: 'google', tagId: 'G-TEST', enabled: true },
      ];

      strategy.deploy(tagConfigs);

      const script = document.head.querySelector('script') as HTMLScriptElement;
      expect(script).toBeTruthy();

      // Simulate script load
      script.dispatchEvent(new Event('load'));

      // Give time for async operations
      await new Promise(resolve => setTimeout(resolve, 0));

      expect((window as any).gtag).toBeDefined();
      expect((window as any).dataLayer).toBeDefined();
    });

    it('should filter out disabled Google tags', () => {
      const mockGtag = vi.fn();
      (window as any).gtag = mockGtag;
      const tagConfigs: TagConfig[] = [
        { id: '1', platform: 'google', tagId: 'G-ENABLED', enabled: true },
        { id: '2', platform: 'google', tagId: 'G-DISABLED', enabled: false },
      ];

      strategy.deploy(tagConfigs);

      expect(mockGtag).toHaveBeenCalledWith('event', 'page_view', { send_to: 'G-ENABLED' });
      expect(mockGtag).not.toHaveBeenCalledWith('event', 'page_view', { send_to: 'G-DISABLED' });
    });

    it('should handle multiple enabled Google tags', () => {
      const mockGtag = vi.fn();
      (window as any).gtag = mockGtag;
      const tagConfigs: TagConfig[] = [
        { id: '1', platform: 'google', tagId: 'G-TAG1', enabled: true },
        { id: '2', platform: 'google', tagId: 'G-TAG2', enabled: true },
        { id: '3', platform: 'google', tagId: 'G-TAG3', enabled: true },
      ];

      strategy.deploy(tagConfigs);

      expect(mockGtag).toHaveBeenCalledTimes(3);
      expect(mockGtag).toHaveBeenCalledWith('event', 'page_view', { send_to: 'G-TAG1' });
      expect(mockGtag).toHaveBeenCalledWith('event', 'page_view', { send_to: 'G-TAG2' });
      expect(mockGtag).toHaveBeenCalledWith('event', 'page_view', { send_to: 'G-TAG3' });
    });
  });
});
