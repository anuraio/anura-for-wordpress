import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TikTokTagStrategy } from '../TikTokTagStrategy';
import { TagConfig } from '../../../types';

describe('TikTokTagStrategy', () => {
  let strategy: TikTokTagStrategy;

  beforeEach(() => {
    strategy = new TikTokTagStrategy();
    document.head.innerHTML = '';
    (window as any).TiktokAnalyticsObject = undefined;
    (window as any).ttq = undefined;
  });

  describe('getPlatform', () => {
    it('should return tiktok as platform', () => {
      expect(strategy.getPlatform()).toBe('tiktok');
    });
  });

  describe('deploy', () => {
    it('should not deploy if no TikTok tags are enabled', () => {
      const tagConfigs: TagConfig[] = [
        { id: '1', platform: 'google', tagId: 'G-123', enabled: true },
        { id: '2', platform: 'tiktok', tagId: 'ABC123', enabled: false },
      ];

      strategy.deploy(tagConfigs);

      expect((window as any).TiktokAnalyticsObject).toBeUndefined();
    });

    it('should not deploy if no tags match platform', () => {
      const tagConfigs: TagConfig[] = [
        { id: '1', platform: 'google', tagId: 'G-123', enabled: true },
      ];

      strategy.deploy(tagConfigs);

      expect((window as any).TiktokAnalyticsObject).toBeUndefined();
    });

    it('should initialize TikTok Analytics when not already loaded', () => {
      const tagConfigs: TagConfig[] = [
        { id: '1', platform: 'tiktok', tagId: 'ABC123', enabled: true },
      ];

      const mockScript = document.createElement('script');
      document.head.appendChild(mockScript);

      strategy.deploy(tagConfigs);

      expect((window as any).TiktokAnalyticsObject).toBe('ttq');
      expect((window as any).ttq).toBeDefined();
      expect((window as any).ttq.methods).toBeDefined();
      expect((window as any).ttq.load).toBeDefined();
      expect((window as any).ttq.track).toBeDefined();
      expect((window as any).ttq.page).toBeDefined();
    });

    it('should load and track tags when ttq is already initialized', () => {
      const mockTtq = {
        load: vi.fn(),
        track: vi.fn(),
        page: vi.fn(),
      };
      (window as any).TiktokAnalyticsObject = 'ttq';
      (window as any).ttq = mockTtq;

      const tagConfigs: TagConfig[] = [
        { id: '1', platform: 'tiktok', tagId: 'ABC123', enabled: true },
        { id: '2', platform: 'tiktok', tagId: 'DEF456', enabled: true },
      ];

      strategy.deploy(tagConfigs);

      expect(mockTtq.load).toHaveBeenCalledWith('ABC123');
      expect(mockTtq.load).toHaveBeenCalledWith('DEF456');
      expect(mockTtq.track).toHaveBeenCalledWith('ViewContent');
      expect(mockTtq.page).toHaveBeenCalled();
    });

    it('should filter out disabled TikTok tags', () => {
      const mockScript = document.createElement('script');
      document.head.appendChild(mockScript);

      const tagConfigs: TagConfig[] = [
        { id: '1', platform: 'tiktok', tagId: 'ABC123', enabled: true },
        { id: '2', platform: 'tiktok', tagId: 'DEF456', enabled: false },
      ];

      strategy.deploy(tagConfigs);

      expect((window as any).ttq).toBeDefined();
      expect((window as any).ttq._i).toBeDefined();
      expect((window as any).ttq._i['ABC123']).toBeDefined();
      expect((window as any).ttq._i['DEF456']).toBeUndefined();
    });

    it('should handle multiple enabled TikTok tags', () => {
      const mockScript = document.createElement('script');
      document.head.appendChild(mockScript);

      const tagConfigs: TagConfig[] = [
        { id: '1', platform: 'tiktok', tagId: 'TAG1', enabled: true },
        { id: '2', platform: 'tiktok', tagId: 'TAG2', enabled: true },
        { id: '3', platform: 'tiktok', tagId: 'TAG3', enabled: true },
      ];

      strategy.deploy(tagConfigs);

      expect((window as any).ttq._i['TAG1']).toBeDefined();
      expect((window as any).ttq._i['TAG2']).toBeDefined();
      expect((window as any).ttq._i['TAG3']).toBeDefined();
    });

    it('should create TikTok analytics scripts when loading', () => {
      const tagConfigs: TagConfig[] = [
        { id: '1', platform: 'tiktok', tagId: 'ABC123', enabled: true },
      ];

      const mockScript = document.createElement('script');
      document.head.appendChild(mockScript);

      strategy.deploy(tagConfigs);

      const scripts = document.head.querySelectorAll('script');
      const tiktokScripts = Array.from(scripts).filter(s =>
        s.src.includes('analytics.tiktok.com/i18n/pixel/events.js')
      );

      expect(tiktokScripts.length).toBeGreaterThan(0);
    });

    it('should set up ttq methods array with required methods', () => {
      const tagConfigs: TagConfig[] = [
        { id: '1', platform: 'tiktok', tagId: 'ABC123', enabled: true },
      ];

      const mockScript = document.createElement('script');
      document.head.appendChild(mockScript);

      strategy.deploy(tagConfigs);

      const ttq = (window as any).ttq;
      expect(ttq.methods).toContain('page');
      expect(ttq.methods).toContain('track');
      expect(ttq.methods).toContain('identify');
      expect(ttq.methods).toContain('instances');
      expect(ttq.methods).toContain('debug');
    });
  });
});
