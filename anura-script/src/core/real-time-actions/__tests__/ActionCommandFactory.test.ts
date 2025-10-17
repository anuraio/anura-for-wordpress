import { describe, it, expect } from 'vitest';
import { ActionCommandFactory } from '../ActionCommandFactory';
import { DisableFormsCommand } from '../commands/DisableFormsCommand';
import { DisableCommentSubmitsCommand } from '../commands/DisableCommentSubmitsCommand';
import { DisableAllSubmitsCommand } from '../commands/DisableAllSubmitsCommand';
import { DisableLinksCommand } from '../commands/DisableLinksCommand';
import { DisableAllInputsCommand } from '../commands/DisableAllInputsCommand';

describe('ActionCommandFactory', () => {
  const factory = new ActionCommandFactory();
  const mockAnura = {};

  it('should create DisableFormsCommand for disableForms action', () => {
    const command = factory.create('disableForms', false, mockAnura);
    expect(command).toBeInstanceOf(DisableFormsCommand);
  });

  it('should create DisableCommentSubmitsCommand for disableCommentSubmits action', () => {
    const command = factory.create('disableCommentSubmits', false, mockAnura);
    expect(command).toBeInstanceOf(DisableCommentSubmitsCommand);
  });

  it('should create DisableAllSubmitsCommand for disableAllSubmits action', () => {
    const command = factory.create('disableAllSubmits', false, mockAnura);
    expect(command).toBeInstanceOf(DisableAllSubmitsCommand);
  });

  it('should create DisableLinksCommand for disableLinks action', () => {
    const command = factory.create('disableLinks', false, mockAnura);
    expect(command).toBeInstanceOf(DisableLinksCommand);
  });

  it('should create DisableAllInputsCommand for disableAllInputs action', () => {
    const command = factory.create('disableAllInputs', false, mockAnura);
    expect(command).toBeInstanceOf(DisableAllInputsCommand);
  });

  it('should pass stopAfterFirstElement parameter to commands', () => {
    const command = factory.create('disableForms', true, mockAnura);
    expect(command).toBeInstanceOf(DisableFormsCommand);
  });

  it('should throw error for unknown action', () => {
    expect(() => {
      factory.create('unknownAction', false, mockAnura);
    }).toThrow('unknownAction is not a real time action.');
  });

  it('should expose ActionCommandFactory to window object', () => {
    expect(window.ActionCommandFactory).toBe(ActionCommandFactory);
  });
});
