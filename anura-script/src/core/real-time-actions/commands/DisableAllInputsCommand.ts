import { RealTimeAction } from '../RealTimeAction';

export class DisableAllInputsCommand extends RealTimeAction {
  private anura: any;

  constructor(anura: any) {
    super();
    this.anura = anura;
  }

  execute(): void {
    this.anura.getLib().actions.disableInputs();
  }
}