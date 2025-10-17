export abstract class RealTimeAction {
  constructor() {
    if (this.constructor === RealTimeAction) {
      throw new Error("RealTimeAction class cannot be instantiated as it is an abstract class.");
    }
  }

  abstract execute(): void;
}