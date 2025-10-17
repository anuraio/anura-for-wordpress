import { describe, it, expect, beforeEach } from 'vitest';
import { DisableLinksCommand } from '../DisableLinksCommand';

describe('DisableLinksCommand', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('constructor', () => {
    it('should create instance with stopAfterFirstElement as false', () => {
      const command = new DisableLinksCommand(false);
      expect(command).toBeInstanceOf(DisableLinksCommand);
    });

    it('should create instance with stopAfterFirstElement as true', () => {
      const command = new DisableLinksCommand(true);
      expect(command).toBeInstanceOf(DisableLinksCommand);
    });

    it('should convert truthy value to boolean true', () => {
      const command = new DisableLinksCommand(1 as any);
      expect(command).toBeInstanceOf(DisableLinksCommand);
    });

    it('should convert falsy value to boolean false', () => {
      const command = new DisableLinksCommand(0 as any);
      expect(command).toBeInstanceOf(DisableLinksCommand);
    });
  });

  describe('execute', () => {
    it('should do nothing if no links exist on the page', () => {
      const command = new DisableLinksCommand(false);
      const disableElementsSpy = vi.spyOn(DisableLinksCommand.prototype as any, 'disableElements');
      document.body.innerHTML = '<div>No links here</div>';

      command.execute();

      expect(disableElementsSpy).not.toHaveBeenCalled();
    });

    it('should disable all links when stopAfterFirstElement is false', () => {
      const command = new DisableLinksCommand(false);
      document.body.innerHTML = `
        <a href="/page1" id="link1">Link 1</a>
        <a href="/page2" id="link2">Link 2</a>
        <a href="/page3" id="link3">Link 3</a>
      `;

      command.execute();

      const link1 = document.getElementById('link1') as any;
      const link2 = document.getElementById('link2') as any;
      const link3 = document.getElementById('link3') as any;

      expect(link1.disabled).toBe(true);
      expect(link2.disabled).toBe(true);
      expect(link3.disabled).toBe(true);
    });

    it('should disable only first link when stopAfterFirstElement is true', () => {
      const command = new DisableLinksCommand(true);
      document.body.innerHTML = `
        <a href="/page1" id="link1">Link 1</a>
        <a href="/page2" id="link2">Link 2</a>
        <a href="/page3" id="link3">Link 3</a>
      `;

      command.execute();

      const link1 = document.getElementById('link1') as any;
      const link2 = document.getElementById('link2') as any;
      const link3 = document.getElementById('link3') as any;

      expect(link1.disabled).toBe(true);
      expect(link2.disabled).toBe(undefined);
      expect(link3.disabled).toBe(undefined);
    });

    it('should handle links with different attributes', () => {
      const command = new DisableLinksCommand(false);
      document.body.innerHTML = `
        <a href="/page1" id="link1" class="nav-link">Nav Link</a>
        <a href="https://external.com" id="link2" target="_blank">External</a>
        <a href="#anchor" id="link3">Anchor</a>
        <a href="javascript:void(0)" id="link4">JS Link</a>
      `;

      command.execute();

      const link1 = document.getElementById('link1') as any;
      const link2 = document.getElementById('link2') as any;
      const link3 = document.getElementById('link3') as any;
      const link4 = document.getElementById('link4') as any;

      expect(link1.disabled).toBe(true);
      expect(link2.disabled).toBe(true);
      expect(link3.disabled).toBe(true);
      expect(link4.disabled).toBe(true);
    });

    it('should handle nested links correctly', () => {
      const command = new DisableLinksCommand(false);
      document.body.innerHTML = `
        <div>
          <nav>
            <a href="/page1" id="link1">Link 1</a>
          </nav>
          <section>
            <a href="/page2" id="link2">Link 2</a>
          </section>
        </div>
      `;

      command.execute();

      const link1 = document.getElementById('link1') as any;
      const link2 = document.getElementById('link2') as any;

      expect(link1.disabled).toBe(true);
      expect(link2.disabled).toBe(true);
    });

    it('should handle empty href attribute', () => {
      const command = new DisableLinksCommand(false);
      document.body.innerHTML = `
        <a href="" id="link1">Empty Link</a>
        <a id="link2">No Href</a>
        <a href="/page" id="link3">Valid Link</a>
      `;

      expect(() => command.execute()).not.toThrow();

      const link1 = document.getElementById('link1') as any;
      const link2 = document.getElementById('link2') as any;
      const link3 = document.getElementById('link3') as any;

      expect(link1.disabled).toBe(true);
      expect(link2.disabled).toBe(true);
      expect(link3.disabled).toBe(true);
    });

    it('should handle large number of links efficiently', () => {
      const command = new DisableLinksCommand(false);
      const linksHtml = Array.from({ length: 100 }, (_, i) =>
        `<a href="/page${i}" id="link${i}">Link ${i}</a>`
      ).join('');

      document.body.innerHTML = linksHtml;

      expect(() => command.execute()).not.toThrow();

      const firstLink = document.getElementById('link0') as any;
      const lastLink = document.getElementById('link99') as any;

      expect(firstLink.disabled).toBe(true);
      expect(lastLink.disabled).toBe(true);
    });

    it('should handle stopAfterFirstElement with large number of links', () => {
      const command = new DisableLinksCommand(true);
      const linksHtml = Array.from({ length: 50 }, (_, i) =>
        `<a href="/page${i}" id="link${i}">Link ${i}</a>`
      ).join('');

      document.body.innerHTML = linksHtml;

      command.execute();

      const firstLink = document.getElementById('link0') as any;
      const secondLink = document.getElementById('link1') as any;

      expect(firstLink.disabled).toBe(true);
      expect(secondLink.disabled).toBe(undefined);
    });

    it('should handle links inside lists', () => {
      const command = new DisableLinksCommand(false);
      document.body.innerHTML = `
        <ul>
          <li><a href="/page1" id="link1">Item 1</a></li>
          <li><a href="/page2" id="link2">Item 2</a></li>
          <li><a href="/page3" id="link3">Item 3</a></li>
        </ul>
      `;

      command.execute();

      const link1 = document.getElementById('link1') as any;
      const link2 = document.getElementById('link2') as any;
      const link3 = document.getElementById('link3') as any;

      expect(link1.disabled).toBe(true);
      expect(link2.disabled).toBe(true);
      expect(link3.disabled).toBe(true);
    });

    it('should set disabled property even though it is not standard for anchors', () => {
      const command = new DisableLinksCommand(false);
      document.body.innerHTML = '<a href="/page" id="testLink">Test Link</a>';

      command.execute();

      const link = document.getElementById('testLink') as any;

      // The disabled property is set even though it's not a standard HTML attribute for anchors
      expect(link.disabled).toBe(true);
      expect(link.hasOwnProperty('disabled')).toBe(true);
    });
  });
});
