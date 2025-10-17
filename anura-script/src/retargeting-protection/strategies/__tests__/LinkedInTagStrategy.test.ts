import { describe, it, expect, beforeEach } from 'vitest';
import { LinkedInTagStrategy } from '../LinkedInTagStrategy';
import { TagConfig } from '../../../types';

describe('LinkedInTagStrategy', () => {
  let strategy: LinkedInTagStrategy;

  beforeEach(() => {
    strategy = new LinkedInTagStrategy();
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    (window as any)._linkedin_partner_id = undefined;
    (window as any)._linkedin_data_partner_ids = undefined;
    (window as any).lintrk = undefined;
  });

  describe('getPlatform', () => {
    it('should return linkedin as platform', () => {
      expect(strategy.getPlatform()).toBe('linkedin');
    });
  });

  describe('deploy', () => {
    it('should not deploy if no LinkedIn tags are enabled', () => {
      const tagConfigs: TagConfig[] = [
        { id: '1', platform: 'google', tagId: 'G-123', enabled: true },
        { id: '2', platform: 'linkedin', tagId: '12345', enabled: false },
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

    it('should load LinkedIn insight script when deploying', () => {
      const tagConfigs: TagConfig[] = [
        { id: '1', platform: 'linkedin', tagId: '12345', enabled: true },
      ];

      const mockScript = document.createElement('script');
      document.head.appendChild(mockScript);

      strategy.deploy(tagConfigs);

      const scripts = document.head.querySelectorAll('script');
      const linkedinScript = Array.from(scripts).find(s =>
        s.src === 'https://snap.licdn.com/li.lms-analytics/insight.min.js'
      );

      expect(linkedinScript).toBeTruthy();
      expect((linkedinScript as HTMLScriptElement)?.async).toBe(true);
    });

    it('should initialize LinkedIn tracking variables', () => {
      const tagConfigs: TagConfig[] = [
        { id: '1', platform: 'linkedin', tagId: '12345', enabled: true },
      ];

      const mockScript = document.createElement('script');
      document.head.appendChild(mockScript);

      strategy.deploy(tagConfigs);

      expect((window as any)._linkedin_partner_id).toBe('12345');
      expect((window as any)._linkedin_data_partner_ids).toContain('12345');
      expect((window as any).lintrk).toBeDefined();
      expect((window as any).lintrk.q).toBeDefined();
    });

    it('should create noscript fallback with tracking pixel', () => {
      const tagConfigs: TagConfig[] = [
        { id: '1', platform: 'linkedin', tagId: '12345', enabled: true },
      ];

      const mockScript = document.createElement('script');
      document.head.appendChild(mockScript);

      strategy.deploy(tagConfigs);

      const noscript = document.getElementById('linked-ns');
      expect(noscript).toBeTruthy();

      const img = noscript?.querySelector('img');
      expect(img?.src).toBe('https://px.ads.linkedin.com/collect/?pid=12345&fmt=gif');
      expect(img?.height).toBe(1);
      expect(img?.width).toBe(1);
      expect(img?.style.display).toBe('none');
    });

    it('should filter out disabled LinkedIn tags', () => {
      const tagConfigs: TagConfig[] = [
        { id: '1', platform: 'linkedin', tagId: '12345', enabled: true },
        { id: '2', platform: 'linkedin', tagId: '67890', enabled: false },
      ];

      const mockScript = document.createElement('script');
      document.head.appendChild(mockScript);

      strategy.deploy(tagConfigs);

      expect((window as any)._linkedin_data_partner_ids).toContain('12345');
      expect((window as any)._linkedin_data_partner_ids).not.toContain('67890');
    });

    it('should handle multiple enabled LinkedIn tags', () => {
      const tagConfigs: TagConfig[] = [
        { id: '1', platform: 'linkedin', tagId: '11111', enabled: true },
        { id: '2', platform: 'linkedin', tagId: '22222', enabled: true },
        { id: '3', platform: 'linkedin', tagId: '33333', enabled: true },
      ];

      const mockScript = document.createElement('script');
      document.head.appendChild(mockScript);

      strategy.deploy(tagConfigs);

      expect((window as any)._linkedin_data_partner_ids).toContain('11111');
      expect((window as any)._linkedin_data_partner_ids).toContain('22222');
      expect((window as any)._linkedin_data_partner_ids).toContain('33333');

      const noscript = document.getElementById('linked-ns');
      const imgs = noscript?.querySelectorAll('img');
      expect(imgs?.length).toBe(3);
    });

    it('should not reload script if already deployed', () => {
      const tagConfigs: TagConfig[] = [
        { id: '1', platform: 'linkedin', tagId: '12345', enabled: true },
      ];

      const mockScript = document.createElement('script');
      document.head.appendChild(mockScript);

      const mockNoscript = document.createElement('noscript');
      mockNoscript.id = 'linked-ns';
      document.head.appendChild(mockNoscript);

      (window as any)._linkedin_data_partner_ids = [];

      strategy.deploy(tagConfigs);

      const scripts = document.head.querySelectorAll('script');
      const linkedinScripts = Array.from(scripts).filter(s =>
        s.src === 'https://snap.licdn.com/li.lms-analytics/insight.min.js'
      );

      expect(linkedinScripts.length).toBe(0);
      expect((window as any)._linkedin_data_partner_ids).toContain('12345');
    });
  });
});
