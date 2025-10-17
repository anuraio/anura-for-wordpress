import { RealTimeAction } from "../RealTimeAction";

export class DisableFormsCommand extends RealTimeAction {
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
    const formElements: HTMLCollectionOf<HTMLFormElement> =
      document.getElementsByTagName("form");
    if (formElements.length === 0) {
      return;
    }
    this.disableElements(formElements);
  }

  private disableElements(elements: HTMLCollectionOf<HTMLFormElement>): void {
    const elementsToDisable: number = this.stopAfterFirstElement
      ? 1
      : elements.length;
    for (let i = 0; i < elementsToDisable; i++) {
      const form = elements[i];

      if (!form.hasAttribute("data-submit-prevented")) {
        form.addEventListener("submit", this.preventSubmit);
        form.setAttribute("data-submit-prevented", "true");
      }

      const formControls = form.querySelectorAll(
        "input, button, textarea, select"
      );
      
      formControls.forEach((control) => {
        (control as HTMLInputElement).disabled = true;
      });

      if (this.stopAfterFirstElement) {
        return;
      }
    }
  }
}
