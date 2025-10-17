import { describe, it, expect, beforeEach } from 'vitest';
import { DisableFormsCommand } from '../DisableFormsCommand';

describe('DisableFormsCommand', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('constructor', () => {
    it('should create instance with stopAfterFirstElement as false', () => {
      const command = new DisableFormsCommand(false);
      expect(command).toBeInstanceOf(DisableFormsCommand);
    });

    it('should create instance with stopAfterFirstElement as true', () => {
      const command = new DisableFormsCommand(true);
      expect(command).toBeInstanceOf(DisableFormsCommand);
    });

    it('should convert truthy value to boolean true', () => {
      const command = new DisableFormsCommand(1 as any);
      expect(command).toBeInstanceOf(DisableFormsCommand);
    });

    it('should convert falsy value to boolean false', () => {
      const command = new DisableFormsCommand(0 as any);
      expect(command).toBeInstanceOf(DisableFormsCommand);
    });
  });

  describe('execute', () => {
    it('should do nothing if no forms exist', () => {
      const command = new DisableFormsCommand(false);
      const disableElementsSpy = vi.spyOn(DisableFormsCommand.prototype as any, 'disableElements');
      document.body.innerHTML = '<div>No forms here</div>';

      command.execute();

      expect(disableElementsSpy).not.toHaveBeenCalled();

    });

    it('should disable all forms when stopAfterFirstElement is false', () => {
      const command = new DisableFormsCommand(false);
      document.body.innerHTML = `
        <form id="form1">
          <input type="text" name="field1" />
        </form>
        <form id="form2">
          <input type="text" name="field2" />
        </form>
      `;

      command.execute();

      const form1 = document.getElementById('form1') as HTMLFormElement;
      const form2 = document.getElementById('form2') as HTMLFormElement;

      expect(form1.getAttribute('data-submit-prevented')).toBe('true');
      expect(form2.getAttribute('data-submit-prevented')).toBe('true');
    });

    it('should disable only first form when stopAfterFirstElement is true', () => {
      const command = new DisableFormsCommand(true);
      document.body.innerHTML = `
        <form id="form1">
          <input type="text" name="field1" />
        </form>
        <form id="form2">
          <input type="text" name="field2" />
        </form>
      `;

      command.execute();

      const form1 = document.getElementById('form1') as HTMLFormElement;
      const form2 = document.getElementById('form2') as HTMLFormElement;

      expect(form1.getAttribute('data-submit-prevented')).toBe('true');
      expect(form2.getAttribute('data-submit-prevented')).toBeNull();
    });

    it('should prevent form submission', () => {
      const command = new DisableFormsCommand(false);
      document.body.innerHTML = `
        <form id="testForm">
          <input type="text" name="field" />
          <input type="submit" value="Submit" />
        </form>
      `;

      command.execute();

      const form = document.getElementById('testForm') as HTMLFormElement;
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });

      form.dispatchEvent(submitEvent);

      expect(submitEvent.defaultPrevented).toBe(true);
    });

    it('should disable all form controls', () => {
      const command = new DisableFormsCommand(false);
      document.body.innerHTML = `
        <form id="testForm">
          <input type="text" id="textInput" />
          <button id="button">Click</button>
          <textarea id="textarea"></textarea>
          <select id="select">
            <option>Option 1</option>
          </select>
        </form>
      `;

      command.execute();

      const input = document.getElementById('textInput') as HTMLInputElement;
      const button = document.getElementById('button') as HTMLButtonElement;
      const textarea = document.getElementById('textarea') as HTMLTextAreaElement;
      const select = document.getElementById('select') as HTMLSelectElement;

      expect(input.disabled).toBe(true);
      expect(button.disabled).toBe(true);
      expect(textarea.disabled).toBe(true);
      expect(select.disabled).toBe(true);
    });

    it('should not add duplicate event listeners', () => {
      const command = new DisableFormsCommand(false);
      document.body.innerHTML = `
        <form id="testForm">
          <input type="text" name="field" />
        </form>
      `;

      command.execute();
      command.execute();

      const form = document.getElementById('testForm') as HTMLFormElement;
      expect(form.getAttribute('data-submit-prevented')).toBe('true');
    });

    it('should handle multiple forms with different elements', () => {
      const command = new DisableFormsCommand(false);
      document.body.innerHTML = `
        <form id="form1">
          <input type="text" id="input1" />
        </form>
        <form id="form2">
          <textarea id="textarea1"></textarea>
        </form>
        <form id="form3">
          <select id="select1">
            <option>Option</option>
          </select>
        </form>
      `;

      command.execute();

      const form1 = document.getElementById('form1') as HTMLFormElement;
      const form2 = document.getElementById('form2') as HTMLFormElement;
      const form3 = document.getElementById('form3') as HTMLFormElement;
      const input1 = document.getElementById('input1') as HTMLInputElement;
      const textarea1 = document.getElementById('textarea1') as HTMLTextAreaElement;
      const select1 = document.getElementById('select1') as HTMLSelectElement;

      expect(form1.getAttribute('data-submit-prevented')).toBe('true');
      expect(form2.getAttribute('data-submit-prevented')).toBe('true');
      expect(form3.getAttribute('data-submit-prevented')).toBe('true');
      expect(input1.disabled).toBe(true);
      expect(textarea1.disabled).toBe(true);
      expect(select1.disabled).toBe(true);
    });

    it('should convert stopAfterFirstElement to boolean', () => {
      const command = new DisableFormsCommand(1 as any);
      document.body.innerHTML = `
        <form id="form1"></form>
        <form id="form2"></form>
      `;

      command.execute();

      const form1 = document.getElementById('form1') as HTMLFormElement;
      const form2 = document.getElementById('form2') as HTMLFormElement;

      expect(form1.getAttribute('data-submit-prevented')).toBe('true');
      expect(form2.getAttribute('data-submit-prevented')).toBeNull();
    });

    it('should disable nested form controls', () => {
      const command = new DisableFormsCommand(false);
      document.body.innerHTML = `
        <form id="testForm">
          <div class="field-group">
            <input type="text" id="nestedInput" />
            <div class="nested-field">
              <select id="nestedSelect">
                <option>Option 1</option>
              </select>
            </div>
          </div>
        </form>
      `;

      command.execute();

      const nestedInput = document.getElementById('nestedInput') as HTMLInputElement;
      const nestedSelect = document.getElementById('nestedSelect') as HTMLSelectElement;

      expect(nestedInput.disabled).toBe(true);
      expect(nestedSelect.disabled).toBe(true);
    });

    it('should handle forms with no controls', () => {
      const command = new DisableFormsCommand(false);
      document.body.innerHTML = `
        <form id="emptyForm"></form>
      `;

      expect(() => command.execute()).not.toThrow();

      const form = document.getElementById('emptyForm') as HTMLFormElement;
      expect(form.getAttribute('data-submit-prevented')).toBe('true');
    });
  });
});
