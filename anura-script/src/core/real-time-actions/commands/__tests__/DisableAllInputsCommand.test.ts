import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DisableAllInputsCommand } from '../DisableAllInputsCommand';

describe('DisableAllInputsCommand', () => {
  let mockAnura: any;
  let command: DisableAllInputsCommand;

  beforeEach(() => {
    mockAnura = {
      getLib: vi.fn(() => ({
        actions: {
          disableInputs: vi.fn(),
        },
      })),
    };
  });

  describe('constructor', () => {
    it('should create instance with Anura object', () => {
      command = new DisableAllInputsCommand(mockAnura);
      expect(command).toBeInstanceOf(DisableAllInputsCommand);
    });
  });

  describe('execute', () => {
    it('should call disableInputs on Anura library', () => {
      const disableInputsSpy = vi.fn();
      mockAnura = {
        getLib: vi.fn(() => ({
          actions: {
            disableInputs: disableInputsSpy,
          },
        })),
      };

      command = new DisableAllInputsCommand(mockAnura);
      command.execute();

      expect(mockAnura.getLib).toHaveBeenCalled();
      expect(disableInputsSpy).toHaveBeenCalled();
    });

    it('should handle Anura object with getLib method', () => {
      const customAnura = {
        getLib: vi.fn(() => ({
          actions: {
            disableInputs: vi.fn(),
          },
        })),
      };

      command = new DisableAllInputsCommand(customAnura);
      command.execute();

      expect(customAnura.getLib).toHaveBeenCalledTimes(1);
    });
  });
});
