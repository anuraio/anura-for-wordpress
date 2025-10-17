import { TagDeploymentFactory } from "./TagDeploymentFactory";

declare global {
  interface Window {
    TagDeploymentFactory: typeof TagDeploymentFactory
  }
}

window.TagDeploymentFactory = TagDeploymentFactory;

export {};