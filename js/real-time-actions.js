var realTimeActions = JSON.parse(anuraOptions).realTimeActions;
var stopAfterFirstElement = Boolean(realTimeActions.stopAfterFirstElement);
var retryDuration = Number(realTimeActions.retryDurationSeconds);
var retryInterval = 200;

/**
 * Performs all real-time actions that the user has activated 
 * according to their configurations
 * @param {object} anuraObj 
 */
function performRealTimeActions() {
  var anuraObj = Anura.getAnura();
  if (shouldRedirectTraffic(anuraObj)) {
    redirect(realTimeActions.redirectAction.redirectURL);
  }

  const actionsToPerform = getActionsToPerform();
  if (actionsToPerform.length === 0) {
    return;
  }

  const retryDurationMillis = retryDuration * 1000;
  let startTime = new Date().getTime();
  let endTime = startTime + retryDurationMillis;

  const actionInterval = window.setInterval(function() {
    let currentTime = new Date().getTime();
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
/**
 * Gets all Real-Time Actions that the user has activated.  
 * @param {object} anura 
 * @returns {Array<RealTimeAction>} an array of RealTimeActions
 */
function getActionsToPerform() {
  const anuraObj = Anura.getAnura();
  const actionsToPerform = [];
  const actions = realTimeActions.actions;
  const commandFactory = new ActionCommandFactory();

  for (const action of actions) {
    if (shouldPerformAction(action.name, anuraObj)) {
      const command = commandFactory.create(action.name, stopAfterFirstElement, Anura);
      actionsToPerform.push(command);
    } 
  }

  return actionsToPerform;
}

/**
 * @param {string} actionName The name of the real-time action.
 * @param {anura} anura The Anura object.
 * @returns {boolean} Whether or not to perform the given action.
 */
function shouldPerformAction(actionName, anura) {
  const action = realTimeActions.actions.find(a => {
    return a.name === actionName
  });

  if (!action) {
    return false;
  } 

  const actionConditions = getActionConditions(action);

  return ((actionConditions.onWarning && anura.isWarning()) ||
          (actionConditions.onBad && anura.isBad()));
}

/** 
 * @param {object} action
 * @returns {ActionCondition} A pair of boolean values dictating whether 
 * the action should be performed on warning and/or bad results.
 */
function getActionConditions(action) {
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

/**
 * Returns whether or not the visitor is a Web Crawler.
 * @param {object} responseObj The Anura response object
 * @returns {boolean}
 */
function isWebCrawler(ruleSets) {
  try {
    return ruleSets.indexOf("WC") !== -1;
  } catch (e) {
    return false
  }
}

/**
 * Redirects visitor to the provided URL.
 * @param {string} redirectURL The URL to redirect the visitor to
 */
function redirect(redirectURL) {
  var currentPageURL = window.location.href;
  if (currentPageURL !== redirectURL) window.location.href = redirectURL;
}

/**
 * Returns whether or not a visitor meets the conditions to be redirected.
 * @param {object} anuraResult The Anura result 
 * @returns {boolean}
 */
function shouldRedirectTraffic(anura) {
  var ruleSets = anura.getRuleSets();

  if (realTimeActions.redirectAction.webCrawlersAllowed && isWebCrawler(ruleSets)) {
    return false;
  }

  var redirectConditions = getActionConditions(realTimeActions.redirectAction);

  return ((redirectConditions.onWarning && anura.isWarning()) || 
          (redirectConditions.onBad && anura.isBad()));
}

/**
 * Collection of boolean values that determine which conditions 
 * should a real-time action be executed.
 */
class ActionCondition {
  onWarning = false;
  onBad = false;
}

/**
 * An abstract class used by real-time actions to ensure they all follow 
 * the same format (Command pattern). Using an abstract class because JavaScript does not 
 * have interfaces. Feel free to read more about the Command pattern 
 * {@link https://refactoring.guru/design-patterns/command/typescript/example here.}
 */
class RealTimeAction {
  constructor() {
    if (this.constructor === RealTimeAction) {
      throw new Error("RealTimeAction class cannot be instantiated as it is an abstract class.");
    }
  }

  execute() {
    throw new Error("Method 'execute()' must be implemented.");
  }
}