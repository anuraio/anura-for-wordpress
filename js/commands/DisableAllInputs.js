class DisableAllInputsCommand extends RealTimeAction {
  #anura;

  constructor(anura) {
    super();
    this.#anura = anura;
  }

  execute() {
    this.#anura.getLib().actions.disableInputs();
  }
}