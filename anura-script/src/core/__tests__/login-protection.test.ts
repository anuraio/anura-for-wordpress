import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleLoginPageCallback, addVisitorIdToLoginForm } from '../login-protection';

describe('login-protection', () => {
  describe('addVisitorIdToLoginForm', () => {
    it('should add hidden field with visitor ID to login form', () => {
      const form = document.createElement('form');
      form.id = 'loginform';
      document.body.appendChild(form);
      const visitorId = 'test-visitor-123';

      addVisitorIdToLoginForm(visitorId);

      const hiddenField = form.querySelector('input[name="anura_visitor_id"]') as HTMLInputElement;
      expect(hiddenField).toBeTruthy();
      expect(hiddenField.type).toBe('hidden');
      expect(hiddenField.name).toBe('anura_visitor_id');
      expect(hiddenField.value).toBe(visitorId);
    });

    it('should remove existing field before adding new one', () => {
      const form = document.createElement('form');
      form.id = 'loginform';
      const existingField = document.createElement('input');
      existingField.name = 'anura_visitor_id';
      existingField.value = 'old-visitor-id';
      form.appendChild(existingField);
      document.body.appendChild(form);
      const newVisitorId = 'new-visitor-123';

      addVisitorIdToLoginForm(newVisitorId);

      const hiddenFields = form.querySelectorAll('input[name="anura_visitor_id"]');
      expect(hiddenFields.length).toBe(1);
      expect((hiddenFields[0] as HTMLInputElement).value).toBe(newVisitorId);
    });
  });

  describe('handleLoginPageCallback', () => {
    it('should call getAnura and add visitor ID to form', () => {
      const form = document.createElement('form');
      form.id = 'loginform';
      document.body.appendChild(form);
      const mockGetId = vi.fn(() => 'visitor-from-anura');
      (window as any).Anura = {
        getAnura: vi.fn(() => ({
          getId: mockGetId,
        })),
      };

      handleLoginPageCallback();

      expect((window as any).Anura.getAnura).toHaveBeenCalled();
      expect(mockGetId).toHaveBeenCalled();
      const hiddenField = form.querySelector('input[name="anura_visitor_id"]') as HTMLInputElement;
      expect(hiddenField).toBeTruthy();
      expect(hiddenField.value).toBe('visitor-from-anura');
    });
  });
});
