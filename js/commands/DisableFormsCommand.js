class DisableFormsCommand extends RealTimeAction {
  #stopAfterFirstElement;
  constructor(stopAfterFirstElement) {
    super();
    this.#stopAfterFirstElement = Boolean(stopAfterFirstElement);
  }

  execute() {
    const formElements = document.getElementsByTagName("form");
    if (formElements.length === 0) {
      return;
    }

    this.#disableElements(formElements);
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