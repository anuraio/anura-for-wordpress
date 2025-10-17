import { TagConfig, TagDeploymentStrategy } from "../types";

export class TagDeploymentManager {
  constructor(
    private strategies: TagDeploymentStrategy[],
    private tagConfigs: TagConfig[]
  ) {}

  handleGoodResult(): void {
    this.strategies.forEach((strategy) => {
      strategy.deploy(this.tagConfigs);
    });
  }
}
