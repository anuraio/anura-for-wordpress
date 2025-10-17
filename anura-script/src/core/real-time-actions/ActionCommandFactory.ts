// client-side/src/core/real-time-actions/ActionCommandFactory.ts

import { DisableFormsCommand } from './commands/DisableFormsCommand';
import { DisableCommentSubmitsCommand } from './commands/DisableCommentSubmitsCommand';
import { DisableAllSubmitsCommand } from './commands/DisableAllSubmitsCommand';
import { DisableLinksCommand } from './commands/DisableLinksCommand';
import { DisableAllInputsCommand } from './commands/DisableAllInputsCommand';
import { RealTimeAction } from './RealTimeAction';

export class ActionCommandFactory {
  create(actionName: string, stopAfterFirstElement: boolean, Anura: any): RealTimeAction {
    switch (actionName) {
      case 'disableForms':
        return new DisableFormsCommand(stopAfterFirstElement);
      case 'disableCommentSubmits':
        return new DisableCommentSubmitsCommand(stopAfterFirstElement);
      case 'disableAllSubmits':
        return new DisableAllSubmitsCommand(stopAfterFirstElement);
      case 'disableLinks':
        return new DisableLinksCommand(stopAfterFirstElement);
      case 'disableAllInputs':
        return new DisableAllInputsCommand(Anura);
      default:
        throw new Error(`${actionName} is not a real time action.`);
    }
  }
}

// Expose to global scope
declare global {
  interface Window {
    ActionCommandFactory: typeof ActionCommandFactory;
  }
}

window.ActionCommandFactory = ActionCommandFactory;