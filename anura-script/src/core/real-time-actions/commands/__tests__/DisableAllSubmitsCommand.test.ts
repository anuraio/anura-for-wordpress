import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DisableAllSubmitsCommand } from '../DisableAllSubmitsCommand';

describe('DisableAllSubmitsCommand', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('constructor', () => {
    it('should create instance with stopAfterFirstElement as false', () => {
      const command = new DisableAllSubmitsCommand(false);
      expect(command).toBeInstanceOf(DisableAllSubmitsCommand);
    });

    it('should create instance with stopAfterFirstElement as true', () => {
      const command = new DisableAllSubmitsCommand(true);
      expect(command).toBeInstanceOf(DisableAllSubmitsCommand);
    });

    it('should convert truthy value to boolean true', () => {
      const command = new DisableAllSubmitsCommand(1 as any);
      expect(command).toBeInstanceOf(DisableAllSubmitsCommand);
    });

    it('should convert falsy value to boolean false', () => {
      const command = new DisableAllSubmitsCommand(0 as any);
      expect(command).toBeInstanceOf(DisableAllSubmitsCommand);
    });
  });

  describe('execute', () => {
    it('should do nothing if no submit elements exist', () => {
      const command = new DisableAllSubmitsCommand(false);
      const disableElementsSpy = vi.spyOn(DisableAllSubmitsCommand.prototype as any, 'disableElements');
      document.body.innerHTML = '<div>No submit buttons</div>';

      command.execute();

      expect(disableElementsSpy).not.toHaveBeenCalled();
    });

    it('should disable all input submit buttons when stopAfterFirstElement is false', () => {
      const command = new DisableAllSubmitsCommand(false);
      document.body.innerHTML = `
        <form>
          <input type="submit" id="submit1" />
          <input type="submit" id="submit2" />
          <input type="submit" id="submit3" />
        </form>
      `;

      command.execute();

      const submit1 = document.getElementById('submit1') as HTMLInputElement;
      const submit2 = document.getElementById('submit2') as HTMLInputElement;
      const submit3 = document.getElementById('submit3') as HTMLInputElement;

      expect(submit1.disabled).toBe(true);
      expect(submit2.disabled).toBe(true);
      expect(submit3.disabled).toBe(true);
    });

    it('should disable all button submit buttons when stopAfterFirstElement is false', () => {
      const command = new DisableAllSubmitsCommand(false);
      document.body.innerHTML = `
        <form>
          <button type="submit" id="btn1">Submit 1</button>
          <button type="submit" id="btn2">Submit 2</button>
        </form>
      `;

      command.execute();

      const btn1 = document.getElementById('btn1') as HTMLButtonElement;
      const btn2 = document.getElementById('btn2') as HTMLButtonElement;

      expect(btn1.disabled).toBe(true);
      expect(btn2.disabled).toBe(true);
    });

    it('should disable only first submit element when stopAfterFirstElement is true', () => {
      const command = new DisableAllSubmitsCommand(true);
      document.body.innerHTML = `
        <form>
          <input type="submit" id="submit1" />
          <input type="submit" id="submit2" />
          <input type="submit" id="submit3" />
        </form>
      `;

      command.execute();

      const submit1 = document.getElementById('submit1') as HTMLInputElement;
      const submit2 = document.getElementById('submit2') as HTMLInputElement;
      const submit3 = document.getElementById('submit3') as HTMLInputElement;

      expect(submit1.disabled).toBe(true);
      expect(submit2.disabled).toBe(false);
      expect(submit3.disabled).toBe(false);
    });

    it('should prevent form submission via event listener', () => {
      const command = new DisableAllSubmitsCommand(false);
      document.body.innerHTML = `
        <form id="testForm">
          <input type="submit" id="submit1" />
        </form>
      `;

      command.execute();

      const form = document.getElementById('testForm') as HTMLFormElement;
      const submitEvent = new Event('submit', { cancelable: true });
      const preventDefaultSpy = vi.spyOn(submitEvent, 'preventDefault');

      form.dispatchEvent(submitEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should add data-submit-prevented attribute to form', () => {
      const command = new DisableAllSubmitsCommand(false);
      document.body.innerHTML = `
        <form id="testForm">
          <input type="submit" id="submit1" />
        </form>
      `;

      command.execute();

      const form = document.getElementById('testForm') as HTMLFormElement;
      expect(form.hasAttribute('data-submit-prevented')).toBe(true);
      expect(form.getAttribute('data-submit-prevented')).toBe('true');
    });

    it('should not add duplicate submit listeners if already prevented', () => {
      const command = new DisableAllSubmitsCommand(false);
      document.body.innerHTML = `
        <form id="testForm" data-submit-prevented="true">
          <input type="submit" id="submit1" />
        </form>
      `;

      const form = document.getElementById('testForm') as HTMLFormElement;
      const addEventListenerSpy = vi.spyOn(form, 'addEventListener');

      command.execute();

      expect(addEventListenerSpy).not.toHaveBeenCalled();
    });

    it('should handle multiple forms with submit buttons', () => {
      const command = new DisableAllSubmitsCommand(false);
      document.body.innerHTML = `
        <form id="form1">
          <input type="submit" id="submit1" />
        </form>
        <form id="form2">
          <button type="submit" id="submit2">Submit</button>
        </form>
      `;

      command.execute();

      const submit1 = document.getElementById('submit1') as HTMLInputElement;
      const submit2 = document.getElementById('submit2') as HTMLButtonElement;
      const form1 = document.getElementById('form1') as HTMLFormElement;
      const form2 = document.getElementById('form2') as HTMLFormElement;

      expect(submit1.disabled).toBe(true);
      expect(submit2.disabled).toBe(true);
      expect(form1.getAttribute('data-submit-prevented')).toBe('true');
      expect(form2.getAttribute('data-submit-prevented')).toBe('true');
    });

    it('should handle submit buttons outside of forms', () => {
      const command = new DisableAllSubmitsCommand(false);
      document.body.innerHTML = `
        <input type="submit" id="submit1" />
        <button type="submit" id="submit2">Submit</button>
      `;

      expect(() => command.execute()).not.toThrow();

      const submit1 = document.getElementById('submit1') as HTMLInputElement;
      const submit2 = document.getElementById('submit2') as HTMLButtonElement;

      expect(submit1.disabled).toBe(true);
      expect(submit2.disabled).toBe(true);
    });

    it('should prevent propagation of submit events', () => {
      const command = new DisableAllSubmitsCommand(false);
      document.body.innerHTML = `
        <form id="testForm">
          <input type="submit" id="submit1" />
        </form>
      `;

      command.execute();

      const form = document.getElementById('testForm') as HTMLFormElement;
      const submitEvent = new Event('submit', { cancelable: true, bubbles: true });
      const stopPropagationSpy = vi.spyOn(submitEvent, 'stopPropagation');

      form.dispatchEvent(submitEvent);

      expect(stopPropagationSpy).toHaveBeenCalled();
    });
  });
});
