interface AnuraSettings {
  script: ScriptSettings,
  fallbacks: FallbackSettings,
  realTimeActions: RealTimeSettings,
  serverActions: ServerSettings
}

interface ScriptSettings {
  instanceId: string,
  sourceMethod: string,
  sourceValue: string,
  campaignMethod: string,
  campaignValue: string,
  callbackFunction: string,
  additionalData: string[],
};

interface FallbackSettings {
  sources: string[],
  campaigns: string[],
}

interface RedirectAction {
  resultCondition: string,
  redirectURL: string,
  webCrawlersAllowed: boolean
}

interface RealTimeAction {
  name: string,
  resultCondition: string,
}

interface RealTimeSettings {
  redirectAction: RedirectAction,
  actions: RealTimeAction[],
  retryDurationSeconds: number,
  stopAfterFirstElement: boolean
}

interface ServerSettings {
  addHeaders: boolean,
  headerPriority: string
}