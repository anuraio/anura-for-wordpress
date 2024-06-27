class DisableLinksCommand extends RealTimeAction {
  #stopAfterFirstElement;
  constructor(stopAfterFirstElement) {
    super();
    this.#stopAfterFirstElement = Boolean(stopAfterFirstElement);
  }

  execute() {
    const links = document.getElementsByTagName("a");
    if (links.length === 0) {
      return;
    }

    this.#disableElements(links);
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