class DisableAllSubmitsCommand extends RealTimeAction {
  #stopAfterFirstElement;
  constructor(stopAfterFirstElement) {
    super();
    this.#stopAfterFirstElement = Boolean(stopAfterFirstElement);
  }

  execute() {
    const submitElements = document.querySelectorAll("input[type=submit]");
    if (submitElements.length === 0) {
      return;
    }

    this.#disableElements(submitElements);
  }

  #disableElements(elements) {
    var elementsToDisable = (stopAfterFirstElement) ? 1 : elements.length;
  
    for (var i = 0; i < elementsToDisable; i++) {
      elements[i].disabled = true;
      if (this.#stopAfterFirstElement) {
        return;
      }
    }
  }
}