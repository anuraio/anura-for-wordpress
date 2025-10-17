import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TwitterTagStrategy } from '../TwitterTagStrategy';
import { TagConfig } from '../../../types';

describe('TwitterTagStrategy', () => {
  let strategy: TwitterTagStrategy;

  beforeEach(() => {
    strategy = new TwitterTagStrategy();
    document.head.innerHTML = '';
    (window as any).twq = undefined;
  });

  describe('getPlatform', () => {
    it('should return twitter as platform', () => {
      expect(strategy.getPlatform()).toBe('twitter');
    });
  });

  describe('deploy', () => {
    it('should not deploy if no Twitter tags are enabled', () => {
      const tagConfigs: TagConfig[] = [
        { id: '1', platform: 'google', tagId: 'G-123', enabled: true },
        { id: '2', platform: 'twitter', tagId: 'o1234', enabled: false },
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

    it('should initialize Twitter pixel when not already loaded', () => {
      const tagConfigs: TagConfig[] = [
        { id: '1', platform: 'twitter', tagId: 'o1234', enabled: true },
      ];

      const mockScript = document.createElement('script');
      document.head.appendChild(mockScript);

      strategy.deploy(tagConfigs);

      expect((window as any).twq).toBeDefined();
      expect(typeof (window as any).twq).toBe('function');
      expect((window as any).twq.version).toBe('1.1');
      expect((window as any).twq.queue).toBeDefined();
    });

    it('should load Twitter script when deploying', () => {
      const tagConfigs: TagConfig[] = [
        { id: '1', platform: 'twitter', tagId: 'o1234', enabled: true },
      ];

      const mockScript = document.createElement('script');
      document.head.appendChild(mockScript);

      strategy.deploy(tagConfigs);

      const scripts = document.head.querySelectorAll('script');
      const twitterScript = Array.from(scripts).find(s =>
        s.src === 'https://static.ads-twitter.com/uwt.js'
      );

      expect(twitterScript).toBeTruthy();
      expect((twitterScript as HTMLScriptElement)?.async).toBe(true);
    });

    it('should fire events when twq is already loaded', () => {
      const mockTwq = vi.fn();
      (window as any).twq = mockTwq;

      const tagConfigs: TagConfig[] = [
        { id: '1', platform: 'twitter', tagId: 'o1234', enabled: true },
        { id: '2', platform: 'twitter', tagId: 'o5678', enabled: true },
      ];

      strategy.deploy(tagConfigs);

      expect(mockTwq).toHaveBeenCalledWith('event', 'o1234', {});
      expect(mockTwq).toHaveBeenCalledWith('event', 'o5678', {});
      expect(mockTwq).toHaveBeenCalledTimes(2);
    });

    it('should filter out disabled Twitter tags', () => {
      const mockTwq = vi.fn();
      (window as any).twq = mockTwq;

      const tagConfigs: TagConfig[] = [
        { id: '1', platform: 'twitter', tagId: 'o1234', enabled: true },
        { id: '2', platform: 'twitter', tagId: 'o5678', enabled: false },
      ];

      strategy.deploy(tagConfigs);

      expect(mockTwq).toHaveBeenCalledWith('event', 'o1234', {});
      expect(mockTwq).not.toHaveBeenCalledWith('event', 'o5678', {});
    });

    it('should handle multiple enabled Twitter tags', () => {
      const mockTwq = vi.fn();
      (window as any).twq = mockTwq;

      const tagConfigs: TagConfig[] = [
        { id: '1', platform: 'twitter', tagId: 'o1111', enabled: true },
        { id: '2', platform: 'twitter', tagId: 'o2222', enabled: true },
        { id: '3', platform: 'twitter', tagId: 'o3333', enabled: true },
      ];

      strategy.deploy(tagConfigs);

      expect(mockTwq).toHaveBeenCalledTimes(3);
      expect(mockTwq).toHaveBeenCalledWith('event', 'o1111', {});
      expect(mockTwq).toHaveBeenCalledWith('event', 'o2222', {});
      expect(mockTwq).toHaveBeenCalledWith('event', 'o3333', {});
    });

    it('should fire events on script load', async () => {
      const tagConfigs: TagConfig[] = [
        { id: '1', platform: 'twitter', tagId: 'o1234', enabled: true },
      ];

      const mockScript = document.createElement('script');
      document.head.appendChild(mockScript);

      strategy.deploy(tagConfigs);

      const scripts = document.head.querySelectorAll('script');
      const twitterScript = Array.from(scripts).find(s =>
        s.src === 'https://static.ads-twitter.com/uwt.js'
      ) as HTMLScriptElement;

      expect(twitterScript).toBeTruthy();

      const mockTwq = vi.fn();
      (window as any).twq = mockTwq;

      twitterScript.dispatchEvent(new Event('load'));

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockTwq).toHaveBeenCalledWith('event', 'o1234', {});
    });
  });
});
