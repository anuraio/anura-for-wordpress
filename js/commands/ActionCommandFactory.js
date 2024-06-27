class ActionCommandFactory {

  /**
   * Creates a real time action based off the given name.
   * @param {string} actionName Name of the real time action you want to create
   * @param {boolean} stopAfterFirstElement Whether or not to stop action execution 
   * after altering the first element
   * @returns {RealTimeAction}
   */
  create(actionName, stopAfterFirstElement) {
    switch(actionName) {
      case 'disableForms':
        return new DisableFormsCommand(stopAfterFirstElement);
      case 'disableCommentSubmits':
        return new DisableCommentSubmitsCommand(stopAfterFirstElement);
      case 'disableAllSubmits':
        return new DisableAllSubmitsCommand(stopAfterFirstElement);
      case 'disableLinks':
        return new DisableLinksCommand(stopAfterFirstElement);
      default:
        throw new Error(`${actionName} is not a real time action.`);
    }
  }
}