import { RequestTrigger } from "../types";

export function shouldTriggerAnuraScript(requestTriggerSettings: { enabled: boolean; triggers: RequestTrigger[] }): boolean {
  if (!requestTriggerSettings.enabled) {
    return true;
  }

  const enabledTriggers = requestTriggerSettings.triggers.filter(trigger => trigger.enabled);
  if (enabledTriggers.length === 0) {
    return true;
  }

  const currentUrl = window.location.href;
  const currentPath = window.location.pathname;
  const currentSearch = window.location.search;

  for (const trigger of enabledTriggers) {
    try {
      const pattern = new RegExp(`\\b${trigger.pattern}\\b`, "i");
      let testValue = "";
      
      switch (trigger.type) {
        case "url":
          testValue = currentUrl;
          break;
        case "path":
          testValue = currentPath;
          break;
        case "queryParam":
          testValue = currentSearch;
          break;
      }

      const matches = pattern.test(testValue);
      
      if (trigger.condition === "contains" && matches) {
        return true;
      } else if (trigger.condition === "doesNotContain" && !matches) {
        return true;
      }
    } catch (e) {
      return false;
    }
  }

  return false;
}