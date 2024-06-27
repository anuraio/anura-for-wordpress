function anuraWPCallback() {
  if (!Anura.getAnura().getId()) {
    return;
  }
  
  if (isUsingActions()) {
    Anura.getAnura().queryResult(resultCallback);
    return;
  }

  callUsersCallbackFunction();
}

function resultCallback() {
  var anura = Anura.getAnura();
  performRealTimeActions(anura);
  callUsersCallbackFunction();
}

function isUsingActions() {
  var realTimeActions = JSON.parse(anuraOptions).realTimeActions;
  if (realTimeActions.redirectAction.resultCondition !== 'noRedirect') {
    return true;
  }

  var actions = realTimeActions.actions;
  for (let i = 0; i < actions.length; i++) {
    if (actions[i].resultCondition !== 'noDisable') {
      return true;
    }
  }

  return false;
}

function callUsersCallbackFunction() {
  var anuraScriptOptions = JSON.parse(anuraOptions).script;
  
  if (typeof window[anuraScriptOptions.callbackFunction] === "function") {
    window[anuraScriptOptions.callbackFunction]();
  }
}