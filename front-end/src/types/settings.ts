type TrafficDetailMethod = 'none' | 'get' | 'post' | 'hardCoded';

export interface ExclusionAudience {
  id: string;
  platform: string;
  fields: Record<string, string>; // Dynamic fields based on platform
  isActive: boolean;
  label?: string;
}

export interface AnuraSettings {
  instanceId: string;
  sourceMethod: TrafficDetailMethod;
  sourceVariable: string;
  campaignMethod: TrafficDetailMethod;
  campaignVariable: string;
  callbackFunction: string;
  additionalData: string[];
  exclusionAudiences: ExclusionAudience[];
  fallbackVariables: string;
  realTimeAction: 'disabled' | 'block' | 'redirect' | 'custom';
  serverAction: 'none' | 'log_db' | 'webhook' | 'email';
}