/**
 * Note: This file must contain all JavaScript from within the /js directory of the plugin.
 */

// == Anura Script
(function(){
  var anuraScriptOptions = JSON.parse(anuraOptions).script;
  
  var request = {
   instance: anuraScriptOptions.instanceId,
   callback: "anuraWPCallback"
  };

  if (anuraScriptOptions.source) {
   request.source = anuraScriptOptions.source;
  }

  if (anuraScriptOptions.campaign) {
   request.campaign = anuraScriptOptions.campaign;
  }
  
  if (containsAdditionalData(anuraScriptOptions.additionalData)){
   request.additional = toAdditionalDataString(anuraScriptOptions.additionalData);
  }  

  var anura = document.createElement('script');
  if ('object' === typeof anura) {
      var params = [];
      for (var x in request) params.push(x+'='+encodeURIComponent(request[x]));
      params.push(Math.floor(1E12*Math.random()+1));
      anura.type = 'text/javascript';
      anura.async = true;
      anura.src = 'https://script.anura.io/request.js?'+params.join('&');
      var script = document.getElementsByTagName('script')[0];
      script.parentNode.insertBefore(anura, script);
  }
})();

function toAdditionalDataString(additionalData) {
   var additionalDataObj = {};
   for (let i = 0; i < additionalData.length; i++) {
      additionalDataObj[i+1] = additionalData[i];
   }

   return JSON.stringify(additionalDataObj);
}

function containsAdditionalData(additionalData) {
   for (let i = 0; i < additionalData.length; i++) {
      if (additionalData[i]) {
         return true;
      }
   }

   return false;
}

if (!window.JSON) {
  window.JSON = {
     parse: function(sJSON) {
        return eval("(" + sJSON + ")");
     },
     stringify: (function() {
        var toString = Object.prototype.toString;
        var isArray = Array.isArray || function(a) {
           return toString.call(a) === "[object Array]";
        };
        var escMap = {
           "\b": "\\b",
           "\f": "\\f",
           "\n": "\\n",
           "\r": "\\r",
           "\t": "\\t"
        };
        var escFunc = function(m) {
           return escMap[m];
        };
        var escRE = /[\\"\u0000-\u001F\u2028\u2029]/g;
        return function stringify(value) {
           if (value === null) {
              return "null";
           } else if (typeof value === "number") {
              return isFinite(value) ? value.toString() : "null";
           } else if (typeof value === "boolean") {
              return value.toString();
           } else if (typeof value === "object") {
              if (typeof value.toJSON === "function") {
                 return stringify(value.toJSON());
              } else if (isArray(value)) {
                 var res = "[";
                 for (var i = 0; i < value.length; i++) res += (i ? ", " : "") + stringify(value[i]);
                 return res + "]";
              } else if (toString.call(value) === "[object Object]") {
                 var tmp = [];
                 for (var k in value) {
                    if (value.hasOwnProperty(k)) tmp.push(stringify(k) + ": " + stringify(value[k]));
                 }
                 return "{" + tmp.join(", ") + "}";
              }
           }
           return "\"" + value.toString().replace(escRE, escFunc) + "\"";
        };
     })()
  };
}
// == End Anura Script

// == Anura Callbacks
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
  performRealTimeActions();
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
// == End Anura Callbacks

// == Real Time Actions
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
// == End Real Time Actions

// == Real Time Action Commands
class ActionCommandFactory {
  create(actionName, stopAfterFirstElement, Anura) {
    switch(actionName) {
      case 'disableForms':
        return new DisableFormsCommand(stopAfterFirstElement);
      case 'disableCommentSubmits':
        return new DisableCommentSubmitsCommand(stopAfterFirstElement);
      case 'disableAllSubmits':
        return new DisableAllSubmitsCommand(stopAfterFirstElement);
      case 'disableLinks':
        return new DisableLinksCommand(stopAfterFirstElement);
      case 'disableAllInputs':
        return new DisableAllInputsCommand(Anura);
      default:
        throw new Error(`${actionName} is not a real time action.`);
    }
  }
}

class DisableAllSubmitsCommand extends RealTimeAction {
  #stopAfterFirstElement;
  constructor(stopAfterFirstElement) {
    super();
    this.#stopAfterFirstElement = Boolean(stopAfterFirstElement);
  }

  execute() {
    const submitElements = document.querySelectorAll("input[type=submit]");
    if (submitElements.length === 0) {
      return;
    }

    this.#disableElements(submitElements);
  }

  #disableElements(elements) {
    var elementsToDisable = (stopAfterFirstElement) ? 1 : elements.length;
  
    for (var i = 0; i < elementsToDisable; i++) {
      elements[i].disabled = true;
      if (this.#stopAfterFirstElement) {
        return;
      }
    }
  }
}

class DisableCommentSubmitsCommand extends RealTimeAction {
  #stopAfterFirstElement;
  constructor(stopAfterFirstElement) {
    super();
    this.#stopAfterFirstElement = Boolean(stopAfterFirstElement);
  }

  execute() {
    const submitElements = document.querySelectorAll("#commentform > .form-submit > input#submit");
    if (submitElements.length === 0) {
      return;
    }

    this.#disableElements(submitElements);
  }

  #disableElements(elements) {
    var elementsToDisable = (stopAfterFirstElement) ? 1 : elements.length;
  
    for (var i = 0; i < elementsToDisable; i++) {
      elements[i].disabled = true;
      if (this.#stopAfterFirstElement) {
        return;
      }
    }
  }
}

class DisableFormsCommand extends RealTimeAction {
  #stopAfterFirstElement;
  constructor(stopAfterFirstElement) {
    super();
    this.#stopAfterFirstElement = Boolean(stopAfterFirstElement);
  }

  execute() {
    const formElements = document.getElementsByTagName("form");
    if (formElements.length === 0) {
      return;
    }

    this.#disableElements(formElements);
  }

  #disableElements(elements) {
    var elementsToDisable = (stopAfterFirstElement) ? 1 : elements.length;
    
    for (var i = 0; i < elementsToDisable; i++) {
      elements[i].disabled = true;
      if (this.#stopAfterFirstElement) {
        return;
      }
    }
  }
}

class DisableLinksCommand extends RealTimeAction {
  #stopAfterFirstElement;
  constructor(stopAfterFirstElement) {
    super();
    this.#stopAfterFirstElement = Boolean(stopAfterFirstElement);
  }

  execute() {
    const links = document.getElementsByTagName("a");
    if (links.length === 0) {
      return;
    }

    this.#disableElements(links);
  } 
  
  #disableElements(elements) {
    var elementsToDisable = (stopAfterFirstElement) ? 1 : elements.length;
  
    for (var i = 0; i < elementsToDisable; i++) {
      elements[i].disabled = true;
      if (this.#stopAfterFirstElement) {
        return;
      }
    }
  }
}

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
// == End Real Time Action Commands