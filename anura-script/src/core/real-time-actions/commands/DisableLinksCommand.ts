import { RealTimeAction } from '../RealTimeAction';

export class DisableLinksCommand extends RealTimeAction {
  private stopAfterFirstElement: boolean;

  constructor(stopAfterFirstElement: boolean) {
    super();
    this.stopAfterFirstElement = Boolean(stopAfterFirstElement);
  }

  execute(): void {
    const links: HTMLCollectionOf<HTMLAnchorElement> = document.getElementsByTagName("a");
    if (links.length === 0) {
      return;
    }

    this.disableElements(links);
  }

  private disableElements(elements: HTMLCollectionOf<HTMLAnchorElement>): void {
    const elementsToDisable: number = this.stopAfterFirstElement ? 1 : elements.length;

    for (let i = 0; i < elementsToDisable; i++) {
      (elements[i] as any).disabled = true;
      if (this.stopAfterFirstElement) {
        return;
      }
    }
  }
}