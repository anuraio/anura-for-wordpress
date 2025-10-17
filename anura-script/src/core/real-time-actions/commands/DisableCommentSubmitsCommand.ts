import { RealTimeAction } from '../RealTimeAction';

export class DisableCommentSubmitsCommand extends RealTimeAction {
  private stopAfterFirstElement: boolean;

  constructor(stopAfterFirstElement: boolean) {
    super();
    this.stopAfterFirstElement = Boolean(stopAfterFirstElement);
  }

  execute(): void {
    const submitElements: NodeListOf<HTMLInputElement> = document.querySelectorAll("#commentform > .form-submit > input#submit");
    if (submitElements.length === 0) {
      return;
    }

    this.disableElements(submitElements);
  }

  private disableElements(elements: NodeListOf<HTMLInputElement>): void {
    const elementsToDisable: number = this.stopAfterFirstElement ? 1 : elements.length;

    for (let i = 0; i < elementsToDisable; i++) {
      elements[i].disabled = true;
      if (this.stopAfterFirstElement) {
        return;
      }
    }
  }
}