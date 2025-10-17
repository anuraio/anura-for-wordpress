import type { ActionCommandFactory } from './real-time-actions/ActionCommandFactory';

interface RealTimeAction {
  name: string;
  resultCondition: string;
}

interface AnuraResult {
  isWarning(): boolean;
  isBad(): boolean;
  getRuleSets(): string[];
}

declare global {
  interface Window {
    ActionCommandFactory: typeof ActionCommandFactory;
  }
}

const realTimeActions = window.anuraOptions.realTimeActions;

const stopAfterFirstElement: boolean = Boolean(realTimeActions.stopAfterFirstElement);
const retryDuration: number = Number(realTimeActions.retryDurationSeconds);
const retryInterval: number = 200;

export function performRealTimeActions(): void {
  const anuraObj: AnuraResult = window.Anura.getAnura();
  if (shouldRedirectTraffic(anuraObj) && realTimeActions.redirectAction.redirectURL) {
    redirect(realTimeActions.redirectAction.redirectURL);
  }

  const actionsToPerform = getActionsToPerform();
  if (actionsToPerform.length === 0) {
    return;
  }

  const retryDurationMillis: number = retryDuration * 1000;
  const startTime: number = new Date().getTime();
  const endTime: number = startTime + retryDurationMillis;

  const actionInterval = window.setInterval(function() {
    const currentTime: number = new Date().getTime();
    if (currentTime >= endTime) {
      clearInterval(actionInterval);
    }

    for (let i = 0; i < actionsToPerform.length; i++) {
      actionsToPerform[i].execute();
    }

    if (stopAfterFirstElement) {
      clearInterval(actionInterval);
    }
  }, 200);
}

function getActionsToPerform(): any[] {
  const anuraObj: AnuraResult = window.Anura.getAnura();
  const actionsToPerform: any[] = [];
  const actions = realTimeActions.actions.filter(action => action.name !== 'protectLogin');
  const commandFactory = new window.ActionCommandFactory();

  for (const action of actions) {
    if (shouldPerformAction(action.name, anuraObj)) {
      try {
        const command = commandFactory.create(action.name, stopAfterFirstElement, window.Anura);
        actionsToPerform.push(command);
      } catch (e) {}
    }
  }

  return actionsToPerform;
}

function shouldPerformAction(actionName: string, anura: AnuraResult): boolean {
  const action = realTimeActions.actions.find(a => a.name === actionName);

  if (!action) {
    return false;
  }

  const actionConditions = getActionConditions(action);

  return ((actionConditions.onWarning && anura.isWarning()) ||
          (actionConditions.onBad && anura.isBad()));
}

function getActionConditions(action: RealTimeAction): ActionCondition {
  const actionConditions = new ActionCondition();

  switch (action.resultCondition) {
    case "onWarning":
      actionConditions.onWarning = true;
      break;
    case "onBad":
      actionConditions.onBad = true;
      break;
    case "onBoth":
      actionConditions.onWarning = true;
      actionConditions.onBad = true;
      break;
    default:
      actionConditions.onWarning = false;
      actionConditions.onBad = false;
  }

  return actionConditions;
}

function isWebCrawler(ruleSets: string[]): boolean {
  try {
    return ruleSets.indexOf("WC") !== -1;
  } catch (e) {
    return false;
  }
}

function redirect(redirectURL: string): void {
  const currentPageURL: string = window.location.href;
  if (currentPageURL !== redirectURL) window.location.href = redirectURL;
}

function shouldRedirectTraffic(anura: AnuraResult): boolean {
  const ruleSets: string[] = anura.getRuleSets();

  if (realTimeActions.redirectAction.webCrawlersAllowed && isWebCrawler(ruleSets)) {
    return false;
  }

  const redirectConditions = getActionConditions(realTimeActions.redirectAction as any);

  return ((redirectConditions.onWarning && anura.isWarning()) ||
          (redirectConditions.onBad && anura.isBad()));
}

class ActionCondition {
  onWarning: boolean = false;
  onBad: boolean = false;
}

window.performRealTimeActions = performRealTimeActions;

export {};