import { RealTimeAction } from "../RealTimeAction";

export class DisableAllSubmitsCommand extends RealTimeAction {
  private stopAfterFirstElement: boolean;
  private preventSubmit = (event: Event): void => {
    event.preventDefault();
    event.stopPropagation();
  };

  constructor(stopAfterFirstElement: boolean) {
    super();
    this.stopAfterFirstElement = Boolean(stopAfterFirstElement);
  }

  execute(): void {
    const submitElements: NodeListOf<HTMLInputElement | HTMLButtonElement> =
      document.querySelectorAll("input[type=submit], button[type=submit]");

    if (submitElements.length === 0) {
      return;
    }
    this.disableElements(submitElements);
  }

  private disableElements(
    elements: NodeListOf<HTMLInputElement | HTMLButtonElement>
  ): void {
    const elementsToDisable: number = this.stopAfterFirstElement
      ? 1
      : elements.length;

    for (let i = 0; i < elementsToDisable; i++) {
      const submitButton = elements[i];

      // Disable the submit button
      submitButton.disabled = true;

      // Also prevent form submission to catch Enter key presses
      const form = submitButton.closest("form");
      if (form && !form.hasAttribute("data-submit-prevented")) {
        form.addEventListener("submit", this.preventSubmit);
        form.setAttribute("data-submit-prevented", "true");
      }

      if (this.stopAfterFirstElement) {
        return;
      }
    }
  }
}
