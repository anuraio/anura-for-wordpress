import { TagDeploymentManager } from "../retargeting-protection/TagDeploymentManager";
import { AnuraResult } from "../types";
import {
  hasExclusionAudiences,
  addExclusionAudiences,
} from "./exclusion-audiences";
import { handleLoginPageCallback } from "./login-protection";
import { performRealTimeActions } from "./real-time-actions";

interface AnuraGlobal {
  getAnura(): AnuraResult;
}

declare global {
  interface Window {
    Anura: AnuraGlobal;
    TagDeploymentManager?: TagDeploymentManager;
    anuraWPCallback: () => void;
    resultCallback?: () => void;
    isUsingActions?: () => boolean;
    hasExclusionAudiences?: () => boolean;
    [key: string]: any;
  }
}

function anuraWPCallback(): void {
  if (!window.Anura.getAnura().getId()) {
    return;
  }

  const options = window.anuraOptions;

  const onLoginPage = options.context === "login";
  if (onLoginPage) {
    handleLoginPageCallback();
    return;
  }

  const hasProtectedTags =
    options.social.retargetingProtection &&
    options.social.retargetingProtection.length > 0;
  const hasContentDeployment = options.advanced.contentDeployment.enabled;

  if (window.TagDeploymentFactory) {
    if (hasProtectedTags && options.social.retargetingProtection) {
      window.TagDeploymentManager = window.TagDeploymentFactory.createManager(
        options.social.retargetingProtection
      );
    }
  }

  if (
    isUsingActions() ||
    hasExclusionAudiences() ||
    hasProtectedTags ||
    hasContentDeployment
  ) {
    window.Anura.getAnura().queryResult(resultCallback);
    return;
  }

  callUsersCallbackFunction();
}

function resultCallback(): void {
  performRealTimeActions();
  addExclusionAudiences();

  const anuraResult = window.Anura.getAnura();

  if (anuraResult.isGood()) {
    executeContentDeployment();

    if (window.TagDeploymentManager) {
      window.TagDeploymentManager.handleGoodResult();
    }
  }

  callUsersCallbackFunction();
}
function executeContentDeployment(): void {
  const options = window.anuraOptions;
  const contentDeployment = options.advanced?.contentDeployment;

  if (!contentDeployment.enabled) {
    return;
  }

  const userCode = contentDeployment.javascript;
  if (!userCode || userCode.trim() === "") {
    return;
  }

  const executeUserCode = new Function(userCode);
  executeUserCode();
}

function isUsingActions(): boolean {
  const realTimeActions = window.anuraOptions.realTimeActions;

  if (realTimeActions.redirectAction.resultCondition !== "noRedirect") {
    return true;
  }

  const actions = realTimeActions.actions;
  for (let i = 0; i < actions.length; i++) {
    if (
      actions[i].name !== "protectLogin" &&
      actions[i].resultCondition !== "noDisable"
    ) {
      return true;
    }
  }

  return false;
}

function callUsersCallbackFunction(): void {
  const anuraScriptOptions = window.anuraOptions.script;

  if (typeof window[anuraScriptOptions.callbackFunction] === "function") {
    window[anuraScriptOptions.callbackFunction as string]();
  }
}

window.anuraWPCallback = anuraWPCallback;
window.resultCallback = resultCallback;
window.isUsingActions = isUsingActions;

export {};
