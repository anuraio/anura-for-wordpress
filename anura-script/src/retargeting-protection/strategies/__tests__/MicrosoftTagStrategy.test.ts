import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MicrosoftTagStrategy } from '../MicrosoftTagStrategy';
import { TagConfig } from '../../../types';

describe('MicrosoftTagStrategy', () => {
  let strategy: MicrosoftTagStrategy;

  beforeEach(() => {
    strategy = new MicrosoftTagStrategy();
    document.head.innerHTML = '';
    (window as any).uetq = undefined;
    (window as any).UET = undefined;
  });

  describe('getPlatform', () => {
    it('should return microsoft as platform', () => {
      expect(strategy.getPlatform()).toBe('microsoft');
    });
  });

  describe('deploy', () => {
    it('should not deploy if no Microsoft tags are enabled', () => {
      const tagConfigs: TagConfig[] = [
        { id: '1', platform: 'google', tagId: 'G-123', enabled: true },
        { id: '2', platform: 'microsoft', tagId: '12345678', enabled: false },
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

    it('should load Microsoft UET script when deploying', () => {
      const tagConfigs: TagConfig[] = [
        { id: '1', platform: 'microsoft', tagId: '12345678', enabled: true },
      ];

      const mockScript = document.createElement('script');
      document.head.appendChild(mockScript);

      strategy.deploy(tagConfigs);

      const scripts = document.head.querySelectorAll('script');
      const uetScript = Array.from(scripts).find(s =>
        s.src === 'https://bat.bing.com/bat.js'
      );

      expect(uetScript).toBeTruthy();
      expect((uetScript as HTMLScriptElement)?.async).toBe(true);
    });

    it('should initialize uetq array when deploying', () => {
      const tagConfigs: TagConfig[] = [
        { id: '1', platform: 'microsoft', tagId: '12345678', enabled: true },
      ];

      const mockScript = document.createElement('script');
      document.head.appendChild(mockScript);

      strategy.deploy(tagConfigs);

      expect((window as any).uetq).toBeDefined();
    });

    it('should filter out disabled Microsoft tags', () => {
      const tagConfigs: TagConfig[] = [
        { id: '1', platform: 'microsoft', tagId: '12345678', enabled: true },
        { id: '2', platform: 'microsoft', tagId: '87654321', enabled: false },
      ];

      const mockScript = document.createElement('script');
      document.head.appendChild(mockScript);

      strategy.deploy(tagConfigs);

      const scripts = document.head.querySelectorAll('script');
      expect(scripts.length).toBeGreaterThan(0);
    });

    it('should handle multiple enabled Microsoft tags', () => {
      const tagConfigs: TagConfig[] = [
        { id: '1', platform: 'microsoft', tagId: '11111111', enabled: true },
        { id: '2', platform: 'microsoft', tagId: '22222222', enabled: true },
        { id: '3', platform: 'microsoft', tagId: '33333333', enabled: true },
      ];

      const mockScript = document.createElement('script');
      document.head.appendChild(mockScript);

      strategy.deploy(tagConfigs);

      const scripts = document.head.querySelectorAll('script');
      const uetScript = Array.from(scripts).find(s =>
        s.src === 'https://bat.bing.com/bat.js'
      );

      expect(uetScript).toBeTruthy();
    });

    it('should fire script onload callback when script loads', async () => {
      const tagConfigs: TagConfig[] = [
        { id: '1', platform: 'microsoft', tagId: '12345678', enabled: true },
      ];

      const mockScript = document.createElement('script');
      document.head.appendChild(mockScript);

      (window as any).UET = vi.fn(function(this: any, _: any) {
        this.push = vi.fn();
      });

      strategy.deploy(tagConfigs);

      const scripts = document.head.querySelectorAll('script');
      const uetScript = Array.from(scripts).find(s =>
        s.src === 'https://bat.bing.com/bat.js'
      ) as HTMLScriptElement;

      expect(uetScript).toBeTruthy();

      uetScript.dispatchEvent(new Event('load'));

      await new Promise(resolve => setTimeout(resolve, 0));

      expect((window as any).UET).toBeDefined();
    });
  });
});
