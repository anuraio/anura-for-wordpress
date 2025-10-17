import { describe, it, expect, beforeEach } from 'vitest';
import { DisableCommentSubmitsCommand } from '../DisableCommentSubmitsCommand';

describe('DisableCommentSubmitsCommand', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('constructor', () => {
    it('should create instance with stopAfterFirstElement as false', () => {
      const command = new DisableCommentSubmitsCommand(false);
      expect(command).toBeInstanceOf(DisableCommentSubmitsCommand);
    });

    it('should create instance with stopAfterFirstElement as true', () => {
      const command = new DisableCommentSubmitsCommand(true);
      expect(command).toBeInstanceOf(DisableCommentSubmitsCommand);
    });

    it('should convert truthy value to boolean true', () => {
      const command = new DisableCommentSubmitsCommand(1 as any);
      expect(command).toBeInstanceOf(DisableCommentSubmitsCommand);
    });

    it('should convert falsy value to boolean false', () => {
      const command = new DisableCommentSubmitsCommand(0 as any);
      expect(command).toBeInstanceOf(DisableCommentSubmitsCommand);
    });
  });

  describe('execute', () => {
    it('should do nothing if no comment submit elements exist', () => {
      const command = new DisableCommentSubmitsCommand(false);
      const disableElementsSpy = vi.spyOn(DisableCommentSubmitsCommand.prototype as any, 'disableElements');
      document.body.innerHTML = '<div>No comment form</div>';

      command.execute();

      expect(disableElementsSpy).not.toHaveBeenCalled()
    });

    it('should disable WordPress comment submit button', () => {
      const command = new DisableCommentSubmitsCommand(false);
      document.body.innerHTML = `
        <form id="commentform">
          <div class="form-submit">
            <input type="submit" id="submit" name="submit" value="Post Comment" />
          </div>
        </form>
      `;

      command.execute();

      const submitButton = document.getElementById('submit') as HTMLInputElement;
      expect(submitButton.disabled).toBe(true);
    });

    it('should target specific WordPress comment form structure', () => {
      const command = new DisableCommentSubmitsCommand(false);
      document.body.innerHTML = `
        <form id="commentform">
          <div class="form-submit">
            <input type="submit" id="submit" name="submit" value="Post Comment" />
          </div>
        </form>
        <form id="otherform">
          <div class="form-submit">
            <input type="submit" id="other-submit" name="submit" value="Other Submit" />
          </div>
        </form>
      `;

      command.execute();

      const commentSubmit = document.getElementById('submit') as HTMLInputElement;
      const otherSubmit = document.getElementById('other-submit') as HTMLInputElement;

      expect(commentSubmit.disabled).toBe(true);
      expect(otherSubmit.disabled).toBe(false);
    });

    it('should disable only first comment submit when stopAfterFirstElement is true', () => {
      const command = new DisableCommentSubmitsCommand(true);
      document.body.innerHTML = `
        <form id="commentform">
          <div class="form-submit">
            <input type="submit" id="submit" name="submit1" />
          </div>
          <div class="form-submit">
            <input type="submit" id="submit" name="submit2" />
          </div>
        </form>
      `;

      command.execute();

      const submits = document.querySelectorAll('#commentform > .form-submit > input#submit');

      expect((submits[0] as HTMLInputElement).disabled).toBe(true);
      expect((submits[1] as HTMLInputElement).disabled).toBe(false);
    });

    it('should disable all comment submits when stopAfterFirstElement is false', () => {
      const command = new DisableCommentSubmitsCommand(false);
      document.body.innerHTML = `
        <form id="commentform">
          <div class="form-submit">
            <input type="submit" id="submit" name="submit1" />
          </div>
          <div class="form-submit">
            <input type="submit" id="submit" name="submit2" />
          </div>
        </form>
      `;

      command.execute();

      const submits = document.querySelectorAll('#commentform > .form-submit > input#submit');

      expect((submits[0] as HTMLInputElement).disabled).toBe(true);
      expect((submits[1] as HTMLInputElement).disabled).toBe(true);
    });

    it('should not disable submit buttons that do not match the selector', () => {
      const command = new DisableCommentSubmitsCommand(false);
      document.body.innerHTML = `
        <form id="commentform">
          <div class="form-submit">
            <input type="submit" id="submit" />
          </div>
          <input type="submit" id="wrong-location" />
        </form>
      `;

      command.execute();

      const correctSubmit = document.getElementById('submit') as HTMLInputElement;
      const wrongSubmit = document.getElementById('wrong-location') as HTMLInputElement;

      expect(correctSubmit.disabled).toBe(true);
      expect(wrongSubmit.disabled).toBe(false);
    });

    it('should handle missing form-submit div gracefully', () => {
      const command = new DisableCommentSubmitsCommand(false);
      document.body.innerHTML = `
        <form id="commentform">
          <input type="submit" id="submit" />
        </form>
      `;

      expect(() => command.execute()).not.toThrow();
    });

    it('should handle multiple comment submit buttons with matching selector', () => {
      const command = new DisableCommentSubmitsCommand(false);
      document.body.innerHTML = `
        <form id="commentform">
          <div class="form-submit">
            <input type="submit" id="submit" value="Post Comment 1" />
          </div>
          <div class="form-submit">
            <input type="submit" id="submit" value="Post Comment 2" />
          </div>
          <div class="form-submit">
            <input type="submit" id="submit" value="Post Comment 3" />
          </div>
        </form>
      `;

      command.execute();

      const submits = document.querySelectorAll('#commentform > .form-submit > input#submit');

      expect((submits[0] as HTMLInputElement).disabled).toBe(true);
      expect((submits[1] as HTMLInputElement).disabled).toBe(true);
      expect((submits[2] as HTMLInputElement).disabled).toBe(true);
    });
  });
});
